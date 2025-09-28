"use client";

import BodyScanner from "../components/BodyScanner";

export default function BodyScannerPage() {
  return (
    <main className="min-h-screen w-full bg-gray-100 px-6 py-12">
      <div className="w-full max-w-7xl mx-auto">
        <BodyScanner showBodyScanner={true} />
      </div>
    </main>
  );
}
