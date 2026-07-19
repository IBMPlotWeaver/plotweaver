# Backend Setup Guide

This guide will help you set up the FastAPI backend for the Plotweaver project.

## Prerequisites

Make sure you have Python 3.11+ installed on your system.

---

## 1. Create a Virtual Environment

Open your terminal, navigate to the `backend` directory, and run:

```bash
python -m venv venv
```

## 2. Activate the Virtual Environment

**macOS / Linux:**
```bash
source venv/bin/activate
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**Windows (PowerShell):**
```powershell
venv\Scripts\Activate.ps1
```

You should see `(venv)` appear at the beginning of your terminal prompt.

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs FastAPI, uvicorn, **ibm-watsonx-ai**, **supabase**, and all other dependencies.

---

## 4. Configure Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Then open `.env` and set the following values:

### IBM watsonx.ai

| Variable | Where to get it |
|---|---|
| `WATSONX_API_KEY` | [IBM Cloud](https://cloud.ibm.com) → Manage → Access → API keys → Create |
| `WATSONX_PROJECT_ID` | Open your project in [watsonx.ai](https://dataplatform.cloud.ibm.com) → Manage → General → Project ID |
| `WATSONX_URL` | Pick the regional URL for your instance (see options in `.env.example`) |

```env
WATSONX_API_KEY=your_ibm_cloud_api_key_here
WATSONX_PROJECT_ID=your_watsonx_project_id_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

### Supabase (Service Role Key)

> ⚠️ Use the **service_role** key here — NOT the anon key. The backend needs it to write `ai_insights` rows directly.

| Variable | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase project → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase project → Settings → API → `service_role` key |

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here
```

---

## 5. Run the Server

```bash
uvicorn main:app --reload
```

The API will be available at **http://127.0.0.1:8000**.
Interactive API docs: **http://127.0.0.1:8000/docs**

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/data` | Health check |
| `POST` | `/api/analyze` | Run IBM Granite AI analysis on a story graph |
| `GET` | `/api/insights/{story_id}` | Fetch all AI insights for a story |
| `PATCH` | `/api/insights/{insight_id}/resolve` | Mark an insight as resolved |

### `POST /api/analyze` — Request body

```json
{
  "story_id": "uuid",
  "beats": [
    {
      "id": "uuid",
      "title": "Characters meet.",
      "summary": "@Rabbit and @Turtle agree to race.",
      "location": "River",
      "timelineOrder": 1,
      "characterNames": ["Rabbit", "Turtle"]
    }
  ],
  "characters": [
    { "id": "uuid", "name": "Rabbit", "description": "Overconfident sprinter." }
  ],
  "world_rules": [
    { "id": "uuid", "title": "The Energy Law", "description": "Running at max speed drains stamina in 10 minutes." }
  ]
}
```

### Response

```json
{
  "insights": [
    {
      "id": "uuid",
      "story_id": "uuid",
      "node_id": "uuid-of-beat",
      "insight_type": "world_rule",
      "content": "Beat #3 'The Overtake' has Rabbit sprinting for 20 minutes, violating The Energy Law which limits max-speed running to 10 minutes.",
      "status": "unresolved",
      "created_at": "2025-07-17T10:00:00Z"
    }
  ],
  "summary": "Found 1 issue. Review it below."
}
```

### Insight types

| Type | Meaning |
|---|---|
| `continuity` | A fact contradicts an earlier beat |
| `world_rule` | A beat violates a defined world rule |
| `character` | A character behaves inconsistently with their description |
| `plot_hole` | An event has no logical cause or is left unresolved |
| `pacing` | Story flow, timing, or structural pacing issue |
