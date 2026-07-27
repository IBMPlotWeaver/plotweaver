import os
import json
import uuid
import re
from typing import Optional
from pydantic import BaseModel
from ibm_watsonx_ai.foundation_models import ModelInference
from main import (
    StoryBeat, Character, Location, ObjectNode, Event, 
    Relationship, Conflict, Goal, Secret, Thread, WorldRule, get_granite_model
)

class IngestionResult(BaseModel):
    beats: list[StoryBeat] = []
    characters: list[Character] = []
    world_rules: list[WorldRule] = []
    locations: list[Location] = []
    objects: list[ObjectNode] = []
    events: list[Event] = []
    relationships: list[Relationship] = []

def parse_llm_json(response_text: str) -> dict:
    import json
    import re
    import ast
    
    # Try finding markdown JSON block first
    match = re.search(r"```(?:json)?\s*(.*?)```", response_text, re.DOTALL | re.IGNORECASE)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except:
            pass

    # If no markdown block, find ALL substrings that look like JSON objects
    # and try parsing them from longest to shortest, or last to first.
    # A simple reliable heuristic: find the LAST occurrence of 'assistantfinal{' or just find all { ... } blocks.
    
    # Let's try to find blocks of { ... } by counting brackets
    blocks = []
    start_idx = -1
    brace_count = 0
    for i, char in enumerate(response_text):
        if char == '{':
            if brace_count == 0:
                start_idx = i
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0 and start_idx != -1:
                blocks.append(response_text[start_idx:i+1])
    
    # Try parsing blocks from the back (usually the final answer is at the end)
    for block in reversed(blocks):
        try:
            return json.loads(block)
        except Exception:
            try:
                return ast.literal_eval(block)
            except Exception:
                continue
                
    print("Could not find any valid JSON block in response.")
    print(f"Raw response was: {response_text}")
    return {}


def extract_entities_from_text(text: str) -> IngestionResult:
    """
    Extracts plotweaver nodes (Characters, Locations, Events, Relationships, etc.)
    from raw text or markdown using the Granite model.
    """
    model = get_granite_model()

    system_prompt = (
        "You are an expert narrative analyst and entity extraction engine. "
        "Your ONLY task is to parse text and extract narrative entities into a strict JSON structure.\n\n"
        "### JSON SCHEMA & RULES ###\n"
        "1. You MUST output a SINGLE valid JSON object.\n"
        "2. EVERY property name and string value MUST be enclosed in double quotes (e.g., \"name\": \"Elena\"). NEVER use single quotes.\n"
        "3. DO NOT include trailing commas in arrays or objects.\n"
        "4. DO NOT include any preamble, thinking steps, conversational text, or markdown before or after the JSON.\n"
        "5. The JSON must exactly contain these keys (even if empty lists): \"characters\", \"locations\", \"events\", \"world_rules\", \"relationships\", \"objects\".\n"
    )

    example_output = {
        "characters": [
            {"id": "char_elena", "name": "Elena", "description": "A fierce warrior."}
        ],
        "relationships": [
            {"id": "rel_1", "source_character_id": "char_elena", "target_character_id": "char_marcus", "history": "Siblings"}
        ],
        "events": [
            {"id": "event_1", "description": "Confrontation at the lighthouse."}
        ],
        "locations": [
            {"id": "loc_lighthouse", "name": "Lighthouse", "description": "An abandoned tower on the cliffs."}
        ],
        "world_rules": [],
        "objects": []
    }

    prompt = (
        f"{system_prompt}\n\n"
        f"### EXAMPLE OUTPUT ###\n"
        f"{json.dumps(example_output, indent=2)}\n\n"
        f"### INPUT TEXT TO ANALYZE ###\n"
        f"{text}\n\n"
        f"### OUTPUT ###\n"
    )

    print("Running ingestion extraction...")
    response = model.generate_text(prompt=prompt)
    data = parse_llm_json(response)

    result = IngestionResult()
    
    # Safely parse and convert dictionaries to Pydantic objects
    for c in data.get("characters", []):
        if "id" not in c: c["id"] = f"char_{uuid.uuid4().hex[:8]}"
        if "name" not in c: c["name"] = "Unknown"
        if "description" not in c: c["description"] = ""
        result.characters.append(Character(**c))
        
    for l in data.get("locations", []):
        if "id" not in l: l["id"] = f"loc_{uuid.uuid4().hex[:8]}"
        if "name" not in l: l["name"] = "Unknown"
        if "description" not in l: l["description"] = ""
        result.locations.append(Location(**l))
        
    for e in data.get("events", []):
        if "id" not in e: e["id"] = f"event_{uuid.uuid4().hex[:8]}"
        if "description" not in e: e["description"] = "Unknown Event"
        result.events.append(Event(**e))
        
    for wr in data.get("world_rules", []):
        if "id" not in wr: wr["id"] = f"rule_{uuid.uuid4().hex[:8]}"
        if "title" not in wr: wr["title"] = "Rule"
        if "description" not in wr: wr["description"] = ""
        result.world_rules.append(WorldRule(**wr))
        
    for obj in data.get("objects", []):
        if "id" not in obj: obj["id"] = f"obj_{uuid.uuid4().hex[:8]}"
        if "name" not in obj: obj["name"] = "Object"
        result.objects.append(ObjectNode(**obj))
        
    for r in data.get("relationships", []):
        if "id" not in r: r["id"] = f"rel_{uuid.uuid4().hex[:8]}"
        if "source_character_id" in r and "target_character_id" in r:
            result.relationships.append(Relationship(**r))
            
    return result
