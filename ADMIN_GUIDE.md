# Rush 2026 Fan Parties and Concierge - Administrative Guide

This guide documents the administration, operation, and maintenance of the Rush 2026 Fan Parties and AI Concierge system introduced in the `feature/fan-parties-concierge` branch.

---

## 1. Architectural Overview

The meetup discovery and concierge feature connects Rush fans across the 2026 "Fifty Something" Tour. It consists of three integrated layers:

1. **Edge Storage (Cloudflare D1)**:
   - Serverless SQLite database (`rush_fan_parties`) hosted on Cloudflare's global edge network.
   - Stores approved and pending-review fan gatherings, tailgates, tribute band shows, and listening parties.

2. **Serverless Edge API (Cloudflare Pages Functions)**:
   - `GET /api/parties`: Queries events filtered by city, category, or distance with edge location detection.
   - `POST /api/parties`: Ingests user-submitted meetups with rate limiting, payload validation, and Gemini AI moderation.
   - `POST /api/chat`: Injects live approved meetups into the Synthetic Rush Fan system prompt so the AI acts as a knowledgeable tour concierge.

3. **Client UI (React and Vite)**:
   - `TourMeetupsView`: Interactive city filter, directions guide, RSVP links, and submission modal.
   - `ChatInterface`: Conversational concierge with direct links to view tour meetups.
   - `StartScreen`: Primary landing hub featuring trivia, meetups, and fan chat.

---

## 2. Cloudflare D1 Database Specifications

| Property | Value |
| --- | --- |
| Database Name | `rush_fan_parties` |
| Database ID | `bb8df262-f34d-4920-989d-2da28d3bd769` |
| Binding Name | `DB` |
| Primary Region | ENAM (North America) |
| Configuration File | `wrangler.toml` |
| Schema File | `functions/db/schema.sql` |
| Seed File | `functions/db/seed.sql` |

### Database Binding in `wrangler.toml`

```toml
[[d1_databases]]
binding = "DB"
database_name = "rush_fan_parties"
database_id = "bb8df262-f34d-4920-989d-2da28d3bd769"
```

Cloudflare Pages automatically links this binding when deployments are built from git.

---

## 3. Database Management via Wrangler CLI

You can query, inspect, and update production data directly from your terminal using Wrangler.

### Inspect Total Meetup Count

```bash
npx wrangler d1 execute rush_fan_parties --remote --command="SELECT status, COUNT(*) as count FROM meetups GROUP BY status;"
```

### View All Pending Review Submissions

```bash
npx wrangler d1 execute rush_fan_parties --remote --command="SELECT id, name, tour_city, venue_name, event_date, organizer_name FROM meetups WHERE status = 'pending_review' ORDER BY created_at DESC;"
```

### Approve a Submitted Meetup

When a fan submits an event and it is queued for review, approve it with:

```bash
npx wrangler d1 execute rush_fan_parties --remote --command="UPDATE meetups SET status = 'approved' WHERE id = 'MEETUP_ID_HERE';"
```

### Reject or Delete a Meetup

To remove a spam or duplicate submission:

```bash
npx wrangler d1 execute rush_fan_parties --remote --command="DELETE FROM meetups WHERE id = 'MEETUP_ID_HERE';"
```

### Add an Official Meetup via SQL

```bash
npx wrangler d1 execute rush_fan_parties --remote --command="INSERT INTO meetups (id, name, tour_city, venue_name, address, event_date, start_time, description, organizer_name, rsvp_link, category, status) VALUES ('cincy-02', 'Riverbend Pre-Concert Tailgate', 'Cincinnati', 'Riverbend Lot 2', '6201 Kellogg Ave', '2026-10-23', '14:00', 'Official fan meetup before showtime', 'Queen City Rush Legion', 'https://rush.com/tour', 'tailgate', 'approved');"
```

### Re-applying Schema or Resetting Seed Data

To re-run migrations or update schema:

```bash
npx wrangler d1 execute rush_fan_parties --remote --file=./functions/db/schema.sql
```

---

## 4. Database Management via Cloudflare Dashboard

If you prefer a visual web interface over terminal commands:

1. Log in to the Cloudflare Dashboard (`dash.cloudflare.com`).
2. Select your account (`m2web@yahoo.com`).
3. In the left sidebar, navigate to **Storage & Databases** > **D1 SQL Database**.
4. Click on **rush_fan_parties**.
5. Click the **Tables** tab, then select the `meetups` table to browse rows.
6. Click the **Console** tab to execute ad-hoc SQL queries directly in your browser.

---

## 5. AI Moderation Configuration

The system uses Google Gemini 3.6 Flash to automatically evaluate user submissions before publishing.

### How Moderation Works

1. Fan submits meetup via `POST /api/parties`.
2. The endpoint checks for `GEMINI_API_KEY` (or `GOOGLE_API_KEY`).
3. **If key is present**: Sends title, description, venue, and city to Gemini with a rock fan site guardrail prompt. If Gemini returns `approved: true`, status is set to `approved`. Otherwise, it is set to `pending_review`.
4. **If key is absent or API fails**: Submissions default to `pending_review` to prevent unmoderated spam from reaching the public site.

### Setting Environment Variables in Cloudflare Pages

1. In the Cloudflare Dashboard, go to **Workers & Pages** > **Overview**.
2. Select the `rush-rock-trivia` Pages project.
3. Navigate to **Settings** > **Environment variables**.
4. Click **Add variables** under **Production**:
   - Variable name: `GEMINI_API_KEY`
   - Value: Your Google Gemini API Key
   - Type: **Secret** (encrypted)
5. Save the configuration.

---

## 6. Security and Abuse Controls

The system includes multiple layers of edge abuse protection:

1. **CORS Whitelist**:
   - Allowed origins: `https://rush2026.fyi`, `https://www.rush2026.fyi`, `https://rush-rock-trivia.pages.dev`, `*.rush-rock-trivia.pages.dev`, `http://localhost:3000`.
   - All responses include `Vary: Origin` to preserve cache isolation.

2. **Submission Rate Limiting**:
   - Enforced in `functions/api/parties.ts` via sliding-window IP tracking.
   - Capped at 3 submissions per 60 seconds per IP address.
   - Returns `429 Too Many Requests` with a `Retry-After: 60` response header.

3. **Field Length Caps**:
   - `name`: max 100 characters.
   - `venue_name`: max 100 characters.
   - `tour_city`: max 50 characters.
   - `description`: max 1000 characters.
   - `organizer_name`: max 100 characters.
   - `rsvp_link`: max 250 characters.

4. **Numeric Input Sanitization**:
   - Query parameters `lat`, `lon`, and `radius` are strictly verified using `Number.isFinite()` to prevent `NaN` values from polluting calculations.

---

## 7. Client Routing and URL Architecture

The application supports clean static URLs and client-side routing for fans sharing links:

| Path | Destination | Purpose |
| --- | --- | --- |
| `/` | `StartScreen` | Default landing hub (trivia, meetups, concierge). |
| `/cities` | `TourMeetupsView` | Direct access to city listings and RSVP links. |
| `/tours` | `TourMeetupsView` | Synonym route for tour meetups. |
| `/meetups` | `TourMeetupsView` | Canonical route for meetup listings. |
| `/chat` | `ChatInterface` | Direct access to the Synthetic Rush Fan concierge. |
| `/cities.html` | Static Landing | Standalone HTML fallback page for search engines and direct links. |
| `/tours.html` | Static Landing | Standalone HTML fallback page for search engines and direct links. |

---

## 8. Deployment and Verification

1. Merge PR #18 into `main` on GitHub.
2. Cloudflare Pages automatically detects the merge and triggers a build.
3. Verify the deployment at `https://rush2026.fyi` and test:
   - Clicking `📍 Cities & Tours` opens `TourMeetupsView`.
   - Filtering by city displays relevant meetups.
   - Clicking `💬 Ask Synthetic Rush Fan` opens the AI concierge with the event preloaded.
