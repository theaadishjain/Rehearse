# Rehearse

Rehearse helps you prepare for one specific job interview. You paste the job posting, add your resume (or a few lines about yourself), and it gives you a prep plan built around that one role.

I built it because most interview prep is generic. The same list of "top 50 questions" gets handed to everyone, whether they're applying to a startup or a bank. The job posting already tells you a lot about what the interview will look like, so the idea was to start from the posting and work backwards.

## What you get

For each job you add, Rehearse writes a plan with:

- **A match score** out of 100, showing how well your background fits the role
- **Technical and behavioural questions** you're likely to be asked, each with what the interviewer is really testing and how to approach the answer
- **Skill gaps**, marked high, medium or low, so you know where to spend your time
- **A day-by-day preparation plan** with specific tasks for each day
- **A rewritten resume** tailored to the posting, downloadable as a PDF

Plans are saved to your account, so you can come back to them the night before the interview.

## Tech stack

**Frontend:** React 19, Vite 7, React Router 7, Sass, Axios

**Backend:** Node.js, Express 5, MongoDB with Mongoose, Zod for validation

**AI and documents:** Google Gemini for writing the plans, pdf-parse for reading uploaded resumes, Puppeteer (headless Chrome) for turning the rewritten resume into a PDF

**Auth:** JWT stored in an HttpOnly cookie, passwords hashed with bcrypt

## How it works

1. You submit a job description, plus a resume PDF and/or a short description of yourself.
2. The backend checks the file is a real PDF (not just named `.pdf`) and pulls the text out of it.
3. Your details and the posting are sent to Gemini with a fixed response schema, so the answer always comes back in the same structure. The reply is validated before anything is saved, and incomplete items are dropped rather than breaking the whole plan.
4. The plan is saved to MongoDB under your account.
5. When you ask for the resume, Gemini writes it as HTML, and Puppeteer renders that to an A4 PDF. The page is rendered with JavaScript turned off and all network requests blocked, since the HTML comes from model output.

## Project structure

```
Backend/
  server.js              starts the server, connects to MongoDB
  src/
    app.js               Express app, CORS, routes
    config/              environment variables and database connection
    controllers/         request handlers for auth and interview reports
    middlewares/         auth check, rate limits, file upload, validation, errors
    models/              Mongoose models (users, reports, logged-out tokens)
    routes/              API routes
    services/            Gemini calls and PDF rendering
    validators/          Zod schemas for request bodies
  tests/                 API and unit tests

Frontend/
  src/
    features/landing/    landing page
    features/auth/       login, register, session handling
    features/interview/  workspace, report page, API calls
    components/          header, loaders, shared pieces
    lib/                 API client and small helpers
```

## Running it locally

You'll need:

- **Node.js 20.19 or newer.** Node 22 is what I use (there's an `.nvmrc`). Older versions won't work: pdf-parse crashes below 20.16 and Vite 7 needs 20.19.
- **MongoDB**, either installed on your machine or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.
- **A Gemini API key**, which you can get free from [Google AI Studio](https://aistudio.google.com/apikey).

Start the backend:

```bash
cd Backend
npm install            # this also downloads a copy of Chrome for PDF rendering
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET and GOOGLE_GENAI_API_KEY
npm run dev
```

Then the frontend, in a second terminal:

```bash
cd Frontend
npm install
cp .env.example .env   # VITE_API_URL should point at the backend
npm run dev
```

Open http://localhost:5173.

The backend runs on port 3000 by default. If you change `PORT` in `Backend/.env`, change `VITE_API_URL` in `Frontend/.env` to match.

To generate a value for `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Environment variables

### Backend (`Backend/.env`)

| Variable | Required | Default | What it does |
| --- | --- | --- | --- |
| `MONGO_URI` | yes | | MongoDB connection string |
| `JWT_SECRET` | yes | | Signs login tokens. Must be at least 32 characters |
| `GOOGLE_GENAI_API_KEY` | yes | | Your Gemini API key |
| `PORT` | no | `3000` | Port the API listens on |
| `CLIENT_URL` | no | `http://localhost:5173` | The frontend's address, used for CORS |
| `GEMINI_MODEL` | no | `gemini-3.8-flash` | Which Gemini model to use |
| `PDF_CONCURRENCY` | no | `2` | How many resume PDFs can render at the same time |
| `NODE_ENV` | no | `development` | Set to `production` when deployed |
| `LOGIN_FAILURES_PER_15_MIN` | no | `5` | Failed logins allowed per IP and email in 15 minutes |
| `REGISTER_PER_IP_PER_HOUR` | no | `5` | New accounts allowed per IP per hour |
| `GENERATE_PER_USER_PER_HOUR` | no | `10` | Plans and resume PDFs per user per hour |
| `TRUST_PROXY` | no | off | Number of proxies in front of the app. Set to `1` on most hosts |
| `CROSS_SITE_COOKIE` | no | `false` | Set to `true` if the frontend and backend are on different domains |
| `CHROME_NO_SANDBOX` | no | `false` | Set to `true` if PDFs fail because Chrome can't start its sandbox |

The server checks the required ones at startup and stops with a clear message if anything is missing.

### Frontend (`Frontend/.env`)

| Variable | What it does |
| --- | --- |
| `VITE_API_URL` | Address of the backend, for example `http://localhost:3000` |

## API

Everything under `/api/interview` needs you to be logged in. Errors come back as JSON in the form `{ "message": "..." }`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account (`username`, `email`, `password`) and log in |
| `POST` | `/api/auth/login` | Log in with `email` and `password` |
| `POST` | `/api/auth/logout` | Log out. The token is revoked until it expires |
| `GET` | `/api/auth/get-me` | The logged-in user |
| `POST` | `/api/interview/` | Create a plan. Multipart form with `jobDescription`, and `resume` (PDF, up to 3MB) and/or `selfDescription` |
| `GET` | `/api/interview/` | List your plans |
| `GET` | `/api/interview/report/:id` | Get one of your plans |
| `POST` | `/api/interview/resume/pdf/:id` | Download the tailored resume for a plan |
| `GET` | `/api/health` | Health check |

## Tests

```bash
cd Backend
npm test
```

The tests need MongoDB running locally on `mongodb://127.0.0.1:27017` (you can point them elsewhere with `TEST_MONGO_URI`). They use their own `interview-ai-test` database and delete it when they finish. Gemini is replaced with a stub, so you don't need an API key or an internet connection to run them.

They cover input validation, the login cookie, logout, rate limits, file upload checks, users not being able to see each other's plans, and the PDF renderer not being able to load anything from the internet.

## Security

- Passwords are hashed with bcrypt and never sent back to the browser.
- The login token lives in an HttpOnly cookie, so JavaScript on the page can't read it.
- Logging out revokes the token on the server, not just in the browser.
- Every plan lookup is tied to the logged-in user, so nobody can open someone else's plan or resume.
- Login, sign-up and plan generation are rate limited to slow down password guessing and protect the AI quota.
- Text from users is fenced off in the prompt and the model is told to treat it as data, so a job posting can't give the AI new instructions.
- The rate limit counters are kept in memory. That's fine for a single server, but if you run more than one instance you'd want a shared store like Redis.

## Deploying

The setup I use is MongoDB Atlas for the database, Render for the backend and Vercel for the frontend. The free tiers of all three work.

**Backend on Render.** Create a web service from the repo with the root directory set to `Backend`, build command `npm install` and start command `npm start`. Add the environment variables from the table above, plus `NODE_ENV=production`, `NODE_VERSION=22`, `TRUST_PROXY=1` and `CROSS_SITE_COOKIE=true`. Use a new `JWT_SECRET` rather than your local one. Puppeteer is already configured (in `Backend/.puppeteerrc.cjs`) to keep Chrome inside the project folder, which Render needs.

**Frontend on Vercel.** Import the repo with the root directory set to `Frontend` and add `VITE_API_URL` with your Render URL. The included `vercel.json` makes sure links like `/login` still work when you refresh the page.

**Last step.** Go back to Render and set `CLIENT_URL` to your Vercel URL.

A few things worth knowing:

- Render's free plan puts the backend to sleep after about 15 minutes without traffic, so the first request after that can take up to a minute.
- Gemini's free tier has a daily request limit. Each plan and each resume PDF uses one request, so for anything beyond personal use you'll want billing turned on in Google AI Studio.
- With the frontend and backend on different domains, Safari blocks the login cookie. Putting both on one domain you own (for example `yourapp.com` and `api.yourapp.com`) fixes that, and then `CROSS_SITE_COOKIE` can be removed.

## Limitations

- The questions are educated guesses based on the posting and your background, not the actual questions a company will ask. Treat them as practice.
- Scanned resumes (images rather than text) can't be read. In that case, a short self description works instead.
- The rewritten resume is told to stick to the facts in your original, but it's still AI-written. Read it before you send it anywhere.

## Author

Built by **Aadish Jain**.

## License

MIT. See [LICENSE](LICENSE).
