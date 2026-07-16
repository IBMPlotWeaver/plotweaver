from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
app = FastAPI(title="PlotWeaver Backend")

# 1. Define the allowed origins (where your React app is running)
origins = [
    "http://localhost:5173",  
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# 2. Add the CORS middleware to your FastAPI application instance
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Allows requests from your React app
    allow_credentials=True,         # Allows cookies and authorization headers
    allow_methods=["*"],            # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Allows all request headers
)

# Data Models
class StoryBeatData(BaseModel):
    type: str
    title: str
    summary: str
    location: str
    timelineOrder: int
    characterNames: List[str]
    hasAIWarning: bool

class CharacterData(BaseModel):
    type: str
    name: str
    description: str

class WorldRuleData(BaseModel):
    type: str
    title: str
    description: str

class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Any
    measured: Optional[Dict[str, float]] = None

class Edge(BaseModel):
    id: str
    source: str
    target: str
    animated: Optional[bool] = None
    style: Optional[Dict[str, Any]] = None

class StoryGraph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

# 3. Create a sample route to test the connection
@app.get("/api/data")
async def get_data():
    return {
        "status": "success",
        "message": "Hello from the FastAPI backend!"
    }

@app.post("/api/stories/process")
async def process_story_graph(graph: StoryGraph):
    """Receive story graph from React frontend"""
    story_beats = [n for n in graph.nodes if n.type == "storyBeat"]
    characters = [n for n in graph.nodes if n.type == "character"]
    world_rules = [n for n in graph.nodes if n.type == "worldRule"]
    
    return {
        "status": "success",
        "story_beats_count": len(story_beats),
        "characters_count": len(characters),
        "world_rules_count": len(world_rules),
        "edges_count": len(graph.edges)
    }