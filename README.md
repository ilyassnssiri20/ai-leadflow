# AI LeadFlow --- AI-Powered Lead Management CRM

AI LeadFlow is a lead management application that combines a CRM, an
AI-powered lead qualification workflow, and a visual sales pipeline.

The application is designed around a real-estate lead management use
case. It allows users to manage prospects, automatically analyze new
leads with an LLM, and monitor their progress through a sales pipeline.

## Features

-   **Lead management:** create, view, edit, and delete leads.
-   **AI lead qualification:** automatically calculate a lead score,
    assign a priority (`hot`, `warm`, or `cold`), and generate an
    analysis.
-   **Sales pipeline:** move leads between stages using a Kanban board.
-   **Dashboard:** display lead statistics, conversion rate, average AI
    score, and charts.
-   **REST API:** communicate between the React frontend and the Express
    backend.

## Tech stack

  Part                           Technologies
  ------------------------------ ------------------------------------------
  Frontend                       React, TypeScript, Vite, Tailwind CSS v4
  UI and charts                  Lucide React, Recharts
  Backend                        Node.js, Express.js
  Database                       MongoDB Atlas, Mongoose
  Automation                     n8n
  AI                             Groq API --- `openai/gpt-oss-20b`
  Local automation environment   Docker Compose

## Project structure

``` text
ai-leadflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── automation/
│   └── docker-compose.yml
│
└── README.md
```

> The structure above is a guide. Keep the actual folders and filenames
> in your repository if they differ.

## Requirements

Install the following before running the project:

-   Node.js and npm
-   Docker Desktop
-   A MongoDB database (for example, MongoDB Atlas)
-   A Groq API key

## Getting started

### 1. Clone the repository

``` bash
git clone https://github.com/YOUR_USERNAME/ai-leadflow.git
cd ai-leadflow
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Configure the backend

``` bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

``` env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
N8N_WEBHOOK_URL=http://localhost:5678/webhook/analyze-lead
```

Use your own credentials. **Never commit your real `.env` file or API
keys to GitHub.**

Start the backend:

``` bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Start n8n with Docker

Open another terminal:

``` bash
cd automation
docker compose up -d
```

Open n8n at:

`http://localhost:5678`

Configure or import the `AI Lead Analysis` workflow in n8n. The workflow
should:

1.  Receive a lead through a Webhook node using `POST` and the path
    `analyze-lead`.
2.  Send the lead information to the Groq Chat Completions API.
3.  Ask the model to return JSON containing `leadScore`, `priority`, and
    `aiAnalysis`.
4.  Parse the model response in a Code node.
5.  Return the parsed JSON from the webhook.

Set the webhook response mode to **When Last Node Finishes** so the
backend receives the AI analysis.

Activate or publish the workflow and use its production webhook URL in
`N8N_WEBHOOK_URL`. The production URL generally looks like:

``` text
http://localhost:5678/webhook/analyze-lead
```

The `/webhook-test/` URL is for manual testing and requires the workflow
to be listening for a test event.

### 4. Configure and start the frontend

Open another terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open the frontend at:

`http://localhost:5173`

Make sure the backend and n8n are running when testing the complete
application.

## API endpoints

The backend exposes the following lead endpoints:

  Method     Endpoint           Description
  ---------- ------------------ ---------------------------------------
  `GET`      `/api/leads`       Get all leads
  `GET`      `/api/leads/:id`   Get one lead
  `POST`     `/api/leads`       Create a lead and request AI analysis
  `PUT`      `/api/leads/:id`   Update a lead
  `DELETE`   `/api/leads/:id`   Delete a lead

New lead creation triggers the n8n workflow. The returned AI score,
priority, and analysis are saved with the lead in MongoDB.

## Lead lifecycle

The current pipeline stages are:

`new` → `contacted` → `qualified` → `negotiation` → `converted`

A lead can also be marked as `lost`.

AI priority values:

-   `hot`
-   `warm`
-   `cold`

## Important security notes

Before pushing the project to GitHub:

-   Do not commit `.env` files.
-   Do not include MongoDB credentials, Groq API keys, passwords, or
    private webhook URLs.
-   Keep `node_modules/`, build output, and local logs out of Git.
-   Add a safe `.env.example` containing variable names and placeholder
    values only.
-   Review the files staged for commit before pushing.

A root `.gitignore` should include at least:

``` gitignore
# Dependencies
node_modules/

# Environment variables and secrets
.env
.env.*
!.env.example

# Build output
dist/
build/

# Logs
*.log
npm-debug.log*

# Operating system / editor
.DS_Store
.vscode/
```

If you also have a real n8n workflow export, review it before
committing. Remove credentials and sensitive values from the export.

## Future improvements

Possible next steps include:

-   Lead details page with full AI analysis.
-   Lead activity history.
-   Authentication and role-based access.
-   Email notifications and follow-up automation.
-   Asynchronous AI processing for larger workloads.
-   Deployment of the frontend, backend, database, and n8n environment.

------------------------------------------------------------------------

**Project:** AI LeadFlow\
**Purpose:** AI-assisted lead management and sales pipeline\
**Status:** Development
