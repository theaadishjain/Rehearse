# Rehearse

Upload your resume and a job description to get:

- a match score for the role
- likely technical and behavioral interview questions, with what the interviewer wants to hear
- your skill gaps, ranked by how much they matter
- a day-by-day preparation plan
- a rewritten resume tailored to the job, as a PDF

**Stack:** React 19 + Vite (frontend), Express 5 + MongoDB (backend), Google Gemini (AI), Puppeteer (PDF rendering).

## Requirements

- **Node.js 20.19 or newer** (22 LTS recommended, see `.nvmrc`). Older versions fail: `pdf-parse` crashes on Node < 20.16 and Vite 7 needs 20.19+.
- **MongoDB**, either installed locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.
- A **Google Gemini API key** from <https://aistudio.google.com/apikey>.

## Setup

```bash
# Backend
cd Backend
npm install            # also downloads a headless Chrome for PDF rendering
cp .env.example .env   # then fill in MONGO_URI, JWT_SECRET and GOOGLE_GENAI_API_KEY
npm run dev            # http://localhost:3000

# Frontend (in a second terminal)
cd Frontend
npm install
cp .env.example .env   # VITE_API_URL must point at the backend
npm run dev            # http://localhost:5173
```

If port 3000 is taken, set `PORT` in `Backend/.env` and `VITE_API_URL` in `Frontend/.env` to match.
If the frontend runs on a different URL, set `CLIENT_URL` in `Backend/.env` so CORS allows it.

## Configuration (`Backend/.env`)

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGO_URI` | yes | | MongoDB connection string |
| `JWT_SECRET` | yes | | Signs login tokens; at least 32 characters |
| `GOOGLE_GENAI_API_KEY` | yes | | Gemini API key |
| `PORT` | no | `3000` | Port the API listens on |
| `CLIENT_URL` | no | `http://localhost:5173` | Frontend origin allowed by CORS |
| `GEMINI_MODEL` | no | `gemini-3.8-flash` | Gemini model; change it when Google retires a model |
| `PDF_CONCURRENCY` | no | `2` | Maximum resume PDFs rendered at the same time |
| `NODE_ENV` | no | `development` | Set to `production` to send the auth cookie only over HTTPS |
| `PREVIEW_PER_IP_PER_HOUR` | no | `3` | Landing-page "try it" requests per visitor IP per hour |
| `PREVIEW_PER_DAY` | no | `200` | Landing-page "try it" requests from all visitors per day |
| `GENERATE_PER_USER_PER_HOUR` | no | `10` | Reports and resume PDFs per logged-in user per hour |
| `TRUST_PROXY` | no | off | Number of proxies in front of the app, so per-IP limits see the real visitor IP |

The server checks these at startup and exits with a clear message if a required one is missing.

## Tests

```bash
cd Backend
npm test
```

The tests need MongoDB running on `mongodb://127.0.0.1:27017` (override with `TEST_MONGO_URI`). They use a
separate `interview-ai-test` database that is deleted afterwards. Gemini is stubbed out, so no API key or
internet access is needed. One test starts a headless Chrome, so the run takes a few seconds.

They cover input validation, the auth cookie, logout and token expiry, upload checks, users being unable to
see each other's reports or resumes, and the PDF renderer being unable to load external URLs.

## API

All `/api/interview` routes require the login cookie. Errors are JSON: `{ "message": "...", "errors"?: [...] }`.

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `{ username, email, password }` | Create an account and log in |
| `POST` | `/api/auth/login` | `{ email, password }` | Log in |
| `GET` | `/api/auth/logout` | | Log out and revoke the token |
| `GET` | `/api/auth/get-me` | | Current user |
| `POST` | `/api/interview/preview` | `{ jobDescription, selfDescription? }` | Public, no login: job title and three likely questions. Nothing is stored. Rate limited |
| `POST` | `/api/interview/` | multipart: `jobDescription`, `resume` (PDF, max 3MB) and/or `selfDescription` | Generate a report |
| `GET` | `/api/interview/` | | List your reports |
| `GET` | `/api/interview/report/:id` | | One of your reports |
| `POST` | `/api/interview/resume/pdf/:id` | | Tailored resume PDF for one of your reports |
| `GET` | `/api/health` | | Health check |

## Security notes

- Passwords are hashed with bcrypt. The login token is an `HttpOnly`, `SameSite=Lax` cookie, and also `Secure` in production.
- Every report lookup is scoped to the logged-in user.
- User text sent to Gemini is fenced off and the model is told to treat it as data, not instructions.
- The resume HTML produced by Gemini is rendered with JavaScript disabled and all network requests blocked.
- Every route that calls Gemini is rate limited: per IP and per day for the public preview, per user for reports and PDFs.
  The counters live in memory, so they reset on restart and aren't shared between server processes; use a shared
  store such as Redis if you run more than one.

## Author

Built by **Aadish Jain**.
