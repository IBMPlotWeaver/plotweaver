# PlotWeaver Backend API

## Endpoints

### GET /api/data
Test endpoint to verify backend is running.

**Response:**
```json
{
  "status": "success",
  "message": "Hello from the FastAPI backend!"
}
```

### POST /api/stories/process
Receive story graph from React frontend.

**Request Body:**
```json
{
  "nodes": [...],
  "edges": [...]
}
```

**Response:**
```json
{
  "status": "success",
  "story_beats_count": 4,
  "characters_count": 2,
  "world_rules_count": 2,
  "edges_count": 3
}
```

## Data Models
- StoryBeatData
- CharacterData
- WorldRuleData
- Node
- Edge
- StoryGraph