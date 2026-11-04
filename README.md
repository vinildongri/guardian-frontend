# Guardian Frontend

Web dashboard for **Guardian**, a real-time account security companion. It shows the security status of your connected accounts, a timeline of events, and raises a full-screen "Was this you?" alert with a siren when something risky happens.

## Tech stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Native `fetch` and `WebSocket`, with no extra state or HTTP libraries

## Features

- Register, log in and log out (httpOnly cookie session)
- Dashboard with overall status, per-account Protected / Review Required cards and unresolved alerts
- Live alerts over WebSocket with automatic reconnect
- Full-screen alert modal with **This was me** and **Secure account** actions, and a siren for high-risk events
- Timeline with an account filter
- Connected accounts and trusted devices management
- Sleep Protection settings (high-risk events trigger the siren during sleep hours)
- Floating Security Assistant chat
- Simulate-event panel for testing and demos

## Project structure

```
guardian-frontend/
├── src/
│   ├── middleware.ts            redirects to /login when there is no session cookie
│   ├── app/
│   │   ├── layout.tsx, page.tsx, globals.css
│   │   ├── login/, register/    auth pages
│   │   └── (app)/               pages behind login
│   │       ├── layout.tsx       header, user check, alert provider
│   │       ├── dashboard/, timeline/, accounts/, devices/, settings/
│   ├── components/
│   │   ├── AlertProvider.tsx    WebSocket connection, alert queue, siren control
│   │   ├── AlertModal.tsx       "Was this you?" screen
│   │   ├── ChatPanel.tsx        Security Assistant
│   │   ├── SimulateEvent.tsx    demo event trigger
│   │   ├── AuthForm.tsx, SeverityBadge.tsx
│   ├── hooks/useApi.ts          fetch helper that refreshes on live alerts
│   └── lib/
│       ├── api.ts               fetch wrapper (sends cookies) and WebSocket URL
│       ├── siren.ts             Web Audio siren
│       └── types.ts             shared types
```

## Getting started

Start the Guardian backend first (it runs on port 4000 by default).

```bash
npm install
cp .env.example .env.local
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:4000` |

The backend's `CLIENT_URL` must match this app's origin exactly (`http://localhost:3000`), or the browser will block requests with a CORS error.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |

## How it works

- **Auth:** the backend sets an httpOnly `token` cookie on login. Every request uses `credentials: "include"`, and `middleware.ts` redirects to `/login` when the cookie is missing. Pages under `(app)` also call `/auth/me` and redirect if the session has expired.
- **Live alerts:** `AlertProvider` opens one WebSocket to the backend after login. HIGH and CRITICAL events open the alert modal. If the server marks the alert `siren: true`, the siren plays until you respond. Every alert also triggers a refresh of the dashboard and timeline.
- **Secure account:** after you choose it, the modal shows a button that opens the platform's official security page in a new tab.

## Testing the flow

1. Register, then add an account on the **Accounts** page.
2. Click **Enable siren sound** in the header (browsers block audio until you click).
3. On the **Dashboard**, use **Simulate a security event** and choose `password_change`.
4. The alert modal and siren appear. Respond, then check the **Timeline**.
5. Trust a device on the **Devices** page and simulate `new_login` with that exact device name; it should now be LOW risk.
6. Turn on Sleep Protection with a window that includes the current time, then simulate `new_login` from an untrusted device to get a siren.

## Notes

- The siren only plays while the tab is open and the page has had at least one click. For alerts that reach you while the browser is closed, use the Guardian Android app.
- Platforms like Instagram don't expose login events through public APIs. Real events come from the Android app reading security notifications, while the simulate panel covers demos. Remove `SimulateEvent.tsx` and its one line in the dashboard page before a production release.
- The cookie is set on the backend's host. Locally that works across ports on `localhost`. In production, serve the frontend and backend under the same parent domain, or configure the cookie with `SameSite=None; Secure`.