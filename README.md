# PlotWeaver - AI-Powered Story Assistant

## Overview
PlotWeaver is an AI-powered visual storytelling workspace that helps writers build better stories using connected nodes and intelligent AI analysis.

## Problem Solved
Writers spend hours manually checking for plot holes, continuity issues, and character inconsistencies. PlotWeaver automates this using IBM Granite AI.

## Key Features
✅ **Visual Story Canvas** - Drag & drop story beats, characters, world rules
✅ **AI Continuity Checker** - Detects plot holes using IBM Granite
✅ **Export to Markdown** - Convert your visual story to readable outline
✅ **Insights System** - Get actionable feedback on your story

## Tech Stack
- **Frontend**: React Flow, TanStack, TailwindCSS
- **Backend**: FastAPI (Python)
- **AI**: IBM Granite (via watsonx.ai)
- **Database**: Supabase
- **Tools**: IBM Bob

## How to Run

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5173

## API Endpoints

- `POST /api/stories/export` - Export story as markdown
- `POST /api/analyze` - Analyze story with AI
- `GET /api/insights/{story_id}` - Get AI insights

## Team
- Darl: Frontend
- Karan: AI Integration  
- Michael: Backend & Export Features

## IBM Tools Used
- IBM Bob: Development partner
- IBM Granite: AI analysis engine