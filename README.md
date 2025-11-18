NutriFit AI

An AI-powered nutrition and fitness platform that analyzes meals and user body composition to deliver personalized calorie counts, fitness insights, and meal recommendations.

🎯 Project Overview

NutriFit AI is a full-stack, AI-driven web application designed to simplify nutrition tracking and support healthier habits.
Using a combination of computer vision, nutrition modeling, and body scanning, users can upload meal photos, analyze their physical measurements, and receive personalized health guidance — all inside a fast, responsive web app built with modern technologies.

NutriFit AI combines:

AI meal recognition

Body measurement scanning

Personalized insights

A seamless, multi-page UX

…to help users make smarter, data-driven decisions about their health.

✨ Key Features
🍽️ AI Meal Analysis

Upload meal photos and get real-time calorie breakdowns using OpenAI’s multimodal models and custom preprocessing.

📸 Body Scanner

Uses TensorFlow.js + BodyPix to analyze body shape, estimate measurements, and generate fitness recommendations directly in the browser.

💡 Personalized Recommendations

AI agents generate tailored nutrition and fitness insights based on:

Scanner results

Meal history

General dietary goals

🔀 Smart Page Routing

Clean, structured multi-page interface for:

Meal scanning

Fitness guidance

Body analysis

Personalized insights

⚡ Optimized Performance

Local image preprocessing

Caching logic

Image resizing pipelines

Faster calls to OpenAI APIs

🎨 Modern UI/UX

Built with:

Next.js

React

TypeScript

TailwindCSS

Responsive, minimal, and consistent across devices.

🛠️ Technologies Used
Frontend

Next.js

React

TypeScript

TailwindCSS

AI & Vision

OpenAI (image + text models)

TensorFlow.js

BodyPix

Backend

Custom API routes

Image preprocessing + AI inference endpoints

Deployment

Vercel (recommended)

Cloud Hosting (optional)

🧩 Role & Contributions

Project Manager & Full-Stack Developer

Designed and built the AI-powered nutrition system using OpenAI for calorie analysis.

Developed the BodyScanner component using TensorFlow.js/BodyPix for body measurement analysis.

Built three specialized AI agents for scanning, analysis, and personalized recommendations.

Improved speed and accuracy with image optimization + caching pipelines.

Architected multi-page routing and organized app structure for intuitive navigation.

Designed a polished UI using React, Next.js, and TailwindCSS.

🚀 Getting Started
Prerequisites

Node.js (v16+)

npm or yarn

Installation

Clone the repository:

git clone <repository-url>
cd nutrifit-ai


Install dependencies:

npm install


Set up environment variables:

Create a .env.local file:

OPENAI_API_KEY=your-key
NEXT_PUBLIC_TF_ENABLE=1


Run the development server:

npm run dev


Access the app:

http://localhost:3000

📁 Project Structure
NutriFitAI/
├── app/                     # Next.js app router pages
├── components/              # Reusable UI components
├── lib/                     # Utility functions
├── pages/api/               # Backend API routes
├── public/                  # Static assets
└── styles/                  # Global styles

🔮 Future Enhancements

📱 Mobile camera scanning support

🔊 Voice-based meal logging

🧬 Advanced nutrition profiling with meal history AI

🥗 Integrations (Apple Health, Fitbit, Garmin)

📊 Personalized progress dashboards

📝 License

This project is licensed under the MIT License.



