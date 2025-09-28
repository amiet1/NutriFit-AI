"use client";

import React, { useRef, useEffect, useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";

const BodyScanner = ({ showBodyScanner }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [model, setModel] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [capturedMetrics, setCapturedMetrics] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [dietPlan, setDietPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [userHeight, setUserHeight] = useState(70);
  const [calibrationFactor, setCalibrationFactor] = useState(0.3);

  // ---------------- Load BodyPix Model ----------------
  useEffect(() => {
    const loadModel = async () => {
      try {
        const net = await bodyPix.load({
          architecture: "MobileNetV1",
          outputStride: 16,
          multiplier: 0.75,
          quantBytes: 2,
        });
        setModel(net);
        console.log("BodyPix model loaded");
      } catch (err) {
        console.error("Error loading BodyPix model:", err);
      }
    };
    loadModel();
  }, []);

  // ---------------- Start / Stop Camera ----------------
  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;

      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => resolve();
      });

      await videoRef.current.play();
      console.log("Camera started!");
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  useEffect(() => {
    if (showBodyScanner) startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [showBodyScanner]);

  // ---------------- Body Segmentation Loop ----------------
  useEffect(() => {
    if (!model || !showBodyScanner) return;

    let animationFrameId;
    let isMounted = true;

    const segmentBody = async () => {
      if (!isMounted) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!video || !ctx || video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameId = requestAnimationFrame(segmentBody);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      try {
        const segmentation = await model.segmentPerson(video, {
          flipHorizontal: true,
          internalResolution: "medium",
          segmentationThreshold: 0.7,
        });

        const mask = bodyPix.toMask(segmentation);
        ctx.putImageData(mask, 0, 0);

        // Update metrics (optional: you can call your calculateBodyMetrics here)
      } catch (err) {
        console.error("Segmentation error:", err);
      }

      animationFrameId = requestAnimationFrame(segmentBody);
    };

    segmentBody();

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [model, showBodyScanner]);

  // Capture measurements
  const captureMeasurements = () => {
    if (metrics.isValidScan) {
      setCapturedMetrics({ ...metrics });
      setIsCaptured(true);

      // Stop camera after capture
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    } else {
      alert(
        "Please position yourself properly in the frame until you see green status and valid measurements"
      );
    }
  };

  // Reset captured measurements and restart camera
  const resetMeasurements = () => {
    setCapturedMetrics(null);
    setIsCaptured(false);
    setDietPlan("");
    startCamera();
  };

  // Diet generation (API call)
  const generateDiet = async () => {
    const metricsToUse = isCaptured ? capturedMetrics : metrics;

    if (!metricsToUse || !metricsToUse.shoulders) {
      setDietPlan("Please capture your body measurements first");
      return;
    }

    setLoading(true);
    setDietPlan("");

    try {
      const response = await fetch("/api/generateDiet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: metricsToUse }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setDietPlan(data.dietPlan || "No diet plan returned from server");
    } catch (err) {
      console.error("Diet generation error:", err);
      setDietPlan(`Error generating diet plan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate body metrics
  const calculateBodyMetrics = (segmentation, width, height) => {
    const data = segmentation.data;
    const result = {};
    const measurements = [
      { name: "shoulders", rowPct: 0.15, scanRange: 3 },
      { name: "chest", rowPct: 0.25, scanRange: 3 },
      { name: "waist", rowPct: 0.45, scanRange: 3 },
      { name: "hips", rowPct: 0.65, scanRange: 3 },
    ];

    measurements.forEach(({ name, rowPct, scanRange }) => {
      const y = Math.floor(height * rowPct);
      let left = width;
      let right = 0;

      for (let dy = -scanRange; dy <= scanRange; dy++) {
        const scanY = y + dy;
        if (scanY < 0 || scanY >= height) continue;

        let rowLeft = width;
        let rowRight = 0;

        for (let x = 0; x < width; x++) {
          if (data[scanY * width + x] === 1) {
            rowLeft = Math.min(rowLeft, x);
            rowRight = Math.max(rowRight, x);
          }
        }

        left = Math.min(left, rowLeft);
        right = Math.max(right, rowRight);
      }

      const pixelWidth = Math.max(0, right - left);
      if (pixelWidth > 20) result[name] = Math.round(pixelWidth);
    });

    if (result.shoulders && result.waist)
      result.waistToShoulderRatio = result.waist / result.shoulders;
    if (result.hips && result.waist)
      result.hipToWaistRatio = result.hips / result.waist;

    const measurementCount = Object.keys(result).filter((k) =>
      ["shoulders", "chest", "waist", "hips"].includes(k)
    ).length;

    if (measurementCount >= 3) {
      const estimatedHeightPx = height * 0.8;
      result.pixelsPerInch = estimatedHeightPx / userHeight;
      result.isValidScan = true;
    } else result.isValidScan = false;

    return result;
  };

  // Body segmentation loop
  useEffect(() => {
    if (!model || !showBodyScanner) return;

    let animationFrameId;
    let isProcessing = false;
    let isMounted = true;

    const segmentBody = async () => {
      if (!isMounted || isProcessing) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!video || !ctx || video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameId = requestAnimationFrame(segmentBody);
        return;
      }

      isProcessing = true;
      try {
        const scale = 0.5;
        const width = video.videoWidth * scale;
        const height = video.videoHeight * scale;
        canvas.width = width;
        canvas.height = height;

        const segmentation = await model.segmentPerson(video, {
          flipHorizontal: true,
          internalResolution: "medium",
          segmentationThreshold: 0.7,
          maxDetections: 1,
        });

        const newMetrics = calculateBodyMetrics(segmentation, width, height);
        setMetrics(newMetrics);
      } catch (err) {
        console.error("Segmentation error:", err);
      } finally {
        isProcessing = false;
        animationFrameId = requestAnimationFrame(segmentBody);
      }
    };

    segmentBody();

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [model, showBodyScanner]);

  return (
    <div className="min-h-screen w-full flex px-10 py-12 bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50">
      <div
        className={`grid gap-12 items-start w-full transition-all duration-500 ${
          isCaptured
            ? "grid-cols-1 xl:grid-cols-2"
            : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {/* Left: Scanner (hidden after capture) */}
        {!isCaptured && (
          <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 flex-1 min-h-[500px]">
            <video
              ref={videoRef}
              style={{ width: "100%", height: "500px" }}
              className="w-full h-full rounded-3xl shadow-lg border border-violet-200 object-contain"
              autoPlay
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="mt-6 flex gap-6">
              <button
                onClick={captureMeasurements}
                disabled={!metrics.isValidScan}
                className={`px-8 py-4 rounded-xl text-lg font-semibold shadow ${
                  isCaptured
                    ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
                    : metrics.isValidScan
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isCaptured
                  ? "✓ Measurements Saved"
                  : metrics.isValidScan
                  ? "Save Measurements"
                  : "Position Yourself First"}
              </button>
              <button
                onClick={resetMeasurements}
                className="bg-gray-500 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Center: Measurements (slides left after capture) */}
        <div
          className={`flex flex-col space-y-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 transition-all duration-500 ${
            isCaptured ? "xl:col-span-1" : "flex-1"
          } min-h-[500px]`}
        >
          {/* Height Input */}
          {/* Scan Status */}
          <div
            className={`rounded-xl p-4 border ${
              metrics.isValidScan
                ? "bg-violet-50 border-violet-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  metrics.isValidScan ? "bg-violet-500" : "bg-amber-500"
                }`}
              ></div>
              <span
                className={`text-sm font-medium ${
                  metrics.isValidScan ? "text-violet-800" : "text-amber-800"
                }`}
              >
                {metrics.isValidScan
                  ? "✓ Body detected - measurements ready"
                  : "⏳ Position yourself in frame for scanning"}
              </span>
            </div>
          </div>

          <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
            <label className="block text-sm font-medium text-violet-800 mb-2">
              Your Height (for accurate measurements):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={userHeight}
                onChange={(e) => setUserHeight(parseInt(e.target.value) || 70)}
                className="flex-1 px-3 py-2 border border-violet-300 rounded-lg text-center font-semibold"
                min="48"
                max="84"
                step="1"
              />
              <span className="text-violet-600 font-medium py-2">inches</span>
            </div>
            <p className="text-xs text-violet-600 mt-1">
              Enter your height in inches (e.g., 70 for 5'10")
            </p>
          </div>

          {/* Simple Calibration */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
            <label className="block text-sm font-medium text-indigo-800 mb-2">
              Adjust measurements to match your actual size:
            </label>
            <div className="flex items-center gap-3">
              <span className="text-violet-600 text-sm">Smaller</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={calibrationFactor}
                onChange={(e) =>
                  setCalibrationFactor(parseFloat(e.target.value))
                }
                className="flex-1 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-indigo-600 text-sm">Larger</span>
              <span className="text-indigo-800 font-semibold min-w-[3rem]">
                {calibrationFactor.toFixed(1)}x
              </span>
            </div>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Shoulders", value: metrics.shoulders },
              { label: "Chest", value: metrics.chest },
              { label: "Waist", value: metrics.waist },
              { label: "Hips", value: metrics.hips },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl p-4 shadow-sm border flex flex-col items-center bg-white/60 backdrop-blur-sm border-violet-200"
              >
                <p className="text-violet-600 text-sm font-medium">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-indigo-800 mt-1">
                  {isCaptured &&
                  capturedMetrics &&
                  capturedMetrics[item.label.toLowerCase()] &&
                  capturedMetrics.pixelsPerInch
                    ? (
                        (capturedMetrics[item.label.toLowerCase()] /
                          capturedMetrics.pixelsPerInch) *
                        calibrationFactor
                      ).toFixed(1)
                    : item.value && metrics.isValidScan && metrics.pixelsPerInch
                    ? (
                        (item.value / metrics.pixelsPerInch) *
                        calibrationFactor
                      ).toFixed(1)
                    : "---"}{" "}
                  {(isCaptured && capturedMetrics) || metrics.isValidScan
                    ? "in"
                    : ""}
                </p>
              </div>
            ))}
          </div>

          {/* Ratios */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4 shadow-sm border bg-white/60 backdrop-blur-sm border-violet-200 flex flex-col items-center">
              <p className="text-violet-600 text-sm font-medium">
                Shoulder-Waist
              </p>
              <p className="text-2xl font-bold text-indigo-800 mt-1">
                {metrics.waistToShoulderRatio
                  ? metrics.waistToShoulderRatio.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="rounded-xl p-4 shadow-sm border bg-white/60 backdrop-blur-sm border-violet-200 flex flex-col items-center">
              <p className="text-violet-600 text-sm font-medium">Chest-Waist</p>
              <p className="text-2xl font-bold text-indigo-800 mt-1">
                {metrics.chest && metrics.waist
                  ? (metrics.waist / metrics.chest).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="rounded-xl p-4 shadow-sm border bg-gray-50 flex flex-col items-center">
              <p className="text-gray-500 text-sm">Waist-Hips</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {metrics.hipToWaistRatio
                  ? metrics.hipToWaistRatio.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="rounded-xl p-4 shadow-sm border bg-gray-50 flex flex-col items-center">
              <p className="text-gray-500 text-sm">Body Score</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {metrics.shoulders && metrics.waist
                  ? ((metrics.shoulders / metrics.waist) * 100).toFixed(0)
                  : "0"}
              </p>
            </div>
          </div>

          {/* Generate Diet Plan Button */}
          {isCaptured && (
            <div className="text-center mt-auto">
              <button
                onClick={generateDiet}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow hover:from-violet-700 hover:to-indigo-700"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Diet Plan"}
              </button>
            </div>
          )}
        </div>

        {/* Right: Diet Plan (appears after capture) */}
        {isCaptured && (
          <div className="xl:col-span-1 flex flex-col bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 min-h-[500px]">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-2">
                🍎 Your Diet Plan
              </h2>
              <p className="text-violet-600">
                Personalized nutrition based on your measurements
              </p>
            </div>

            {dietPlan ? (
              <div className="bg-violet-50 rounded-2xl p-6 text-left shadow-md overflow-y-auto max-h-96 border border-violet-200">
                <div className="text-indigo-800 leading-relaxed">
                  {dietPlan.split("\n").map((line, index) => (
                    <p key={index} className="mb-2">
                      - {line}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-2xl p-8 text-center flex items-center justify-center h-full">
                <div className="text-violet-600 text-lg">
                  Click "Generate Diet Plan" to create your personalized meal
                  plan
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyScanner;
