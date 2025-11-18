NutriFit AI
--------------------
An AI-powered nutrition and fitness platform that scans meals and analyzes body composition to deliver personalized calorie counts, fitness insights, and meal recommendations.


NutriFit AI is a full-stack web application designed to make healthy living easier through AI-driven nutrition and fitness analysis.
Users can upload meal photos, scan their bodies using a webcam, track caloric intake, and receive personalized insights tailored to their goals.

The platform uses a combination of OpenAI image models, TensorFlow.js BodyPix, and Next.js to create a fast, modern, and intelligent health assistant — all in the browser.


✨ Key Features

- AI Meal Analysis
Upload any meal photo and receive real-time calorie breakdowns and nutritional estimates using OpenAI’s image models.

- Body Scanner
Built with TensorFlow.js + BodyPix to estimate measurements and provide fitness ratios for personalized guidance.

- Personalized Recommendations
Tailored calorie intake suggestions, macro insights, and fitness guidance based on the user's scan + meal history.

- Multi-Page Smart Navigation
Separate dashboards for meals, fitness, scanning, and recommendations.

- Optimized Performance
Intelligent caching, image preprocessing, and efficient API routing for fast responses.

Modern UI/UX
Responsive, elegant design with Next.js, React, and TailwindCSS.

🛠️ Technologies Used
Frontend

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- AI & Vision
- OpenAI Image Models
- TensorFlow.js
- BodyPix

Backend

- Custom API Routes (Next.js App Router)
- Image processing + inference pipelines

Deployment

- Vercel (recommended)
- Cloud or custom hosting options

🚀 Getting Started
Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API Key
- Webcam (for body scanning features)

Installation Steps
## 1. Clone the repository
git clone <repository-url>
cd NutriFit-AI

## 2. Install dependencies
npm install

## 3. Configure environment variables

Create a .env.local file in the root directory:

OPENAI_API_KEY=your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

## 4. Run the development server
npm run dev

## 5. Access the application

Frontend: http://localhost:3000

API Routes: http://localhost:3000/api/
*

## 📁 Project Structure
```bash
NutriFit-AI/
├── app/                        # Next.js App Router pages and routes
│   ├── api/                    # API endpoints
│   ├── scan/                   # Body scanner page
│   ├── meals/                  # Meal analysis page
│   ├── recommendations/        # AI recommendations page
│   └── layout.tsx              # Root layout
├── components/                 # Reusable UI components
├── lib/                        # Utility functions, AI logic
├── public/                     # Static assets
├── styles/                     # Global styles
└── README.md                   # Documentation
```
📦 Available Scripts
Development
npm run dev

Production Build
npm run build
npm start

Linting
npm run lint

👤 Role & Contributions 

-Project Manager & Full-Stack Developer
- Built an AI-driven nutrition analysis using OpenAI vision models
- Designed and implemented the full BodyScanner using TensorFlow.js + BodyPix
- Developed three specialized AI agents for:
- Meal scanning
- Body analysis

Personalized recommendations

- Optimized performance using caching + image resizing pipelines
- Designed clean, modern UI using Next.js + TailwindCSS
- Built multi-page routing for a seamless user flow

## 🔮 Future Enhancements

-📱 Mobile meal scanning
- 🔊 Voice-based meal logging
- 🧬 Advanced nutrition profiling
- 📈 User progress dashboards
- 🤖 AI workout planning
- ⌚ Integration with wearables (Apple Health, Fitbit)
- 📚 Documentation

Architecture Overview

- AI Pipeline Explanation
- API Documentation
- Component Hierarchy





