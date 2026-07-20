import os
import json
import re
import uuid
from typing import Optional
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference

load_dotenv()

# ── App ─────────────────────────────────────────────────────────────────────

app = FastAPI(title="PlotWeaver Backend")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Clients (lazily validated so the app starts even without env vars) ───────

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        raise HTTPException(status_code=503, detail="Supabase env vars not configured.")
    return create_client(url, key)


def get_granite_model() -> ModelInference:
    api_key = os.getenv("WATSONX_API_KEY", "")
    project_id = os.getenv("WATSONX_PROJECT_ID", "")
    url = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    if not api_key or not project_id:
        raise HTTPException(status_code=503, detail="IBM watsonx.ai env vars not configured.")

    credentials = Credentials(api_key=api_key, url=url)
    return ModelInference(
        model_id="openai/gpt-oss-120b",
        credentials=credentials,
        project_id=project_id,
        params={
            "max_new_tokens": 1200,
            "temperature": 0.2,
            "repetition_penalty": 1.1,
        },
    )


# ── Pydantic models ──────────────────────────────────────────────────────────

class StoryBeat(BaseModel):
    id: str
    title: str
    summary: str
    location: str
    timelineOrder: int
    characterNames: list[str] = []


class Character(BaseModel):
    id: str
    name: str
    description: str


class WorldRule(BaseModel):
    id: str
    title: str
    description: str


class AnalyzeRequest(BaseModel):
    story_id: str
    beats: list[StoryBeat]
    characters: list[Character]
    world_rules: list[WorldRule]


class AIInsight(BaseModel):
    id: str
    story_id: str
    node_id: Optional[str]
    insight_type: str        # "continuity" | "world_rule" | "character" | "plot_hole" | "pacing"
    content: str
    status: str              # "unresolved"
    created_at: str


class AnalyzeResponse(BaseModel):
    insights: list[AIInsight]
    summary: str


class ResolveRequest(BaseModel):
    insight_id: str


class BrainstormRequest(BaseModel):
    insight_content: str     # The specific issue to brainstorm fixes for
    beats: list[StoryBeat]
    characters: list[Character]
    world_rules: list[WorldRule]


class BrainstormSuggestion(BaseModel):
    title: str               # Short label, e.g. "Reorder the beats"
    description: str         # 1–3 sentence actionable suggestion


class BrainstormResponse(BaseModel):
    suggestions: list[BrainstormSuggestion]


class ExportRequest(BaseModel):
    story_id: str
    beats: list[StoryBeat]


class ChapterSummary(BaseModel):
    beat_id: str
    timeline_order: int
    title: str
    summary: str             # AI-generated chapter paragraph


class ExportResponse(BaseModel):
    chapters: list[ChapterSummary]
    outline: str             # Full outline as a single formatted string


# ── Prompt builder ───────────────────────────────────────────────────────────

def build_analysis_prompt(
    beats: list[StoryBeat],
    characters: list[Character],
    world_rules: list[WorldRule],
) -> str:
    beats_text = "\n".join(
        f"  Beat #{b.timelineOrder} [id:{b.id}] \"{b.title}\" @ {b.location or 'unknown'}\n"
        f"    Characters: {', '.join(b.characterNames) or 'none'}\n"
        f"    Summary: {b.summary or 'No summary.'}"
        for b in sorted(beats, key=lambda x: x.timelineOrder)
    )

    chars_text = "\n".join(
        f"  - {c.name} [id:{c.id}]: {c.description or 'No description.'}"
        for c in characters
    ) or "  (none)"

    rules_text = "\n".join(
        f"  - \"{r.title}\" [id:{r.id}]: {r.description}"
        for r in world_rules
    ) or "  (none)"

    return f"""<|system|>
You are an advanced narrative intelligence agent tasked with performing deep continuity and structural audits on story bibles. Your goal is to find subtle logical gaps, formatting slip-ups, world-building contradictions, and character entity mismatches.

CRITICAL EVALUATION PILLARS:
1. Strict Identity Tracking: Audit every name used in the story beat summaries against the exact keys defined in the CHARACTERS block. If a beat uses an unmapped name, reference, or alias (e.g., calling an untagged character "Henry" when only "Rabbit" and "Turtle" exist), flag it instantly as a "character" or "continuity" issue.
2. World-Rule Interaction: Ensure character actions align with the physical constraints of the WORLD RULES. Recognize cause-and-effect relationships (e.g., if a rule says an action causes exhaustion, a character collapsing or sleeping is an expected narrative consequence, not a contradiction).
3. Spatial & Environmental Context: Evaluate the plausibility of events based on locations. If a scene relies on hidden actions or blind spots (like sneaking past someone unnoticed), verify if the text provides enough environmental justification (like physical cover or camouflage) to make the beat logical.

You must respond with a JSON array (and nothing else). Each element must have exactly these keys:
- "node_id": the bare UUID of the beat this issue belongs to (string, copy only the UUID from the [id:...] shown — do NOT include the "id:" prefix), or null if it applies to the overall story
- "insight_type": one of "continuity", "world_rule", "character", "plot_hole", "pacing"
- "content": a concise, actionable description of the specific issue (1-3 sentences)

If there are NO issues, return an empty array: []
<|user|>
STORY BEATS (in timeline order):
{beats_text}

CHARACTERS:
{chars_text}

WORLD RULES:
{rules_text}

Analyse the story and return only the JSON array of issues.
<|assistant|>
"""


def build_brainstorm_prompt(
    insight_content: str,
    beats: list[StoryBeat],
    characters: list[Character],
    world_rules: list[WorldRule],
) -> str:
    beats_text = "\n".join(
        f"  Beat #{b.timelineOrder} \"{b.title}\" @ {b.location or 'unknown'}: {b.summary or 'No summary.'}"
        for b in sorted(beats, key=lambda x: x.timelineOrder)
    ) or "  (none)"

    chars_text = ", ".join(c.name for c in characters) or "none"
    rules_text = "\n".join(f"  - \"{r.title}\": {r.description}" for r in world_rules) or "  (none)"

    return f"""<|system|>
You are a creative story consultant. A writer has identified the following issue in their story and needs concrete, creative suggestions to fix it. Provide exactly 3 suggestions.

You must respond with a JSON array (and nothing else). Each element must have exactly these keys:
- "title": a short label for the suggestion (5 words or fewer)
- "description": 1–3 sentences explaining the specific fix or alternative direction

Return only the JSON array. No extra text.
<|user|>
IDENTIFIED ISSUE:
{insight_content}

STORY BEATS (in order):
{beats_text}

CHARACTERS: {chars_text}

WORLD RULES:
{rules_text}

Suggest 3 creative ways the writer can fix or work around this issue.
<|assistant|>
"""


def build_export_prompt(beats: list[StoryBeat]) -> str:
    beats_text = "\n\n".join(
        f"Chapter {b.timelineOrder}: \"{b.title}\"\n"
        f"Location: {b.location or 'unspecified'}\n"
        f"Characters: {', '.join(b.characterNames) or 'none'}\n"
        f"Events: {b.summary or 'No summary provided.'}"
        for b in sorted(beats, key=lambda x: x.timelineOrder)
    )

    return f"""<|system|>
You are a professional story editor writing a structured story outline. For each chapter provided, write a single polished paragraph (3–5 sentences) that summarises what happens, reads like a real chapter summary, and could appear in a published story bible.

You must respond with a JSON array (and nothing else). Each element must have exactly these keys:
- "beat_id": the exact beat id string provided in brackets
- "summary": the polished chapter summary paragraph

Return only the JSON array.
<|user|>
{chr(10).join(
    f'[beat_id: {b.id}] Chapter {b.timelineOrder}: "{b.title}" — {b.summary or "No summary."}'
    for b in sorted(beats, key=lambda x: x.timelineOrder)
)}

Write a polished chapter summary for every chapter above.
<|assistant|>
"""


# ── Helpers ──────────────────────────────────────────────────────────────────

def extract_json_array(raw: str) -> list[dict]:
    """Extract the first JSON array from a possibly noisy LLM response."""
    # Try direct parse first
    stripped = raw.strip()
    try:
        result = json.loads(stripped)
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass

    # Find the first [...] block
    match = re.search(r'\[.*\]', stripped, re.DOTALL)
    if match:
        try:
            result = json.loads(match.group())
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass

    return []


VALID_TYPES = {"continuity", "world_rule", "character", "plot_hole", "pacing"}


def parse_insights(raw_items: list[dict], story_id: str) -> list[dict]:
    """Validate and normalise raw LLM output into db-ready insight dicts."""
    result = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue
        content = str(item.get("content", "")).strip()
        if not content:
            continue
        insight_type = str(item.get("insight_type", "continuity")).lower()
        if insight_type not in VALID_TYPES:
            insight_type = "continuity"
        node_id = item.get("node_id") or None
        if node_id:
            node_id = str(node_id).strip()
            # Strip "id:" prefix if the model included it (e.g. "id:uuid" → "uuid")
            if node_id.startswith("id:"):
                node_id = node_id[3:].strip()
            node_id = node_id or None

        result.append({
            "id": str(uuid.uuid4()),
            "story_id": story_id,
            "node_id": node_id,
            "insight_type": insight_type,
            "content": content,
            "status": "unresolved",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    return result


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/api/data")
async def get_data():
    return {"status": "success", "message": "Hello from the PlotWeaver backend!"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_story(request: AnalyzeRequest):
    """
    Run IBM Granite AI analysis on the story canvas.

    1. Build a structured prompt from beats, characters, and world rules.
    2. Call IBM Granite 3.3-8B Instruct via watsonx.ai.
    3. Parse the JSON array response into ai_insights rows.
    4. Clear previous unresolved insights for this story, then insert new ones.
    5. Return the insights list plus a plain-English summary.
    """
    if not request.beats:
        return AnalyzeResponse(insights=[], summary="No story beats to analyse yet.")

    # Build prompt and call Granite
    prompt = build_analysis_prompt(request.beats, request.characters, request.world_rules)

    print("\n" + "="*60)
    print("GRANITE PROMPT [analyze]")
    print("="*60)
    print(prompt)
    print("="*60 + "\n")

    try:
        model = get_granite_model()
        response = model.generate_text(prompt=prompt)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"IBM watsonx.ai error: {exc}") from exc

    # Parse response
    raw_items = extract_json_array(response)
    insights_rows = parse_insights(raw_items, request.story_id)

    # Persist to Supabase
    db = get_supabase()

    # Delete previous unresolved insights for this story before inserting fresh ones
    db.table("ai_insights").delete().eq("story_id", request.story_id).eq("status", "unresolved").execute()

    if insights_rows:
        db.table("ai_insights").insert(insights_rows).execute()

    # Build response models
    insights_out = [
        AIInsight(
            id=r["id"],
            story_id=r["story_id"],
            node_id=r["node_id"],
            insight_type=r["insight_type"],
            content=r["content"],
            status=r["status"],
            created_at=r["created_at"],
        )
        for r in insights_rows
    ]

    count = len(insights_out)
    if count == 0:
        summary = "No issues found — your story looks consistent!"
    elif count == 1:
        summary = "Found 1 issue. Review it below."
    else:
        summary = f"Found {count} issues. Review them below."

    return AnalyzeResponse(insights=insights_out, summary=summary)


@app.get("/api/insights/{story_id}", response_model=list[AIInsight])
async def get_insights(story_id: str, status: Optional[str] = None):
    """
    Fetch ai_insights for a story from Supabase.
    Optional ?status=unresolved|resolved filter.
    """
    db = get_supabase()
    query = db.table("ai_insights").select("*").eq("story_id", story_id)
    if status:
        query = query.eq("status", status)
    result = query.order("created_at", desc=True).execute()
    return result.data or []


@app.patch("/api/insights/{insight_id}/resolve")
async def resolve_insight(insight_id: str):
    """Mark a single ai_insight as resolved."""
    db = get_supabase()
    result = (
        db.table("ai_insights")
        .update({"status": "resolved"})
        .eq("id", insight_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Insight not found.")
    return {"status": "resolved", "id": insight_id}


@app.post("/api/brainstorm", response_model=BrainstormResponse)
async def brainstorm(request: BrainstormRequest):
    """
    Given a specific story issue, ask Granite for 3 creative fix suggestions.

    Returns a list of BrainstormSuggestion objects (title + description).
    Does not write to the database — suggestions are ephemeral UI state.
    """
    prompt = build_brainstorm_prompt(
        request.insight_content,
        request.beats,
        request.characters,
        request.world_rules,
    )

    print("\n" + "="*60)
    print("GRANITE PROMPT [brainstorm]")
    print("="*60)
    print(prompt)
    print("="*60 + "\n")

    try:
        model = get_granite_model()
        response = model.generate_text(prompt=prompt)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"IBM watsonx.ai error: {exc}") from exc

    raw_items = extract_json_array(response)

    suggestions: list[BrainstormSuggestion] = []
    for item in raw_items:
        if not isinstance(item, dict):
            continue
        title = str(item.get("title", "")).strip()
        description = str(item.get("description", "")).strip()
        if title and description:
            suggestions.append(BrainstormSuggestion(title=title, description=description))

    return BrainstormResponse(suggestions=suggestions[:3])


@app.post("/api/export/summaries", response_model=ExportResponse)
async def export_summaries(request: ExportRequest):
    """
    Generate AI chapter summaries for every story beat and return a full outline.

    1. Call Granite with all beats to get a polished paragraph per chapter.
    2. Merge AI summaries with the original beat data.
    3. Assemble a plain-text outline string for immediate download/copy.
    """
    if not request.beats:
        return ExportResponse(chapters=[], outline="No story beats to export.")

    sorted_beats = sorted(request.beats, key=lambda b: b.timelineOrder)
    beat_map = {b.id: b for b in sorted_beats}

    prompt = build_export_prompt(sorted_beats)

    print("\n" + "="*60)
    print("GRANITE PROMPT [export]")
    print("="*60)
    print(prompt)
    print("="*60 + "\n")

    try:
        model = get_granite_model()
        response = model.generate_text(prompt=prompt)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"IBM watsonx.ai error: {exc}") from exc

    raw_items = extract_json_array(response)

    # Build a lookup of beat_id → AI summary
    ai_summary_map: dict[str, str] = {}
    for item in raw_items:
        if isinstance(item, dict):
            bid = str(item.get("beat_id", "")).strip()
            summary = str(item.get("summary", "")).strip()
            if bid and summary:
                ai_summary_map[bid] = summary

    chapters: list[ChapterSummary] = []
    for beat in sorted_beats:
        chapters.append(
            ChapterSummary(
                beat_id=beat.id,
                timeline_order=beat.timelineOrder,
                title=beat.title,
                summary=ai_summary_map.get(beat.id, beat.summary or "No summary available."),
            )
        )

    # Build plain-text outline
    outline_lines: list[str] = ["STORY OUTLINE", "=" * 40, ""]
    for ch in chapters:
        outline_lines.append(f"Chapter {ch.timeline_order}: {ch.title}")
        outline_lines.append("-" * len(f"Chapter {ch.timeline_order}: {ch.title}"))
        outline_lines.append(ch.summary)
        outline_lines.append("")

    return ExportResponse(chapters=chapters, outline="\n".join(outline_lines))
