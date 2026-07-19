# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

**PlotWeaver** is an AI-powered visual storytelling workspace built for the IBM AI Builders Challenge. Writers build stories using connected nodes instead of long text documents, with AI acting as a Creative Partner to detect plot holes, maintain continuity, track character arcs, check timeline consistency, enforce world-building rules, and suggest improvements.

**Important**: The AI does not write the story. It assists the writer in creating a better one.

### Team
- **Darl** – Full Stack Developer
- **Karan** – AI Engineer  
- **Micheal** – AI Engineer

### MVP Features (10-Day Sprint)
- ✅ Interactive Story Canvas with connected nodes
- ✅ AI Continuity Checker (detect contradictions and plot holes)
- ✅ World Rule Checker (ensure events follow user-defined rules)
- ✅ AI Brainstorm Assistant (suggest creative fixes)
- ✅ Export Story Outline (convert visual graph to structured outline)

### Technical Implementation

This frontend is a full-stack React web application built with TanStack Start. The application features user authentication via Supabase, a modern UI with Tailwind CSS v4 and Shadcn components, and is designed for deployment on Cloudflare Workers.

### Core Technologies

- **Framework**: TanStack Start (React-based full-stack framework with SSR)
- **Routing**: TanStack Router (file-based routing in `src/routes/`)
- **Data Fetching**: TanStack Query with SSR support
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **UI Components**: Shadcn UI (React components built on Radix UI)
- **State Management**: Zustand for client-side state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with TypeScript
- **Deployment**: Cloudflare Workers via Wrangler

### Architecture

The project follows a **feature-based architecture** with clear separation of concerns:

```
src/
├── features/           # Feature modules (auth, landing, common, shadcn)
│   ├── auth/          # Authentication (login, signup, schemas, store)
│   ├── landing/       # Landing page components
│   ├── common/        # Shared components (NotFound, etc.)
│   └── shadcn/        # Shadcn UI components
├── routes/            # TanStack Router file-based routes
├── lib/               # Utilities (supabase client, utils)
├── types/             # TypeScript type definitions
└── integrations/      # Third-party integrations (TanStack Query)
```

**Key Architectural Patterns**:
- Path aliases: `#/*` maps to `src/*` (configured in tsconfig.json and package.json imports)
- Feature modules contain their own components, schemas, and stores
- Root route (`__root.tsx`) provides global layout and devtools
- Custom CSS variables for theming (e.g., `--sea-ink`, `--surface`, `--line`)

## Building and Running

### Development

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:3000)
pnpm dev

# Generate route types (auto-runs on file changes)
pnpm generate-routes
```

### Production Build

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

### Testing

```bash
# Run tests with Vitest
pnpm test
```

### Code Quality

```bash
# Lint code with ESLint
pnpm lint

# Format code with Prettier and fix ESLint issues
pnpm format

# Check formatting without making changes
pnpm check
```

### Deployment

```bash
# Deploy to Cloudflare Workers
pnpm deploy

# Or manually with Wrangler
wrangler login
wrangler deploy
```

**Environment Variables**:
- Development: Use `.env` file (not committed)
- Production: Set secrets via `wrangler secret put <VAR_NAME>`
- Public vars: Configure in `wrangler.jsonc` under `vars`
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Development Conventions

### Adding New Routes

TanStack Router uses file-based routing. Create files in `src/routes/`:

```tsx
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutComponent,
})

function AboutComponent() {
  return <div>About Page</div>
}
```

Routes are automatically generated into `routeTree.gen.ts`.

### Adding UI Components

Use Shadcn CLI to add new components:

```bash
pnpm dlx shadcn@latest add <component-name>
```

Components are added to `src/features/shadcn/components/ui/`.

### State Management

- **Global UI State**: Use Zustand stores (see `src/features/auth/store/useAuthUIStore.ts`)
- **Server State**: Use TanStack Query with loaders or server functions
- **Form State**: Use React Hook Form with Zod schemas

### Form Validation

Create Zod schemas in feature-specific `schemas/` directories:

```typescript
// src/features/auth/schemas/loginSchema.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
```

Use with React Hook Form:

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema)
})
```

### Styling Conventions

- Use Tailwind CSS utility classes
- Custom CSS variables defined in `src/styles.css`:
  - `--sea-ink`: Primary text color
  - `--sea-ink-soft`: Muted text color
  - `--surface`: Background surface color
  - `--line`: Border/divider color
- Use `island-shell` class for card-like containers
- Use `rise-in` class for fade-in animations
- Gradient buttons: `bg-linear-to-r from-violet-600 to-fuchsia-500`

### Authentication

Supabase client is initialized in `src/lib/supabase.ts`. Use it for auth operations:

```typescript
import { supabase } from '#/lib/supabase'

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: formData.email,
  password: formData.password,
})

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
})
```

### Path Imports

Always use the `#/*` alias for imports from `src/`:

```typescript
import { Button } from '#/features/shadcn/components/ui/button'
import { supabase } from '#/lib/supabase'
import { useAuthUIStore } from '#/features/auth/store/useAuthUIStore'
```

### TypeScript Configuration

- Strict mode enabled
- No unused locals/parameters
- Module resolution: bundler
- Import extensions allowed (`.ts`, `.tsx`)
- Types: Vite client types included

### Linting and Formatting

- ESLint configured with `@tanstack/eslint-config`
- Prettier for code formatting
- Run `pnpm format` before committing
- Pre-commit hooks recommended but not enforced

## Project-Specific Notes

### Cloudflare Workers Configuration

- Configured via `wrangler.jsonc` and `vite.config.ts`
- Uses `@cloudflare/vite-plugin` for SSR environment
- KV, D1, R2, and Durable Object bindings can be added in `wrangler.jsonc`

### Devtools

Development includes integrated devtools:
- TanStack Router Devtools
- TanStack Query Devtools
- React Devtools
- All accessible via bottom-right panel in dev mode

### Demo Files

Files prefixed with `demo` can be safely deleted. They are provided as examples for learning the framework features.

### Supabase Integration

- Local Supabase setup available in `supabase/` directory
- Configuration in `supabase/config.toml`
- Database types generated in `src/types/database.types.ts`
- Use `supabase` CLI for local development and migrations

## AI Integration

### Overview

PlotWeaver integrates with a FastAPI backend that uses IBM's Granite AI models to analyze story content. The AI acts as a **Creative Partner**, not a writer, helping authors identify issues and maintain consistency.

### Architecture

**Frontend (React + TanStack Query)**:
- `src/features/canvas/hooks/useAIAnalysis.ts` - Custom hooks for AI operations
- `src/features/canvas/components/AIInsightsPanel.tsx` - UI for displaying insights
- Zustand store (`useCanvasStore`) manages canvas state and node data

**Backend Communication**:
- Backend URL configured via `VITE_BACKEND_URL` environment variable
- Defaults to `http://localhost:8000` for local development
- Uses standard fetch API for HTTP requests

### AI Analysis Features

**1. Continuity Checking**
- Detects contradictions between story beats
- Tracks character consistency across scenes
- Identifies timeline inconsistencies

**2. World Rule Validation**
- Ensures story events follow user-defined world rules
- Flags violations of established magic systems, physics, etc.

**3. Character Arc Analysis**
- Monitors character development and consistency
- Detects out-of-character behavior

**4. Plot Hole Detection**
- Identifies logical gaps in the narrative
- Suggests areas needing clarification

**5. Pacing Analysis**
- Evaluates story rhythm and flow
- Highlights potential pacing issues

### Data Flow

1. **User triggers analysis** via "Run AI Analysis" button in `AIInsightsPanel`
2. **Frontend collects data** from canvas nodes:
   - Story beats (title, summary, location, timeline order, characters)
   - Characters (name, description)
   - World rules (title, description)
3. **POST request** sent to `${BACKEND_URL}/api/analyze` with story data
4. **Backend processes** using Granite AI models
5. **Insights returned** and stored in Supabase `ai_insights` table
6. **UI updates** to display insights with visual indicators on affected nodes

### API Endpoints

**Analyze Story**
```typescript
POST /api/analyze
Body: {
  story_id: string
  beats: Array<{ id, title, summary, location, timelineOrder, characterNames }>
  characters: Array<{ id, name, description }>
  world_rules: Array<{ id, title, description }>
}
Response: {
  insights: AIInsight[]
  summary: string
}
```

**Resolve Insight**
```typescript
PATCH /api/insights/{insight_id}/resolve
Response: void
```

### Database Schema

**ai_insights table** (Supabase):
```typescript
interface AIInsight {
  id: string                    // UUID
  story_id: string              // Foreign key to stories
  node_id: string | null        // Optional reference to specific node
  insight_type: 'continuity' | 'world_rule' | 'character' | 'plot_hole' | 'pacing'
  content: string               // AI-generated insight text
  status: 'unresolved' | 'resolved'
  created_at: string            // ISO timestamp
}
```

### Custom Hooks

**useAIInsights(storyId)**
- Fetches all insights for a story from Supabase
- Auto-refreshes every 10 seconds
- Returns: `{ data: AIInsight[], isLoading: boolean }`

**useRunAnalysis()**
- Triggers AI analysis via backend
- Collects canvas data and sends to API
- Updates node warning flags on success
- Returns: `{ mutate, isPending, data, error }`

**useResolveInsight(storyId)**
- Marks an insight as resolved
- Updates cache and node warning flags
- Returns: `{ mutate, isPending }`

### UI Components

**AIInsightsPanel**
- Slide-in panel from right side of canvas
- Displays categorized insights with color-coded badges
- Shows unresolved count badge
- Allows marking insights as resolved
- Includes "Run AI Analysis" button

**Insight Card**
- Color-coded by type (continuity, world rule, character, plot hole, pacing)
- Shows related story beat title
- "Mark resolved" action button
- Fades when resolved

### Visual Indicators

**Story Beat Nodes**
- `hasAIWarning` flag in node data
- Warning icon displayed when unresolved insights exist
- Automatically updated after analysis or resolution

### Error Handling

- Network errors displayed in panel
- Failed analysis shows error message
- Graceful fallback if backend unavailable
- Loading states for all async operations

### Performance Considerations

- Insights cached via TanStack Query (10s stale time)
- Optimistic updates for resolve actions
- Debounced auto-save prevents excessive API calls
- Lazy loading of insight details

### Development Setup

1. **Backend must be running** on configured URL
2. **Environment variable**: Set `VITE_BACKEND_URL` in `.env`
3. **Supabase table**: Ensure `ai_insights` table exists
4. **Test data**: Use sample stories with multiple beats

### Custom Cursor Rules

The project includes `.cursorrules` with specific instructions:
- Use latest Shadcn version for component installation
- Follow the command pattern: `pnpm dlx shadcn@latest add <component>`
