import React from "react";
import Link from "next/link";

const NavBar = () => {
  return (
    <div>
      <nav className="bg-white/50 backdrop-blur-sm shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                  NutriFit AI
                </span>
              </Link>
            </div>

            {/* Nav Links */}
            <div className="flex items-center space-x-4">
              <Link
                href="/workout-guide"
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 font-medium">
                  Workout Guide
                </span>
              </Link>
              <Link
                href="/nutrition-guide"
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 font-medium">
                  Nutrition Guide
                </span>
              </Link>
              <Link
                href="/body-scanner"
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 font-medium">
                  Body Scanner
                </span>
              </Link>
              <Link
                href="/upload-image"
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 font-medium">
                  Calorie Meal Tracker
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
