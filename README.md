
# AI LeadFlow

AI LeadFlow is an AI-powered lead management CRM, designed initially for real estate. It combines lead management, AI-based lead qualification through an n8n workflow, a Kanban sales pipeline, and a dashboard with live statistics and charts.

When a lead is created, the backend sends it to an n8n workflow. n8n asks an LLM (via the Groq API) to score and qualify the lead, and the result is saved with the lead in MongoDB.

## Features

- **Lead management:** create, view, edit, delete, and search leads.
- **AI lead qualification:** each new lead gets a score (0–100), a priority (`hot`, `warm`, `cold`), and a written analysis.
- **Kanban pipeline:** drag and drop leads between status columns (New, Contacted, Qualified, Negotiation, Converted, Lost).
- **Dashboard:** total, hot, warm and cold leads, average AI score, converted leads, conversion rate, a bar chart (leads by status), a pie chart (priority distribution), and the five most recent leads.
- **Input validation:** required first name, last name, and email, plus a non-negative budget, validated with Express Validator.

## Tech stack

| Layer      | Technologies                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| Frontend   | React, TypeScript, Vite, Tailwind CSS v4, React Router DOM, Lucide React, Recharts, native Fetch API |
| Backend    | Node.js, Express.js (ES Modules), Mongoose, Express Validator, Nodemon                               |
| Database   | MongoDB Atlas                                                                                        |
| Automation | n8n (run locally with Docker Compose)                                                                |
| AI         | Groq API, model `openai/gpt-oss-20b`                                                               |

## Architecture

```text
React frontend  ──REST──▶  Express API  ──webhook──▶  n8n  ──HTTP──▶  Groq API
 (port 5173)               (port 5000)               (port 5678)
                               │
                               ▼
                         MongoDB Atlas
```

The frontend never calls the LLM directly. All AI processing happens inside the n8n workflow.

### Lead creation flow

1. The user creates a lead in the React app.
2. The frontend sends `POST /api/leads` to Express.
3. Express validates the data and stores the lead in MongoDB.
4. Express sends the lead to the n8n webhook (`n8nService.js`, native `fetch`).
5. n8n sends the lead data to Groq (`openai/gpt-oss-20b`).
6. The model returns a `leadScore`, `priority`, and `aiAnalysis`.
7. A Code node removes any Markdown code fences and parses the JSON.
8. n8n returns the result to Express.
9. Express updates the lead in MongoDB and returns it to the frontend.

> **Note:** this flow is currently **synchronous**. The `POST /api/leads` response is returned only after the n8n workflow finishes.

## Project structure

```text
ai-leadflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── leadController.js
│   │   ├── middlewares/
│   │   │   └── leadValidation.js
│   │   ├── models/
│   │   │   └── Lead.js
│   │   ├── routes/
│   │   │   └── leadRoutes.js
│   │   ├── services/
│   │   │   └── n8nService.js
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Leads.tsx
│   │   │   ├── Pipeline.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── lead.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
│
├── automation/
│   └── docker-compose.yml
│
└── README.md
```

## Requirements

- Node.js and npm
- Docker Desktop
- A MongoDB database (MongoDB Atlas was used for this project)
- A Groq API key

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/ilyassnssiri20/ai-leadflow.git
cd ai-leadflow
```

### 2. Configure and start the backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
N8N_WEBHOOK_URL=http://localhost:5678/webhook/analyze-lead
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Start n8n

In a second terminal:

```bash
cd automation
docker compose up -d
```

n8n runs at `http://localhost:5678` in a container named `ai-leadflow-n8n`, with a persistent `n8n_data` volume and the `Africa/Casablanca` timezone. `N8N_SECURE_COOKIE=false` is set for local HTTP development only.

### 4. Create the `AI Lead Analysis` workflow in n8n

Create a workflow named **AI Lead Analysis** with these nodes:

1. **Webhook**
   - HTTP Method: `POST`
   - Path: `analyze-lead`
   - Authentication: None
   - Response mode: **When Last Node Finishes**
2. **HTTP Request** (Groq)
   - Method: `POST`
   - URL: `https://api.groq.com/openai/v1/chat/completions`
   - Headers: `Authorization: Bearer <your Groq API key>` and `Content-Type: application/json`
   - Body: model `openai/gpt-oss-20b`, temperature `0.2` (as a number), a system prompt asking for lead qualification, and a user message containing the lead data
3. **Code**
   - Removes Markdown code fences if present and parses the JSON returned by the model

The workflow must return this JSON to Express:

```json
{
  "leadScore": 85,
  "priority": "hot",
  "aiAnalysis": "Explanation of the lead qualification."
}
```

Activate (publish) the workflow so the production URL works:

- Production: `http://localhost:5678/webhook/analyze-lead`
- Test: `http://localhost:5678/webhook-test/analyze-lead` (only works while the workflow is listening for a test event)

The Groq API key is configured **inside n8n**. It is not read by the frontend or the Express backend.

### 5. Start the frontend

In a third terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The API base URL is currently set to `http://localhost:5000/api` in `frontend/src/services/api.ts`.

Keep the backend and n8n running when testing the full application.

## Data model

### Lead

| Field                        | Notes                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `firstName`, `lastName`  | Required                                                                        |
| `email`                    | Required                                                                        |
| `phone`                    |                                                                                 |
| `source`                   | `website`, `facebook`, `linkedin`, `referral`, `other`                |
| `budget`                   | Non-negative number                                                             |
| `location`                 |                                                                                 |
| `status`                   | `new`, `contacted`, `qualified`, `negotiation`, `converted`, `lost` |
| `leadScore`                | Number from 0 to 100, default `0`                                             |
| `priority`                 | `hot`, `warm`, `cold` (set by the AI)                                     |
| `aiAnalysis`               | Text analysis generated by the AI                                               |
| `createdAt`, `updatedAt` | Timestamps                                                                      |

## API endpoints

Base URL: `http://localhost:5000/api`

| Method     | Endpoint       | Description                           |
| ---------- | -------------- | ------------------------------------- |
| `POST`   | `/leads`     | Create a lead and request AI analysis |
| `GET`    | `/leads`     | Get all leads                         |
| `GET`    | `/leads/:id` | Get one lead                          |
| `PUT`    | `/leads/:id` | Update a lead                         |
| `DELETE` | `/leads/:id` | Delete a lead                         |

## Frontend pages

- **Dashboard:** statistics and charts calculated from real backend data.
- **Leads:** table with search/filter, plus create, edit, and delete forms.
- **Pipeline:** Kanban board using native HTML drag-and-drop. Dropping a card calls `updateLead()` to save the new status.
- **Settings:** available from the sidebar.

## Security

- Never commit `.env` files, API keys, or database credentials.
- Keep your Groq API key only in n8n, and your MongoDB URI only in `backend/.env`.
- If you export the n8n workflow to this repository, remove credentials from the export first.
- Make sure `.gitignore` excludes at least:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
build/
*.log
.DS_Store
.vscode/
```

## Current limitations

- AI analysis runs synchronously when a lead is created, so creation takes as long as the n8n and Groq calls.
- The API base URL in the frontend is hardcoded for local development.
- The project currently runs locally only.
- There is no authentication.

## Possible future improvements

These are ideas, not implemented features:

- Lead details page with the full AI analysis
- Lead activity history
- Authentication and role-based access
- Email notifications and follow-up automation
- Asynchronous AI processing
- Deployment of the frontend, backend, database, and n8n

---

**Project:** AI LeadFlow
**Status:** In development
