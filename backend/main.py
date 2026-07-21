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
        model_id="ibm/granite-4-h-small",
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
You are an expert story editor and continuity checker. Analyse the story structure below and identify ONLY real, specific issues. Do NOT invent problems that are not clearly present in the data.

You must respond with a JSON array (and nothing else). Each element must have exactly these keys:
- "node_id": the beat id this issue belongs to (string, use the [id:...] shown), or null if it applies to the overall story
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
            node_id = str(node_id).strip() or None

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
# ── Export ──────────────────────────────────────────────────────────────────

def story_graph_to_markdown(beats: list[StoryBeat], characters: list[Character], world_rules: list[WorldRule]) -> str:
    """Convert story graph to markdown outline"""
    
    md = "# Story Outline\n\n"
    
    # Story Beats (sorted by timeline)
    md += "## Story Beats\n\n"
    for beat in sorted(beats, key=lambda x: x.timelineOrder):
        md += f"### Beat {beat.timelineOrder}: {beat.title}\n"
        md += f"**Location:** {beat.location}\n"
        if beat.characterNames:
            md += f"**Characters:** {', '.join(beat.characterNames)}\n"
        md += f"\n{beat.summary}\n\n"
    
    # Characters
    if characters:
        md += "## Characters\n\n"
        for char in characters:
            md += f"### {char.name}\n{char.description}\n\n"
    
    # World Rules
    if world_rules:
        md += "## World Rules\n\n"
        for rule in world_rules:
            md += f"### {rule.title}\n{rule.description}\n\n"
    
    return md


@app.post("/api/stories/export")
async def export_story(beats: list[StoryBeat], characters: list[Character], world_rules: list[WorldRule]):
    """Export story graph as markdown outline"""
    markdown = story_graph_to_markdown(beats, characters, world_rules)
    
    return {
        "status": "success",
        "format": "markdown",
        "content": markdown
    }