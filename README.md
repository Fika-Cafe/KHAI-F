# KHAI – KnowledgeHub AI (Frontend)

Next.js web interface to manage and query internal knowledge. Includes auth, sidebar dashboard, unified search for documents and links, library with file/URL ingestion, AI chat (n8n), and widgets for recent or popular content.

## Tech stack
- Next.js 16 (App Router) + React 19
- TailwindCSS 4 + Radix UI/shadcn components
- n8n Chat integration (`@n8n/chat`)
- HTTP requests with cookies to the backend API (`lib/req.ts` helpers)

## Quick setup
1) Clone the repo and enter the directory.  
2) Install dependencies:
```
npm install
```
3) Environment variables (`.env.local`):
```
NEXT_PUBLIC_URL=            # API base URL (uses cookies)
NEXT_PUBLIC_HOSTEDCHAT=     # n8n chat webhook URL
```
4) Run in development:
```
npm run dev
```
5) Production:
```
npm run build
npm start
```

## Deploy on Railway
1) Push this repository to GitHub.
2) In Railway, create a new project and select this repo.
3) Add environment variables in Railway:
```
NEXT_PUBLIC_URL=
NEXT_PUBLIC_HOSTEDCHAT=
```
4) Deploy. Railway will use:
- Build command: `npm run build`
- Start command: `npm run start -- -H 0.0.0.0 -p $PORT`

## Deploy checklist
- `railway.json` exists with explicit build/start commands.
- `package.json` defines Node engine (`>=20.9.0`).
- `components/ai-chat-interface.tsx` loads n8n chat CSS via CDN at runtime.
- Railway variables are set (`NEXT_PUBLIC_URL`, `NEXT_PUBLIC_HOSTEDCHAT`).
- Backend CORS/cookies allow your Railway frontend domain.

## Key features
- **Authentication**: login/register tabs in `app/page.tsx`.
- **Dashboard**: sidebar layout, theme/accent controls, upload modal (`components/dashboard-layout.tsx`, `upload-modal.tsx`).
- **AI Chat**: fullscreen embedded n8n chat (`components/ai-chat-interface.tsx`).
- **Search**: queries documents and links, shows logs and filters (`components/search-results.tsx`).
- **Library**: browse/filter documents and links; supports file and URL uploads (`components/knowledge-library.tsx`).
- **Recent / Most Searched**: dashboard widgets (`components/recent-documents.tsx`, `components/most-searched.tsx`).

## Structure (brief)
- `app/` pages (dashboard, chat, search, library, settings, etc.) and global styles.
- `components/` reusable UI, dashboard layout, modals, widgets.
- `lib/` network helpers and profile verification.
- `public/` icons and assets.

## Notes
- Backend expects cookie-based auth (`credentials: "include"`).
- Build currently ignores TypeScript errors (`next.config.mjs`); fix TS issues for production hardening.

