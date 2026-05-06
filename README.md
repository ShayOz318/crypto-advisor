# Crypto Advisor (AI Crypto Investor Dashboard)

This project is a full-stack web app for a personalized crypto investor dashboard:

- Auth (Signup/Login)
- First-time onboarding quiz (preferences)
- Daily dashboard with sections based on preferences
- Thumbs up/down feedback per item (stored for future improvements)

## Tech

- Frontend: React + Vite (`frontend/`)
- Backend: Spring Boot (`backend/`)
- DB: MongoDB (configured via `MONGODB_URI`)

## Run locally

### Backend

Set environment variables:

- `MONGODB_URI` (required)
- `JWT_SECRET` (required)
- `OPENROUTER_API_KEY` (optional; app has fallback if not set)

Then run:

```bash
cd backend
./mvnw spring-boot:run
```

Backend default: `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default: `http://localhost:5173`

## Notes for reviewers

- On login, backend returns a `needsOnboarding` flag; the frontend routes to onboarding only when needed.
- Dashboard sections are enabled/disabled based on `contentTypes` saved in onboarding.
- Feedback is stored with an `itemId` so it can be used later to improve recommendations.

## Bonus: suggested training/improvement process (design only)

The app can evolve recommendations over time by using an offline feedback-learning loop:

1. **Log feedback events**
   - Store `userId`, `sectionType`, `itemId`, `itemLabel`, `vote`, and timestamp.
   - Also store context snapshot when shown (selected assets, investor type, content types).

2. **Build a training dataset (daily/weekly batch)**
   - Positive label: `LIKE`
   - Negative label: `DISLIKE`
   - Features: user profile/preferences + content metadata (coin/topic/source/type/time).

3. **Train a lightweight ranking model**
   - Start with simple models (logistic regression / gradient boosting) to predict engagement probability.
   - Keep LLM generation for explanation text, but rank candidate content using the learned score.

4. **Serve personalized ranking**
   - For each section, generate candidate items from APIs.
   - Score candidates with the trained model.
   - Show top-N items per user preference profile.

5. **Evaluate and update safely**
   - Track CTR-like metrics (likes ratio), section engagement, and retention.
   - Retrain periodically and compare to previous model via A/B test or shadow evaluation.
   - Add guardrails for freshness/diversity so recommendations do not become too narrow.

This approach reuses the current feedback schema and adds a practical path to incremental personalization without changing the product flow.

