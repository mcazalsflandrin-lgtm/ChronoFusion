import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Layers, Download, CheckCircle2, Sliders } from "lucide-react";

import { Button } from "@/components/Button";
import { VideoUploader } from "@/components/VideoUploader";
import { Slider } from "@/components/Slider";
import { FrameSelector } from "@/components/FrameSelector";
import { Card } from "@/components/Card";
import { useToast } from "@/hooks/use-toast";

type Step = "upload" | "extract" | "select" | "result";

interface Selection {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function Editor() {
  const [step, setStep] = useState<Step>("upload");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [interval, setInterval] = useState([0.5]);
  const [frames, setFrames] = useState<string[]>([]);
  const [selections, setSelections] = useState<(Selection | null)[]>([]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(document.createElement("video"));
  const { toast } = useToast();

  // Step 1: Handle video selection
  const handleVideoSelected = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    videoRef.current.src = url;
    setStep("extract");
  };

  // Step 2: Extract frames
  const extractFrames = async () => {
    setIsProcessing(true);
    const video = videoRef.current;
    
    // Wait for metadata to ensure duration is known
    if (video.readyState < 2) {
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
    }

    const duration = video.duration;
    const stepTime = interval[0];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const extractedFrames: string[] = [];

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (!ctx) {
      toast({ title: "Error", description: "Could not initialize canvas", variant: "destructive" });
      setIsProcessing(false);
      return;
    }

    try {
      for (let time = 0; time < duration; time += stepTime) {
        // Seek
        video.currentTime = time;
        await new Promise(r => video.onseeked = r);
        
        // Draw
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        extractedFrames.push(canvas.toDataURL("image/jpeg", 0.8));
      }
      
      setFrames(extractedFrames);
      setSelections(new Array(extractedFrames.length).fill(null));
      setStep("select");
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to extract frames", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Handle selection updates
  const handleSelectionChange = (index: number, rect: Selection | null) => {
    const newSelections = [...selections];
    newSelections[index] = rect;
    setSelections(newSelections);
  };

  // Step 4: Generate Result
  const generateChronophoto = async () => {
    setIsProcessing(true);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx || frames.length === 0) {
      setIsProcessing(false);
      return;
    }

    // Use first frame as base size
    const baseImg = new Image();
    baseImg.src = frames[0];
    await new Promise(r => baseImg.onload = r);

    canvas.width = baseImg.width;
    canvas.height = baseImg.height;

    // Draw background (first frame)
    ctx.drawImage(baseImg, 0, 0);

    // Overlay subsequent frames based on selection
    for (let i = 1; i < frames.length; i++) {
      const sel = selections[i];
      if (!sel) continue;

      const img = new Image();
      img.src = frames[i];
      await new Promise(r => img.onload = r);

      // Draw only the selected region
      ctx.drawImage(
        img, 
        sel.x, sel.y, sel.w, sel.h, // source
        sel.x, sel.y, sel.w, sel.h  // destination (same position)
      );
    }

    setResultImage(canvas.toDataURL("image/jpeg", 0.9));
    setStep("result");
    setIsProcessing(false);
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `chronophoto-${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-background/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Chronophoto Editor</h1>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
            <span className={step === 'upload' ? 'text-primary font-medium' : ''}>Upload</span>
            <span className="opacity-30">/</span>
            <span className={step === 'extract' ? 'text-primary font-medium' : ''}>Extract</span>
            <span className="opacity-30">/</span>
            <span className={step === 'select' ? 'text-primary font-medium' : ''}>Select</span>
            <span className="opacity-30">/</span>
            <span className={step === 'result' ? 'text-primary font-medium' : ''}>Result</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-7xl mx-auto p-6 md:p-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: UPLOAD */}
          {step === "upload" && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-xl"
            >
              <VideoUploader onVideoSelected={handleVideoSelected} />
            </motion.div>
          )}

          {/* STEP 2: EXTRACT */}
          {step === "extract" && (
            <motion.div 
              key="extract"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl text-center space-y-8"
            >
              <div className="space-y-2">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sliders className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold">Extraction Settings</h2>
                <p className="text-muted-foreground">Adjust how frequently frames are captured from your video.</p>
              </div>

              <Card className="p-8 bg-white/5 border-white/10">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-lg">Interval</label>
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-md font-mono text-sm">
                      {interval[0]}s
                    </span>
                  </div>
                  <Slider
                    defaultValue={[0.5]}
                    max={2.0}
                    min={0.1}
                    step={0.1}
                    onValueChange={setInterval}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>More frames (0.1s)</span>
                    <span>Fewer frames (2.0s)</span>
                  </div>
                </div>
              </Card>

              <Button size="lg" onClick={extractFrames} isLoading={isProcessing} className="w-full">
                Start Extraction
                <Play className="w-4 h-4 ml-2 fill-current" />
              </Button>
            </motion.div>
          )}

          {/* STEP 3: SELECT */}
          {step === "select" && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              <FrameSelector 
                frames={frames} 
                selections={selections}
                onSelectionChange={handleSelectionChange}
                onComplete={generateChronophoto}
              />
              {isProcessing && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-xl font-medium animate-pulse">Merging frames...</p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: RESULT */}
          {step === "result" && resultImage && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-4xl text-center space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-glow">It's Ready!</h2>
                <p className="text-muted-foreground">Your chronophotography masterpiece has been generated.</p>
              </div>

              <Card className="p-2 border-primary/20 bg-black/40 overflow-hidden shadow-2xl shadow-primary/10">
                <img 
                  src={resultImage} 
                  alt="Chronophoto Result" 
                  className="w-full h-auto rounded-lg"
                />
              </Card>

              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => {
                  setStep("upload");
                  setVideoFile(null);
                  setFrames([]);
                  setResultImage(null);
                }}>
                  Start Over
                </Button>
                <Button size="lg" onClick={downloadResult}>
                  Download Image
                  <Download className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
