"use client";

import React, { useRef, useEffect, useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";

// Suppress TensorFlow console spam
import * as tf from "@tensorflow/tfjs";
tf.setBackend("cpu");

const BodyScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [dietPlan, setDietPlan] = useState("");
  const [loading, setLoading] = useState(false);

  // Load BodyPix model
  useEffect(() => {
    const loadModel = async () => {
      const net = await bodyPix.load({
        architecture: "MobileNetV1",
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2,
      });
      setModel(net);
      console.log("BodyPix model loaded");
    };
    loadModel();
  }, []);

  // Start webcam
  useEffect(() => {
    const startVideo = async () => {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    startVideo();
  }, []);

  // Generate diet plan
  const generateDiet = async () => {
    if (!metrics || !metrics.shoulders) {
      setDietPlan("Please scan your body first to get measurements");
      return;
    }

    setLoading(true);
    setDietPlan(""); // Clear previous results

    try {
      console.log("Sending metrics:", metrics);
      const response = await fetch("/api/generateDiet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Diet plan response:", data);

      if (data.dietPlan) {
        setDietPlan(data.dietPlan);
        console.log(
          "Diet plan set successfully:",
          data.dietPlan.substring(0, 100)
        );
      } else {
        setDietPlan("No diet plan returned from server");
        console.log("No diet plan in response:", data);
      }
    } catch (err) {
      console.error("Diet generation error:", err);
      setDietPlan(`Error generating diet plan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper: calculate body widths at key heights with improved accuracy
  const calculateBodyMetrics = (segmentation, width, height) => {
    const data = segmentation.data;
    const result = {};
    // Better body measurement positions
    const rows = [0.15, 0.25, 0.45, 0.65]; // shoulders, chest, waist, hips

    rows.forEach((rowPct, i) => {
      const y = Math.floor(height * rowPct);
      let left = width,
        right = 0;
      let validPixels = 0;

      // Scan multiple rows for better accuracy
      for (let dy = -3; dy <= 3; dy++) {
        const scanY = Math.floor(y + dy);
        if (scanY < 0 || scanY >= height) continue;

        for (let x = 0; x < width; x++) {
          if (data[scanY * width + x] === 1) {
            left = Math.min(left, x);
            right = Math.max(right, x);
            validPixels++;
          }
        }
      }

      const pixelWidth = Math.max(0, right - left);

      // Only set measurement if we have enough valid pixels
      if (validPixels > 15) {
        if (i === 0) result.shoulders = pixelWidth;
        else if (i === 1) result.chest = pixelWidth;
        else if (i === 2) result.waist = pixelWidth;
        else if (i === 3) result.hips = pixelWidth;
      }
    });

    // Calculate ratios only with valid measurements
    if (result.shoulders && result.waist && result.shoulders > 0) {
      result.waistToShoulderRatio = result.waist / result.shoulders;
    }
    if (result.hips && result.waist && result.waist > 0) {
      result.hipToWaistRatio = result.hips / result.waist;
    }

    return result;
  };

  // Segment and draw body safely
  useEffect(() => {
    if (!model) return;

    let animationFrameId;
    let isProcessing = false;
    let isMounted = true;

    const segmentBody = async () => {
      if (!isMounted || isProcessing) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (
        !video ||
        !ctx ||
        !model ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        if (isMounted) {
          animationFrameId = requestAnimationFrame(segmentBody);
        }
        return;
      }

      isProcessing = true;

      try {
        // Optionally scale down video to avoid huge textures
        const scale = 0.5;
        const width = video.videoWidth * scale;
        const height = video.videoHeight * scale;
        canvas.width = width;
        canvas.height = height;

        const segmentation = await model.segmentPerson(video, {
          flipHorizontal: true,
          internalResolution: "high", // Higher resolution for better accuracy
          segmentationThreshold: 0.5, // Lower threshold for better detection
        });

        if (!isMounted) return;

        // No visual mask needed - just process measurements

        const newMetrics = calculateBodyMetrics(segmentation, width, height);
        setMetrics(newMetrics);
      } catch (error) {
        console.error("Error in body segmentation:", error);
      } finally {
        isProcessing = false;
        if (isMounted) {
          animationFrameId = requestAnimationFrame(segmentBody);
        }
      }
    };

    segmentBody();

    return () => {
      isMounted = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [model]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Modern Scanner Interface */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-xl border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📏 Body Scanner
          </h2>
          <p className="text-gray-600">
            Position yourself in the frame for accurate measurements
          </p>
        </div>

        {/* Camera Preview */}
        <div className="relative mb-6">
          <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border-4 border-gray-200 relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {/* Overlay Grid for Alignment */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full border-2 border-white/30 rounded-xl">
                {/* Center crosshair */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 border-2 border-white/50 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/70 rounded-full"></div>
                </div>
                {/* Guide lines */}
                <div className="absolute top-1/4 left-0 right-0 h-px bg-white/30"></div>
                <div className="absolute top-3/4 left-0 right-0 h-px bg-white/30"></div>
                <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/30"></div>
                <div className="absolute top-0 bottom-0 right-1/4 w-px bg-white/30"></div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="absolute top-4 right-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  model ? "bg-green-400" : "bg-yellow-400"
                } shadow-lg`}
              ></div>
            </div>
          </div>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        {/* Real-time Metrics Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {metrics.shoulders || 0}
              </div>
              <div className="text-sm text-gray-600">Shoulders (px)</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {metrics.chest || 0}
              </div>
              <div className="text-sm text-gray-600">Chest (px)</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {metrics.waist || 0}
              </div>
              <div className="text-sm text-gray-600">Waist (px)</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {metrics.hips || 0}
              </div>
              <div className="text-sm text-gray-600">Hips (px)</div>
            </div>
          </div>
        </div>

        {/* Body Ratios */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-700">
                {metrics.waistToShoulderRatio?.toFixed(2) || "0.00"}
              </div>
              <div className="text-sm text-blue-600">Waist/Shoulder Ratio</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-700">
                {metrics.hipToWaistRatio?.toFixed(2) || "0.00"}
              </div>
              <div className="text-sm text-purple-600">Hip/Waist Ratio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Diet */}
      <div className="mt-4 text-center">
        <button
          onClick={generateDiet}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Diet Plan"}
        </button>

        {dietPlan && (
          <div className="mt-4 p-6 border rounded-lg bg-white/80 backdrop-blur-sm text-left whitespace-pre-line shadow-lg">
            <h3 className="text-xl font-bold text-indigo-900 mb-3">
              🍎 Your Personalized Diet Plan
            </h3>
            <div className="text-gray-800 leading-relaxed">{dietPlan}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyScanner;
