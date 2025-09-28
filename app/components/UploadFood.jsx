"use client";

import React, { useState, useRef } from "react";
import IdentifyFood from "./IdentifyFood";

export default function UploadFood() {
  const [showCamera, setShowCamera] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [analysis, setAnalysis] = useState({
    calories: null,
    description: null,
  });
  const [showBodyScanner, setShowBodyScanner] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ---- IMAGE ANALYSIS ----
  const analyzeImage = async (base64Image) => {
    setImageUrl(base64Image);
    setAnalysis(null);
    setError(null);
    setLoading(true);

    try {
      const result = await IdentifyFood(base64Image);

      if (result.error) throw new Error(result.error);

      const response = result.choices?.[0]?.message?.content;
      if (response) {
        const caloriesMatch = response.match(/(\d+)\s*calories/i);
        const calories = caloriesMatch ? caloriesMatch[1] : null;

        setAnalysis({ description: response, calories });
      } else {
        setError("No food analysis found. Please try a clearer image of food.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error identifying food. Please try again.");
    }

    setLoading(false);
  };

  const processImage = (file) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 512;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processedImage = await processImage(file);
      await analyzeImage(processedImage);
    } catch (err) {
      console.error(err);
      setError("Error processing image");
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  // ---- CAMERA FUNCTIONS ----
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error("Camera access not supported");
      if (!window.isSecureContext)
        throw new Error("Camera requires HTTPS or localhost");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err);
      setShowCamera(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not access the camera.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return setError("Failed to capture image.");
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result;
          stopCamera();
          await analyzeImage(base64data);
        };
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.8
    );
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full px-4 py-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {loading && (
        <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg">
          <div className="loading loading-spinner loading-lg text-violet-600"></div>
          <p className="mt-4 text-indigo-900/80 font-medium">
            Analyzing your food...
          </p>
        </div>
      )}

      {showBodyScanner ? (
        <div className="w-full max-w-md flex flex-col gap-4">
          <BodyScanner />
          <button
            className="btn btn-lg glass w-full rounded-2xl"
            onClick={() => setShowBodyScanner(false)}
          >
            Back
          </button>
        </div>
      ) : showCamera ? (
        <div className="relative w-full max-w-2xl aspect-square rounded-3xl overflow-hidden bg-black/5 backdrop-blur-sm border border-white/20 shadow-xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
            <button
              type="button"
              className="btn glass px-8"
              onClick={stopCamera}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn glass px-8"
              onClick={capturePhoto}
            >
              Take Photo
            </button>
          </div>
        </div>
      ) : !imageUrl ? (
        <div className="w-full max-w-md flex justify-center">
          <button className="w-full btn btn-lg" onClick={handleUploadClick}>
            Upload Image
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg">
            <h3 className="text-2xl font-bold text-indigo-900 mb-6">
              Analysis Results
            </h3>

            {imageUrl && (
              <img
                src={imageUrl}
                alt="Uploaded food"
                className="w-full max-w-xs mx-auto rounded-2xl shadow-lg mb-6"
              />
            )}

            {analysis && (
              <div className="space-y-4">
                {analysis.calories && (
                  <div className="text-3xl font-bold text-violet-600">
                    {analysis.calories} calories
                  </div>
                )}
                <div className="text-indigo-900/80 text-sm leading-relaxed">
                  {analysis.description.split("\n").map((line, index) => (
                    <p key={index} className="mb-1">
                      - {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 btn btn-outline"
              onClick={() => {
                setImageUrl(null);
                setAnalysis({ calories: null, description: null });
                setError(null);
              }}
            >
              Try Another
            </button>
            <button className="flex-1 btn" onClick={handleUploadClick}>
              Upload New Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
