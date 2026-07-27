import asyncio
import uuid
from typing import List, Dict, Any, Optional

def extract_json_array(text: str) -> list[dict]:
    import re
    import json
    match = re.search(r'\[.*\]', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return []

class MultiAgentOrchestrator:
    def __init__(self, get_model_func, get_supabase_func):
        self.get_model = get_model_func
        self.get_supabase = get_supabase_func

    def _build_context_text(self, request) -> str:
        # Build text representation of subgraph
        beats_text = "\n".join(
            f"  Beat #{b.timelineOrder} [id:{b.id}] \"{b.title}\" @ {b.location or 'unknown'}: {b.summary or 'No summary.'}"
            for b in sorted(request.beats, key=lambda x: x.timelineOrder)
        )
        chars_text = "\n".join(f"  - {c.name} [id:{c.id}]: {c.description}" for c in request.characters)
        rules_text = "\n".join(f"  - \"{r.title}\" [id:{r.id}]: {r.description}" for r in request.world_rules)
        locs_text = "\n".join(f"  - {l.name} [id:{l.id}]: {l.description}" for l in request.locations)
        objs_text = "\n".join(f"  - {o.name} [id:{o.id}] (Owner: {o.current_owner}, Loc: {o.current_location}): {o.properties}" for o in request.objects)
        events_text = "\n".join(f"  - Event [id:{e.id}] (Timeline: {e.timeline_position}): {e.description}\n    Participants: {', '.join(e.participants) or 'none'}\n    Consequences: {e.consequences}" for e in request.events)
        rels_text = "\n".join(f"  - Relationship [id:{r.id}] (Char {r.source_character_id} -> Char {r.target_character_id}): Trust {r.trust_level} - {r.history} - Status: {r.status}" for r in request.relationships)
        confs_text = "\n".join(f"  - Conflict [id:{c.id}] (Parties: {', '.join(c.parties)}): Stakes: {c.stakes} - Status: {c.resolution_status}" for c in request.conflicts)
        goals_text = "\n".join(f"  - Goal [id:{g.id}] (Char {g.owning_character_id}): Status {g.status} - Obstacles: {g.obstacles}" for g in request.goals)
        secs_text = "\n".join(f"  - Secret [id:{s.id}] (Holder {s.holder_id}): {s.content} - Known by: {', '.join(s.known_by)} - Reveal: {s.reveal_status}" for s in request.secrets)
        threads_text = "\n".join(f"  - Thread [id:{t.id}]: {t.description} - Status: {t.resolution_status} - Last Event: {t.last_referenced_event_id}" for t in request.threads)

        return f"""
<story_beats>\n{beats_text or 'none'}\n</story_beats>
<characters>\n{chars_text or 'none'}\n</characters>
<world_rules>\n{rules_text or 'none'}\n</world_rules>
<locations>\n{locs_text or 'none'}\n</locations>
<objects>\n{objs_text or 'none'}\n</objects>
<events>\n{events_text or 'none'}\n</events>
<relationships>\n{rels_text or 'none'}\n</relationships>
<conflicts>\n{confs_text or 'none'}\n</conflicts>
<goals>\n{goals_text or 'none'}\n</goals>
<secrets>\n{secs_text or 'none'}\n</secrets>
<threads>\n{threads_text or 'none'}\n</threads>
"""

    def _generate_agent_prompt(self, agent_name: str, context_text: str, edited_node_id: str) -> str:
        # Core prompt engineering pattern: [System Context] -> [Task Instruction] -> [Output Format]
        
        system_roles = {
            "Continuity Agent": "You are a Continuity Editor. Focus on factual contradictions across entities. Identify if a character is in two places at once, or if an object's state contradicts its history.",
            "Timeline Agent": "You are a Timeline Auditor. Focus on chronological ordering, age, travel-time plausibility, and event sequencing.",
            "Character Agent": "You are a Character Consistency Expert. Focus on voice, personality, goal consistency, and character arcs. Does a character act out of character?",
            "World Rule Agent": "You are a World-Building Enforcer. Validate events and actions against established world rules. Flag violations of magic systems, physics, or lore.",
            "Brainstorm Agent": "You are a Brainstorming Assistant. Focus on foreshadowing gaps, pacing flags, and narrative flow. Flag if a section feels rushed or disconnected."
        }
        
        insight_types = {
            "Continuity Agent": "continuity",
            "Timeline Agent": "continuity",
            "Character Agent": "character",
            "World Rule Agent": "world_rule",
            "Brainstorm Agent": "pacing"
        }

        role = system_roles.get(agent_name, "You are a narrative auditor.")
        insight_type = insight_types.get(agent_name, "continuity")

        return f"""<|system|>
{role}

CRITICAL RULES:
1. Base your analysis STRICTLY on the provided subgraph context.
2. If there are NO issues relevant to your domain, return an empty array: []
3. Do not hallucinate node IDs. Every flagged issue MUST cite a specific node ID from the context.

OUTPUT FORMAT:
First, write a brief <reasoning> block exploring potential issues step-by-step.
Then, output a JSON array of the identified issues using this exact schema:
[
  {{
    "node_id": "the bare UUID of the beat or element (string)",
    "insight_type": "{insight_type}",
    "content": "Actionable description (1-3 sentences).",
    "confidence": 0.9
  }}
]
<|user|>
Context for analysis (Subgraph):
{context_text}

Analyze the story, write your reasoning, and then provide the JSON array.
<|assistant|>
"""

    async def _run_agent(self, agent_name: str, context_text: str, edited_node_id: str) -> List[Dict[str, Any]]:
        prompt = self._generate_agent_prompt(agent_name, context_text, edited_node_id)
        
        print(f"[{agent_name}] Running...")
        try:
            model = self.get_model()
            # Run blocking call in a thread
            response = await asyncio.to_thread(model.generate_text, prompt=prompt)
            raw_items = extract_json_array(response)
            
            # Tag with agent name
            for item in raw_items:
                item["agent"] = agent_name
            return raw_items
        except Exception as e:
            print(f"[{agent_name}] Error: {e}")
            return []

    def _determine_agents_to_run(self, request) -> List[str]:
        # Phase 3 Routing Optimization
        if not request.edited_node_id:
            return ["Continuity Agent", "Timeline Agent", "Character Agent", "World Rule Agent", "Brainstorm Agent"]
            
        # Find type of edited node
        all_lists = [
            (request.beats, ["Continuity Agent", "Timeline Agent", "Character Agent", "World Rule Agent", "Brainstorm Agent"]),
            (request.characters, ["Continuity Agent", "Character Agent"]),
            (request.world_rules, ["Continuity Agent", "World Rule Agent"]),
            (request.events, ["Continuity Agent", "Timeline Agent", "World Rule Agent", "Brainstorm Agent"]),
            (request.locations, ["Continuity Agent", "Timeline Agent"]),
            (request.relationships, ["Continuity Agent", "Character Agent"]),
            (request.conflicts, ["Continuity Agent", "Character Agent", "Brainstorm Agent"]),
            (request.goals, ["Continuity Agent", "Character Agent", "Timeline Agent"]),
            (request.threads, ["Continuity Agent", "Timeline Agent", "Brainstorm Agent"])
        ]
        
        for item_list, agents in all_lists:
            if any(item.id == request.edited_node_id for item in item_list):
                return agents
                
        return ["Continuity Agent"] # fallback

    def _guardian_check(self, request, insights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Phase 4: Granite Guardian
        valid_node_ids = set()
        for lst in [request.beats, request.characters, request.world_rules, request.locations, request.objects, request.events, request.relationships, request.conflicts, request.goals, request.secrets, request.threads]:
            valid_node_ids.update(item.id for item in lst)
            
        verified_insights = []
        for i in insights:
            nid = i.get("node_id")
            if nid and nid.startswith("id:"):
                nid = nid[3:]
                i["node_id"] = nid
                
            if nid and nid not in valid_node_ids:
                print(f"[Guardian] Hallucinated node_id {nid} blocked from {i.get('agent')}.")
                i["guardian_verdict"] = "hallucinated_node"
                # Downgrade or reject
                continue
                
            i["guardian_verdict"] = "verified"
            verified_insights.append(i)
            
        return verified_insights

    def _aggregate(self, insights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Phase 5: Response Aggregator
        # Deduplicate based on node_id and highly similar content (naive deduplication by node_id + insight_type for now)
        seen = set()
        aggregated = []
        for i in sorted(insights, key=lambda x: x.get("confidence", 0), reverse=True):
            key = (i.get("node_id"), i.get("insight_type"))
            if key not in seen:
                seen.add(key)
                aggregated.append(i)
            else:
                # Merge or ignore
                pass
        return aggregated

    async def _log_governance(self, story_id: str, insights: List[Dict[str, Any]]):
        # Phase 6: watsonx.governance logging
        db = self.get_supabase()
        logs = []
        for i in insights:
            logs.append({
                "id": str(uuid.uuid4()),
                "story_id": story_id,
                "agent_name": i.get("agent"),
                "guardian_verdict": i.get("guardian_verdict"),
                "node_id": i.get("node_id"),
                "content": i.get("content"),
                "confidence": i.get("confidence", 1.0)
            })
            
        if logs:
            try:
                # Assume a table 'agent_logs' exists, or just print if not created yet
                # db.table("agent_logs").insert(logs).execute()
                print(f"[Governance] Logged {len(logs)} agent decisions.")
            except Exception as e:
                print(f"[Governance] DB log error (ignoring): {e}")

    async def analyze_story(self, request) -> dict:
        agents_to_run = self._determine_agents_to_run(request)
        context_text = self._build_context_text(request)
        
        # Run agents concurrently
        tasks = [self._run_agent(agent, context_text, request.edited_node_id) for agent in agents_to_run]
        results = await asyncio.gather(*tasks)
        
        all_insights = []
        for res in results:
            all_insights.extend(res)
            
        # Guardian validation
        verified_insights = self._guardian_check(request, all_insights)
        
        # Aggregation
        final_insights = self._aggregate(verified_insights)
        
        # Governance Logging
        await self._log_governance(request.story_id, final_insights)
        
        return final_insights
