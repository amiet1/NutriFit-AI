"use client";

import UploadFood from "../components/UploadFood";

export default function UploadFoodPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-5xl w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/70 backdrop-blur-lg">
          <div className="relative z-10 py-12 px-6 sm:px-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-center font-display mb-8">
              Calorie Meal Tracker
            </h1>
            <p className="text-center text-1xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700">
              Upload an image of your meal and keep track of your calories
            </p>
            {/* Your component lives here */}
            <UploadFood />
          </div>
        </div>
      </div>
    </main>
  );
}
