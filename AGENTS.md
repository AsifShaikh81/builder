# Project: Agent Builder

A multi-agent system that turns a vague one-line idea into a working webpage.

## Stack
- Next.js (App Router), TypeScript, Tailwind CSS, Bun
- LangGraph for agent orchestration

## How it works
1. The user enters an idea in the UI (for example, "build a todo app").
2. The UI sends it to the API route `/api/build`.
3. The API route runs a LangGraph flow: Planner -> Builder -> Reviewer.
4. If the Reviewer rejects the result, it goes back to the Builder with a list of issues.
5. The final HTML is returned to the UI and shown in an iframe.

## Rules
- Plan first, then write code.
- Each agent lives in its own file under `lib/agents/`.
- Keep functions small, with clear names.
- Agent outputs must be structured: the Planner returns JSON, the Builder returns a single HTML file.
- The Builder uses the Tailwind CDN and no other external dependencies.
- The Reviewer can send work back to the Builder at most 2 times. After that, return the latest HTML.
- API keys live only in `.env.local`, never in code.
- Never expose API keys to the browser.

## Folder structure
- `lib/agents/planner.ts`
- `lib/agents/builder.ts`
- `lib/agents/reviewer.ts`
- `lib/graph.ts`
- `app/api/build/route.ts`
- `app/page.tsx`