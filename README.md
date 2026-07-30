# 🌌 PlotWeaver

> **An AI-Powered Visual Storytelling Workspace & Creative Partner**  
> Built for the **IBM AI Builders Challenge**

---

## 🎯 Challenge Theme

**Selected Challenge Theme:** `July Challenge - Reimagine Creative Industries with AI`

PlotWeaver reimagines the creative writing and narrative design industry by transforming how authors, screenwriters, and game narrative designers conceptualize, structure, and audit their stories. Instead of replacing the writer with generative text, PlotWeaver serves as an intelligent **Creative Partner** that empowers authors through interactive graph visualization and automated narrative analysis.

---

## ❓ Problem Statement

Writing complex novels, screenplays, or game lore is notoriously difficult:

1. **Information Overload & Continuity Drift**: In manuscripts exceeding hundreds of pages, authors frequently lose track of character arcs, timeline sequences, and established lore.
2. **Fragile World-Building**: Fantasy, sci-fi, and historical fiction rely on strict rules (magic limits, technology constraints, laws). Tracking whether a character breaks these rules across 50 chapters is tedious and error-prone.
3. **Generative AI Misalignment**: Most AI writing tools attempt to "ghostwrite" paragraphs for the author, diluting their unique voice and creating generic prose rather than fixing underlying plot logic.

---

## 💡 Solution Description

**PlotWeaver** is a visual narrative workspace where writers build stories using connected graph nodes instead of wall-to-wall text documents.

### Key Capabilities:

- 🎨 **Interactive Story Canvas**: Drag-and-drop story beats, characters, locations, objects, world rules, and events onto an infinite visual graph with 1-click **Auto Layout**.
- ⚡ **Quick Add & Document Ingestion**: Instantly extract narrative entities from plain text or **PDF manuscripts** (up to 5 pages) using **IBM Docling** and **IBM Granite AI**.
- 🧠 **Smart Duplicate Prevention**: Automatically cross-references extracted entities with existing canvas nodes to prevent duplicate characters or locations.
- 🛡️ **AI Continuity & World Rule Checker**: Runs multi-agent analysis to detect timeline contradictions, plot holes, and rule violations across your story graph.
- 📄 **Structured Outline Export**: Converts visual graph structures into chronological, chapter-by-chapter text outlines downloadable as `.txt` or copied to clipboard.

---

## 🏗️ AI Approach and Architecture

PlotWeaver relies on a robust full-stack architecture combining high-performance frontend graph rendering with IBM's enterprise AI suite:

```
[ Frontend: React Flow + Zustand ]
           │
           ▼ HTTP / REST
[ Backend: FastAPI Engine ]
   ├── Document Parsing: IBM Docling (PDF -> Markdown)
   ├── Embedding Search: IBM Slate (ibm/slate-30m-english-rtrvr-v2)
   └── Agent Orchestrator: IBM Granite (watsonx.ai)
          ├── Entity Extraction Agent (Unstructured Prose -> JSON)
          └── Continuity & Rule Checking Agent (Story Graph -> Insight Flags)
```

### Technical Stack & Models:

- **Frontend**: React, TanStack Start/Router, React Flow graph engine, Zustand state management, Tailwind CSS v4, Shadcn UI.
- **Backend Engine**: FastAPI (Python), PyPDFium2.
- **Document Ingestion**: **IBM Docling** (`docling.document_converter`) for layout parsing, OCR, and markdown conversion.
- **AI Models & Orchestration**:
  - **IBM Granite** (via `watsonx.ai`): Foundation model powering multi-agent narrative analysis and entity extraction.
  - **IBM Slate Embeddings** (`ibm/slate-30m-english-rtrvr-v2`): Semantic retrieval for character and rule context matching.
  - **Granite Guardian**: Safety and hallucination check guardrails for AI insight validation.

---

## 🤖 How IBM Bob Was Used

**IBM Bob** acted as our primary AI pair programmer and architecture assistant throughout the entire development lifecycle:

1. **System Architecture & API Design**: IBM Bob helped design the FastAPI REST architecture, multi-agent prompt structures, and client-side Zustand store modularization.
2. **Docling & Granite Pipeline Integration**: Assisted in integrating IBM Docling's PDF converter pipeline and crafting strict, zero-shot JSON prompts for Granite models to prevent parsing errors.
3. **Smart Duplicate Logic & UI Refactoring**: Guided the implementation of smart node matching algorithms and clean component refactoring for a seamless UX.

---

## 🚀 How to Run Locally

### Prerequisites

- Python 3.10+
- Node.js 18+ & `pnpm`
- IBM watsonx.ai API Credentials

### 1. Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
WATSONX_API_KEY=your_ibm_watsonx_api_key
WATSONX_PROJECT_ID=your_watsonx_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

Start the FastAPI server:

```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Team

- **Darl** – Full Stack Developer
- **Karan** – AI Engineer & Backend Architecture
- **Michael** – AI Engineer
