# 🌌 PlotWeaver

> **An AI-Powered Visual Storytelling Workspace & Creative Partner**  
> Built for the **IBM AI Builders Challenge**

---

## 📺 Video Demo

Watch the full walkthrough and feature demo on YouTube:  
[![PlotWeaver Demo](https://img.shields.io/badge/YouTube-PlotWeaver%20Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/kRZ4yRUUrDg)  
🔗 **[https://youtu.be/kRZ4yRUUrDg](https://youtu.be/kRZ4yRUUrDg)**

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
