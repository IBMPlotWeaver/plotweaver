# Prompt for IBM Bob — PlotWeaver: Implement Remaining Features

Paste everything below into Bob as your task brief. It's written as one prompt but organized into phases — feed it phase by phase if Bob works better on scoped tasks, or all at once if you want a full plan back first.

---

## CONTEXT — What already exists

PlotWeaver is a story-continuity tool. The current build has:

- **Frontend:** React Flow canvas with 3 custom node types (Story Beat, Character, World Rule), Dagre auto-layout, minimap/zoom/fit-to-view, auto-save every 30s + manual save + unsaved-changes warning, dark/light mode, Tailwind CSS 4 + Shadcn UI, loading/error/empty states.
- **AI:** A single continuity checker that sends the *entire* story graph to IBM Granite in one call and returns 5 issue types (`continuity`, `world_rule`, `character`, `plot_hole`, `pacing`) shown in a side panel linked to story beats. A brainstorm button per insight generates 3 cached fix suggestions. Insights can be marked resolved/unresolved.
- **Export:** AI-generated 3–5 sentence chapter summaries, exportable as markdown/text.
- **Auth:** Supabase Auth (email + password), protected routes, session persistence, profile page.

## GOAL

Evolve this from "single LLM call over the whole graph" into the architecture below, without breaking anything currently working. Build in the phase order given — each phase should leave the app in a working, demoable state.

---

## PHASE 1 — Expand the Knowledge Graph schema

**Task:** Extend the Supabase schema and node/edge types beyond the current 3 (Story Beat, Character, World Rule) to a full typed Story Knowledge Graph:

- New node types: `Location`, `Object`, `Event` (may map to/replace Story Beat), `Relationship` (as edge type between Characters), `Conflict`, `Goal`, `Secret`, `Thread`
- Each node type gets its own Pydantic schema (backend) and TypeScript type (frontend) with the fields listed below — reuse existing patterns from the Character/World Rule node implementations rather than inventing a new pattern.

Field guidance per type:
- `Character`: name, traits[], goals[], secrets[], arc_stage, voice_notes
- `Location`: name, description, connected_locations[]
- `Object`: name, properties, current_owner, current_location, significance
- `Event`: description, timeline_position, participants[], consequences
- `Relationship` (edge): source_character_id, target_character_id, trust_level, history, status
- `Conflict`: parties[], stakes, resolution_status
- `Goal`: owning_character_id, status (active/achieved/abandoned), obstacles
- `Secret`: holder_id, content, known_by[], reveal_status
- `Thread`: description, resolution_status (open/resolved/abandoned), last_referenced_event_id

**Acceptance criteria:** migrations run clean, new node types are creatable/editable on the existing canvas using the current node-creation UI pattern, existing Story Beat/Character/World Rule data is preserved (write a migration, not a breaking change).

---

## PHASE 2 — Context Forge (subgraph extraction)

**Task:** Replace "send the entire graph to Granite" with a context-assembly layer:

- On any node edit, extract only the subgraph within N hops (default N=2, configurable) of the edited node
- Add a Granite embedding call to also pull in nodes with high semantic similarity to the edited node's text (catches thematically related but graph-distant content — e.g., echoed scenes)
- Merge hop-based + embedding-based results into one subgraph payload, deduplicated

**Acceptance criteria:** editing a single node no longer triggers a full-graph AI call; response latency drops measurably on a graph with 50+ nodes; a unit test confirms the returned subgraph excludes unrelated nodes beyond N hops (unless embedding-matched).

---

## PHASE 3 — Multi-agent architecture (replace the single continuity call)

**Task:** Split the current single Granite call into 5 specialist agents, each with its own prompt and strict JSON output contract (schemas below). Keep the existing side-panel UI, just change what populates it.

- **Continuity Agent** — factual contradictions across entities
- **Timeline Agent** — chronological ordering, age, travel-time plausibility
- **Character Agent** — voice/personality/goal consistency, arc-aware
- **World Rule Agent** — validates Events against Rule nodes, tolerates intentional subversions
- **Brainstorm Agent** — foreshadowing gaps, pacing flags, general brainstorming (this replaces/absorbs the current brainstorm button)

Each agent's prompt must follow this contract:
```
INPUT: { edited_node, subgraph: {nodes, edges}, story_metadata }
OUTPUT: strict JSON matching a defined schema, every flagged issue MUST
cite specific node/edge IDs from the provided subgraph, include a
confidence score (0-1), and agents must return an empty result rather
than force a finding when nothing is wrong.
```

Route which agents fire based on the edited node's type (e.g., editing a Character wakes Character + Continuity agents, not all 5) — this is a cost/latency optimization, implement it as a simple routing table, not a full ML classifier.

**Acceptance criteria:** all 5 agents return schema-valid JSON on a set of test cases you write; selective invocation is demonstrable (editing different node types wakes different agent subsets); existing insight-resolution UI still works against the new agent outputs.

---

## PHASE 4 — Granite Guardian integration

**Task:** Add a post-processing gate that every agent's raw output passes through before reaching the Aggregator/UI:

- Guardian checks that every cited node/edge ID in an agent's output actually exists in the subgraph it was given (catch hallucinated citations)
- Flag or downgrade confidence on any claim Guardian can't verify against the provided context
- Log every Guardian intervention (what was caught, which agent, what happened to it)

**Acceptance criteria:** write a deliberate test case that would make a naive LLM call hallucinate a fact not in the subgraph, and confirm Guardian catches/downgrades it reliably (run it 10x, it must catch it every time — this will be a live demo moment, it cannot be flaky).

---

## PHASE 5 — Response Aggregator + Explanation Cards

**Task:**
- Build an aggregator that merges the 5 agents' outputs, deduplicates overlapping flags, ranks by severity × confidence
- Build an "Explanation Card" UI component: clicking any flagged insight shows which agent flagged it, which specific node/edge IDs it cites, the confidence score, and (once Phase 6 is done) a link to its governance log entry

**Acceptance criteria:** a single insight in the side panel, when clicked, opens a card showing full provenance — not just the issue text.

---

## PHASE 6 — watsonx.governance logging

**Task:** Log every agent decision: model used, prompt version, graph snapshot reference, Guardian verdict, and what the user did with the suggestion (accepted/dismissed/ignored). Expose this log via a simple internal endpoint the Explanation Card (Phase 5) can query.

**Acceptance criteria:** every insight shown in the UI has a traceable governance log entry retrievable by ID.

---

## PHASE 7 — Story Health Score + supporting visualizations

**Task:**
- Compute a single 0–100 "Story Health Score" from the count/severity of unresolved insights across the graph; recalculate on every edit/resolution
- Add three new views (can reuse React Flow / a charting lib already in the stack):
  - **Timeline Visualization** — horizontal chronological view of Event nodes
  - **Character Network Graph** — force-directed Relationship view
  - **Conflict Graph** — Conflict nodes with stakes/resolution status
- Add **Node Risk Indicators**: small badges directly on canvas nodes showing unresolved-issue severity, no panel-opening required

**Acceptance criteria:** Story Health Score visibly changes in real time when an insight is resolved; the three new views are reachable via tabs/nav without disrupting the existing canvas.

---

## PHASE 8 — Docling ingestion

**Task:** Build an upload flow: PDF/DOCX/Markdown/TXT → Docling extracts structure (chapters, scene breaks, tables) → an ingestion agent parses the Docling output into initial graph nodes (Characters, Events, Locations, Rules) using LLM-assisted entity extraction.

**Acceptance criteria:** uploading one sample messy manuscript/lore doc auto-populates a non-trivial starter graph (aim for it working reliably on at least one prepared demo file, even if general accuracy is imperfect).

---

## PHASE 8.5 — Quick Add: plain-text-to-graph extraction

**Task:** Add a direct text-entry extraction mode that reuses the Phase 8 Docling/ingestion pipeline's entity-extraction logic, but skips the file-upload step:

- Add a "Quick Add" text box/panel on the canvas (or accessible via a button) where a user types or pastes a paragraph or scene in plain prose
- Run the same LLM-assisted entity-extraction agent from Phase 8 against this raw text input (no Docling step needed for plain text, go straight to extraction)
- Return a **preview list** of proposed nodes/edges (e.g., "New Character: Elena", "New Relationship: Elena ↔ Marcus (siblings)", "New Event: confrontation at lighthouse") — do NOT commit anything to the graph automatically
- User can check/uncheck individual proposed nodes/edges, edit fields inline, then confirm to commit the accepted ones to the graph
- If an extracted entity closely matches an existing node (e.g., "Elena" already exists as a Character), flag it as a possible match/merge rather than creating a duplicate — reuse whatever similarity-matching approach was built in Phase 2 (Context Forge embeddings) if available

**Acceptance criteria:** typing a 2–4 sentence scene produces a sensible preview list within a few seconds; nothing is written to the graph until the user confirms; re-entering a scene mentioning an existing character does not create a duplicate node.

---

## PHASE 8.6 — First-time user onboarding guide

**Task:** Add a dismissible guided walkthrough triggered on a new user's first canvas visit:

- Step 1: introduce the canvas — "nodes are your story's building blocks"
- Step 2: highlight the node-creation control, prompt the user to add their first Character
- Step 3: point at the AI insights side panel, briefly explain what it checks for
- Step 4: highlight the Quick Add text box (Phase 8.5) as the fast-start alternative to manual node creation
- Skippable/closeable at any step; store a `has_seen_onboarding` flag on the user profile (Supabase) so it never shows again after completion or dismissal; add a "Show guide again" link somewhere in settings/profile for users who want to replay it

**Acceptance criteria:** a brand-new signup sees the guide automatically once; dismissing or completing it persists across sessions; an existing/returning user never sees it unprompted.

---

## PHASE 8.7 — Expanded story writing suggestions

**Task:** Extend the existing Brainstorm Agent from "fix this specific flagged insight" to proactive, opt-in creative suggestions decoupled from any problem:

- **"What could happen next"** — given open Thread/Goal nodes, propose 2–3 plausible next-scene directions using only entities already in the graph
- **"Suggest a complication"** — given a selected Conflict node, propose an escalation
- **"Suggest a twist"** — surface an underused Secret node (one with few/no linked Events) and propose how/when revealing it could land narratively
- Present as a dedicated "Suggestions" tab or button, separate from the existing per-insight Brainstorm button, so it's discoverable without an insight already being flagged

**Constraints (same as existing brainstorm feature):** ideas only, never full prose; every suggestion must reference existing graph entities only, never invent new ones; results should be cached per node/request like the current brainstorm caching.

**Acceptance criteria:** each of the 3 suggestion types returns grounded, entity-referencing output (verifiable against the graph, not free-floating text) and is presented distinctly from problem-driven insights so users don't confuse "creative idea" with "detected issue."

---

## PHASE 9 (stretch, only if time remains) — Additional features

Pick from this list based on remaining time, do not attempt all of them:

- **Multi-POV consistency check** — flag when a POV character's dialogue/thoughts reveal information they shouldn't realistically know yet
- **Reader confusion prediction** — flag information revealed in an order likely to confuse readers
- **Stale name/character reuse check** — catch accidental name collisions between characters
- **"What-if" branch simulation** — fork a subgraph, edit it, preview which downstream nodes would break
- **Series/sequel mode** — import a prior story's finished graph as read-only context
- **Structured export upgrade** — generate a formatted outline/character bible directly from graph data (not re-summarized prose) in addition to the existing chapter-summary export

---

## GLOBAL CONSTRAINTS FOR BOB

- Match existing conventions: React Flow for anything graph-visual, Shadcn UI components, Tailwind 4 utility classes, Supabase for persistence and auth — do not introduce a new state-management library, ORM, or UI kit without a strong reason.
- Every new AI call must go through the Context Forge subgraph-extraction layer (Phase 2) once it exists — no new feature should send the full graph to Granite.
- Every agent output must be strict JSON matching its schema — no free-text responses reaching the frontend directly.
- Write unit tests for schema validation as each phase is completed, not retroactively.
- Do not remove or break the existing auto-save, resolution-marking, or export features while building new phases — regression-test them at the end of each phase.
- Flag any phase that risks breaking the existing demo path before implementing it, so it can be sequenced around a rehearsal.
