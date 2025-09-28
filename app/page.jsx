"use client";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-start px-4 py-12 bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50">
      {/* Floating dots/particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, idx) => (
          <span
            key={idx}
            className={`absolute w-2 h-2 bg-indigo-400 rounded-full opacity-50 animate-float`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          ></span>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl w-full flex flex-col items-center gap-12">
        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/70 backdrop-blur-lg w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-cyan-500/10"></div>
          <div className="relative z-10 text-center py-16 px-6 sm:px-12">
            <h1 className="text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 font-display animate-fadeIn">
              NutriFit AI
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-indigo-900/80 max-w-2xl mx-auto font-medium animate-fadeIn delay-500">
              Your all-in-one health coach: instant calorie scans, body
              measurement tracking, and personalized fitness + nutrition plans
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Calculator Card */}
          <div className="bg-gray-100/50 backdrop-blur-sm rounded-3xl shadow-lg p-8 flex flex-col items-center hover:scale-105 transition-transform">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">
              Calorie Calculator
            </h2>
            <p className="text-indigo-700 text-sm text-center">
              Estimate calories of your meals instantly.
            </p>
          </div>

          {/* Meal Tracker Card */}
          <div className="bg-gray-100/50 backdrop-blur-sm rounded-3xl shadow-lg p-8 flex flex-col items-center hover:scale-105 transition-transform">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">
              Meal Tracker
            </h2>
            <p className="text-indigo-700 text-sm text-center">
              Track what you eat and stay on top of your nutrition.
            </p>
          </div>

          {/* Body Scanner Card */}
          <div className="bg-gray-100/50 backdrop-blur-sm rounded-3xl shadow-lg p-8 flex flex-col items-center hover:scale-105 transition-transform">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">
              Body Scanner
            </h2>
            <p className="text-indigo-700 text-sm text-center">
              Capture body measurements for personalized fitness advice.
            </p>
          </div>
        </div>
      </div>

      {/* Tailwind Animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-30px) translateX(20px) scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.5;
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </main>
  );
}
