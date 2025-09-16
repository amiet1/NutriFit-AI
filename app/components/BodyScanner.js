"use client";

import React, { useRef, useEffect, useState } from "react";
import * as bodyPix from "@tensorflow-models/body-pix";
import "@tensorflow/tfjs";

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
    if (!metrics) return;
    setLoading(true);
    try {
      const response = await fetch("/api/generateDiet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics }),
      });
      const data = await response.json();
      setDietPlan(data.dietPlan || "No diet plan returned");
    } catch (err) {
      console.error(err);
      setDietPlan("Error generating diet plan");
    }
    setLoading(false);
  };

  // Helper: calculate body widths at key heights
  const calculateBodyMetrics = (segmentation, width, height) => {
    const data = segmentation.data;
    const result = {};
    const rows = [0.2, 0.4, 0.6, 0.8]; // shoulders, chest, waist, hips

    rows.forEach((rowPct, i) => {
      const y = Math.floor(height * rowPct);
      let left = width,
        right = 0;
      for (let x = 0; x < width; x++) {
        if (data[y * width + x] === 1) {
          left = Math.min(left, x);
          right = Math.max(right, x);
        }
      }
      const pixelWidth = right - left;
      if (i === 0) result.shoulders = pixelWidth;
      else if (i === 1) result.chest = pixelWidth;
      else if (i === 2) result.waist = pixelWidth;
      else if (i === 3) result.hips = pixelWidth;
    });

    result.waistToShoulderRatio = result.waist / result.shoulders || 0;
    result.hipToWaistRatio = result.hips / result.waist || 0;
    return result;
  };

  // Segment and draw body safely
  useEffect(() => {
    let animationFrameId;

    const segmentBody = async () => {
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
        animationFrameId = requestAnimationFrame(segmentBody);
        return;
      }

      // Optionally scale down video to avoid huge textures
      const scale = 0.5;
      const width = video.videoWidth * scale;
      const height = video.videoHeight * scale;
      canvas.width = width;
      canvas.height = height;

      const segmentation = await model.segmentPerson(video, {
        flipHorizontal: true,
        internalResolution: "medium",
        segmentationThreshold: 0.7,
      });

      const mask = bodyPix.toMask(
        segmentation,
        { r: 0, g: 0, b: 0, a: 255 },
        { r: 0, g: 255, b: 0, a: 0 }
      );
      ctx.putImageData(mask, 0, 0);

      const newMetrics = calculateBodyMetrics(segmentation, width, height);
      setMetrics(newMetrics);

      animationFrameId = requestAnimationFrame(segmentBody);
    };

    if (model) segmentBody();

    return () => cancelAnimationFrame(animationFrameId);
  }, [model]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
        autoPlay
        playsInline
      />

      {/* Body Metrics */}
      <div className="text-center mt-2">
        <p>Shoulders: {metrics.shoulders || 0}px</p>
        <p>Chest: {metrics.chest || 0}px</p>
        <p>Waist: {metrics.waist || 0}px</p>
        <p>Hips: {metrics.hips || 0}px</p>
        <p>
          Waist/Shoulder Ratio: {metrics.waistToShoulderRatio?.toFixed(2) || 0}
        </p>
        <p>Hip/Waist Ratio: {metrics.hipToWaistRatio?.toFixed(2) || 0}</p>
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
          <div className="mt-4 p-4 border rounded bg-gray-50 text-left whitespace-pre-line">
            {dietPlan}
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyScanner;
