<div align="center">
  <h1>ReActum (思行)</h1>
  <p>Read → Re-Act → Actum</p>
  <p>Transform reading notes into actionable life changes</p>
</div>

## What is ReActum?

ReActum is an AI-powered reading companion that helps you:

- Capture book notes and insights
- Generate actionable micro-actions from your reading (powered by Google Gemini AI)
- Visualize your knowledge with an interactive Mind Map
- Track your growth with weekly activity stats

## Live Demo

Visit: https://reactum.ai

---

## Features

| Feature | Description |
|---------|-------------|
| Note Taking | Capture book excerpts with tags and categories |
| AI Actions | Generate 3 concrete micro-actions per note (≤15 min each) |
| Mind Map | Visualize connections between books, notes, and themes |
| Growth Stats | Track your weekly action completion patterns |

---

## Tech Stack

- Frontend: React 19 + TypeScript
- Build: Vite
- AI: Google Gemini 2.5 Flash
- Deployment: Netlify
- Analytics: Google Analytics

---

## Run Locally

**Prerequisites:** Node.js

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env.local with your GEMINI_API_KEY
echo "GEMINI_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev
```

---

## Project Structure

```
reactum-/
├── App.tsx              # Main application
├── components/          # UI components
│   ├── GrowthStats.tsx     # Weekly activity chart
│   └── KnowledgeGraph.tsx  # Mind map visualization
├── services/
│   └── geminiService.ts    # AI integration
├── types.ts             # TypeScript definitions
└── constants.ts         # App constants & sample data
```

---

## Deployment

Deployed on Netlify: https://reactum.ai

Environment variables:
- `GEMINI_API_KEY`: Google Gemini API Key
- `VITE_` prefixed variables are automatically exposed to the client

---

## License

MIT

---

## Contact

For questions or feedback, visit https://reactum.ai or email z87051@gmail.com
