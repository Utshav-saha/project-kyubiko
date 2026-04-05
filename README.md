# Kyubiko: Interactive Museum Discovery and Management Platform

Kyubiko is a full-stack web platform where users explore museums and artifacts, build personal collections, take fun quizzes, track rankings, and book museum tours, while managers manage museum content and operations.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Database Setup](#database-setup)
4. [Core Features](#core-features)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [System Architecture](#system-architecture)
8. [API Showcase](#api-showcase)
9. [Database Design and SQL Engineering](#database-design-and-sql-engineering)
10. [Demo Showcase](#demo-showcase)
11. [Deployment Notes](#deployment-notes)
12. [Limitations and Future Work](#limitations-and-future-work)
13. [Acknowledgements](#acknowledgements)

## Project Overview

Kyubiko is a Museum Exploration site that lets you view museums and their artifacts from around the world, create own "mini" museums with your favourite artifacts and share them among the community. 
You can also take fun quizzes about each museum and its artifacts, and buy tickets for on-site tours.

The platform supports two roles:

- Curators (users) who discover artifacts and create mini-museums.
- Managers who maintain artifact and quiz content, and review analytics.

### Objectives

- Provide an engaging digital museum-learning experience.
- Demonstrate strong full-stack architecture and API design.
- Use advanced PostgreSQL features (functions, triggers, procedures) for data integrity and automation.

## Quick Start

### Run in Browser (Vercel)

- Live app: https://project-kyubiko.vercel.app

### Run Locally in 5 Simple Steps

1. Install requirements: Node.js (LTS), npm, and PostgreSQL.
2. Install dependencies from project root:

```bash
npm install
cd client && npm install
```

3. Set environment variables (use the example files for reference):

- Backend template: `server/.env.example`
- Frontend template: `client/.env.example`

Backend (`server/.env`):

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (optional, default `6543`)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Frontend (`client/.env`):

- `VITE_API_URL`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

4. Start backend API from root:

```bash
node api/index.js
```

5. Start frontend from `client` in a second terminal and open the shown localhost URL:

```bash
npm run dev
```

That is it. The frontend talks to the API while both servers are running.

## Database Setup

Run database setup before starting the backend for the first time.

### Recommended (using `DATABASE_URL`)

From the project root, execute SQL files in this order:

```bash
psql "$DATABASE_URL" -f server/table_create.sql
psql "$DATABASE_URL" -f server/artifacts.sql
psql "$DATABASE_URL" -f server/quiz_setup.sql
psql "$DATABASE_URL" -f server/tour_manage.sql
psql "$DATABASE_URL" -f server/achievements.sql
```

### Alternative (explicit user and database)

```bash
psql -U your_user -d your_database -f server/table_create.sql
psql -U your_user -d your_database -f server/artifacts.sql
psql -U your_user -d your_database -f server/quiz_setup.sql
psql -U your_user -d your_database -f server/tour_manage.sql
psql -U your_user -d your_database -f server/achievements.sql
```

### Why this order

1. `table_create.sql` creates the core schema and base SQL routines.
2. `artifacts.sql` and `quiz_setup.sql` add content data.
3. `tour_manage.sql` and `achievements.sql` add additional routines and trigger logic that depend on existing tables.

### Quick verification

1. Start backend: `node api/index.js`
2. Start frontend: `cd client && npm run dev`
3. Open the app and verify login, museum listing, and quiz pages load without SQL errors.

## Core Features

### User Experience

- Secure registration/login with JWT authentication.
- Museum and artifact exploration from museums around the world on live map with search and filters. Community museum to view other user(curator)'s created collections known as mini-museums
- For every museum, can attempt museum-specific trivia and book available tours (payment system is simulated only)
- Personalized favorites and My Museums collection.
- Profile with achievements and quiz history.

### Interactive Learning

- Museum-specific quizzes.
- Quiz scoring with completion time tracking.
- Leaderboard ranking.

### Community and Curation

- Community mini museums with option to like and review.
- Curator section and museum content creation workflows.

### Tour and Booking Module

- Tour overview and slot availability.
- Booking lifecycle with ticket details.
- Revenue and booking insights for management.

### Manager and Analytics Module

- Artifact CRUD and quiz CRUD tools.
- Image lifecycle management using Cloudinary.
- Analytics endpoints for distribution and engagement.

## Tech Stack

### Frontend

- React 19
- Vite 7
- React Router DOM
- Tailwind CSS 4
- DaisyUI
- Leaflet and React-Leaflet (map visualization)
- Recharts (dashboard charts)
- GSAP (animations)

### Backend

- Node.js
- Express 5
- JWT (jsonwebtoken)
- bcrypt
- CORS and dotenv

### Database

- PostgreSQL (via `pg` driver)
- SQL-first schema and logic in [server/table_create.sql](server/table_create.sql)

### External APIs and Services

- The Metropolitan Museum of Art Collection API (artifact ingestion)
- Louvre dataset/API-based seeding flow
- Cloudinary (media storage and cleanup)

## Project Structure

The structure below shows the main application files only, excluding generated folders such as `node_modules` and non-essential seed scripts.

```text
project-kyubiko/
|- api/
|  |- index.js
|- client/
|  |- src/
|  |  |- components/
|  |  |- pages/
|  |  |- config.js
|  |  |- main.jsx
|  |  |- App.jsx
|  |- public/
|  |- package.json
|  |- .env.example
|- server/
|  |- routes/
|  |  |- auth.js
|  |  |- search.js
|  |  |- explore.js
|  |  |- museum.js
|  |  |- card.js
|  |  |- view.js
|  |  |- quiz.js
|  |  |- leaderboard.js
|  |  |- profile.js
|  |  |- tour.js
|  |  |- manager.js
|  |  |- manager_quiz.js
|  |  |- analytics.js
|  |- middleware/
|  |  |- authorization.js
|  |- utils/
|  |  |- jwtGenerator.js
|  |- db.js
|  |- table_create.sql
|  |- quiz_setup.sql
|  |- .env.example
|- vercel.json
|- package.json
|- README.md
```

## System Architecture

Kyubiko follows a client-server architecture.

1. React frontend sends requests to Express API routes.
2. Express routes enforce auth/role policies where required.
3. Routes execute SQL against PostgreSQL using pooled connections.
4. Business logic is split between route-level orchestration and DB-level SQL functions/procedures/triggers.
5. Responses return normalized JSON objects for frontend rendering.

### Authentication Flow

1. User registers/logs in via auth endpoints.
2. Backend signs JWT with `user_id` and `role`.
3. Client stores token and sends it with protected requests.
4. Authorization middleware verifies token and injects user context.

### Data Engineering Philosophy

- API layer handles request validation, access control, and transaction boundaries.
- DB layer handles integrity checks, automated updates, category mapping, and stats aggregation.

## API Showcase

All routes are mounted in [api/index.js](api/index.js).

### Auth APIs

- `/auth/register`, `/auth/login`
- Purpose: account creation, credential validation, JWT issuance.

### Discovery and Exploration APIs

- `/search`, `/search/suggest`, `/search/filters`
- `/explore/archives`, `/explore/community`, `/explore/community/:id/like`
- `/landing/top-artifacts`
- Purpose: search, discovery, live suggestions, and community engagement.

### Museum and Artifact Interaction APIs

- `/museum/info/:id`, `/museum/:id/artifacts`, `/museum/favorite`
- `/card/view`, `/card/fav`, `/card/reviews`, `/card/add_review`
- `/view/*` for section and artifact composition flows
- Purpose: museum detail views, artifact interactions, and user-generated curation.

### Quiz and Leaderboard APIs

- `/quiz/:quizId/meta`, `/quiz/:quizId/questions`, `/quiz/:quizId/complete`
- `/leaderboard/:id`
- `/manager-quiz/*`
- Purpose: quiz delivery, scoring, result persistence, and ranking.

### Profile and Achievement APIs

- `/profile/overview`, `/profile/achievements`, `/profile/quiz-results`, `/profile/suggestions`
- Purpose: personal progress and recommendation features.

### Tour and Operations APIs

- `/tour/overview`, `/tour/book`, `/tour/my-bookings`, `/tour/revenue-total`
- Purpose: scheduling, booking operations, and operational analytics.

### Manager and Analytics APIs

- `/manager/*`
- `/analytics/museum/distribution`, `/analytics/museum/engagement`
- Purpose: platform administration, content control, and performance tracking.

## Database Design and SQL Engineering

Primary schema lives in [server/table_create.sql](server/table_create.sql).

### Core Table Families

- Identity and user model: `users`
- Museum entities: `museums`, `locations`, `country`, `categories`
- Artifact and engagement: `artifacts`, `favorites`, `artifacts_views`, `reviews`
- Community: `mini_museums`, `mini_museum_likes`, `sections`
- Learning: `quizzes`, `questions`, `options`, `user_quiz`, `achievements`
- Tour operations: `tours`, `time_slots`, `bookings`
- Analytics storage: `museum_daily_stats`

### Query and Logic Patterns

- Dynamic filters with optional clauses.
- Pagination via `LIMIT/OFFSET` and total tracking.
- Ranking and tie-breaking using score and completion time.
- CTEs and aggregate pipelines for profile and leaderboard views.
- Null-safe operations with `COALESCE`.

### Functions, Triggers, and Procedures

Kyubiko highlights database-native logic to keep business rules close to data.

#### Functions

- `check_duplicate_artifact()`
- `increment_count()`
- `last_10_records()`
- `update_daily_views_stats()`
- `update_daily_additions_stats()`
- `update_daily_bookings_stats()`
- `get_category(p_department)`
- `get_location_id(...)`
- `increment_mini_museum_likes(p_mini_museum_id)`
- `toggle_mini_museum_like(p_user_id, p_mini_museum_id)`

#### Triggers

- `prevent_duplicate_artifact`
- `increase_view_count`

#### Procedure

- `create_ques_ops(...)`

### Why This Matters

- Data integrity: duplicate prevention and constrained relationships.
- Automation: counters and stats update without manual reconciliation.
- Maintainability: reusable SQL logic reduces route complexity.
- Auditability: core behavior is explicit in schema-level SQL.

## Features Showcase and Walkthrough

In the **Landing Page**, we showcased the top 4 artifacts viewed and favorited by curators on the site.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401861/Image_4-5-26_at_7.35_PM_hnyl0e.png)

### A. User (Curator) Side
After **Login**, users can visit the **Explore Page**, where they can search on a live map the Museums they would like to view.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401862/Image_4-5-26_at_7.43_PM_vb11se.png)

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401861/Image_4-5-26_at_7.56_PM_cua7dm.png)

Next is the **Search** page, where users can look up artifacts from across all museums and add them to their **Wishlist**.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401861/Image_4-5-26_at_8.06_PM_xzrqux.png)

They can then create their own **Mini-Museum** in the **My Museums** page by giving it a name, description and a cover image. 

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401863/Image_4-5-26_at_7.41_PM_vh8eql.png)

In the mini-museum, they can add sections to categorize their artifacts, and then select artifacts from their wishlist to add into each section. 

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401862/Image_4-5-26_at_8.18_PM_txy1jf.png)

Upon entering any museum's page, users can view the museum's collection of artifacts and filter them by category, and add to their favorites. The same is applicable for Community (other user's) museums.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401861/Image_4-5-26_at_8.10_PM_dvib5f.png)

Using the Take Trivia option, they can attempt a short **Trivia** about a museum and its artifacts, and then see their rank on the **leaderboard**.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401861/Image_4-5-26_at_8.11_PM_n3pcxk.png)

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401863/Image_4-5-26_at_8.12_PM_m0dugk.png)

They can also click on 'Book a Tour' on a Museum Page, from where they can select an available tour to purchase an on-site visit for.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401863/Image_4-5-26_at_8.13_PM_oeddcx.png)

After payment is successful, a **ticket** will be generated for the user, which can be downloaded as an image.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401863/Image_4-5-26_at_8.14_PM_r6tjrq.png)

In the **Profile** page, users can view suggested artifacts to add to their wishlist based on their mini-museums and recently searched artifacts. They can also view their tour tickets and some fun achievement badges (like when they garner a certain amount of likes on their mini-museum from other users etc.).

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775401863/Image_4-5-26_at_8.19_PM_ksknrm.png)

### B. Manager (Museum Representative) Side

After **Login**, the manager can see their assigned museum's details and all the artifacts listed in the **Museum** Page.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775403888/Image_4-5-26_at_9.37_PM_rebazn.png)

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775403889/Image_4-5-26_at_9.39_PM_fwjj75.png)

They can choose to add, delete and edit artifacts as they see fit.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775403890/Image_4-5-26_at_9.38_PM_lqishr.png)

They can edit and add questions to the Museum's Trivia in the **Quiz** page.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775403888/Image_4-5-26_at_9.42_PM_il7h1f.png)

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775403888/Image_4-5-26_at_9.43_PM_qdpzix.png)

In the **Tours** Page, managers can create new tours, manage existing ones, and view individual and total generated revenue from active tours.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775403889/Image_4-5-26_at_9.41_PM_aa1smm.png)

In the **Profile** Page, they can view their Museum's performance with visual analytics and dashboard metrics.

![Image](https://res.cloudinary.com/djiuqhg6i/image/upload/v1775407749/Image_4-5-26_at_10.48_PM_ilggo2.png)

The **Explore** and **Search** page are similar to the User's side.

## Deployment Notes

- Backend entrypoint is [api/index.js](api/index.js).
- API includes path rewriting for Vercel environment (`/api` prefix handling).
- Ensure production `DATABASE_URL`, `JWT_SECRET`, and Cloudinary credentials are configured.

### Build for Production

From project root:

```bash
npm run build
```

## Limitations and Future Work

- Add refresh-token flow and stronger session security.
- Expand test coverage (API integration + frontend component tests).
- Add full API documentation (OpenAPI/Swagger).
- Improve observability with structured logs and metrics.
- Add recommendation personalization using user behavior signals.

## Acknowledgements

- Metropolitan Museum of Art Collection API for public artifact data.
- Louvre Museum (France) and Tokyo National Museum data sources used in seed pipeline.
- Open-source libraries that powered frontend and backend development.
