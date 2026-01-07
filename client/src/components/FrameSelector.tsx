import React, { useRef, useState, useEffect } from "react";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FrameSelectorProps {
  frames: string[];
  selections: (Rect | null)[];
  onSelectionChange: (index: number, selection: Rect | null) => void;
  onComplete: () => void;
}

export function FrameSelector({ frames, selections, onSelectionChange, onComplete }: FrameSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [tempRect, setTempRect] = useState<Rect | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Redraw canvas whenever frame, selection, or temp drawing changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img) return;

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw current selection if exists
    const currentSelection = selections[currentIndex];
    
    // Helper to draw rect
    const drawRect = (rect: Rect, color: string, fill = false) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      if (fill) {
        ctx.fillStyle = color.replace("1)", "0.2)");
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      }
    };

    if (currentSelection) {
      drawRect(currentSelection, "rgba(124, 58, 237, 1)", true);
    }

    if (tempRect) {
      drawRect(tempRect, "rgba(255, 255, 255, 0.8)");
    }

  }, [currentIndex, selections, tempRect, frames]);

  // Handle image load to resize canvas
  const handleImageLoad = () => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (img && canvas) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
  };

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    setStartPos(coords);
    // Clear existing selection for this frame when starting new draw
    onSelectionChange(currentIndex, null); 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos) return;
    
    const current = getCanvasCoords(e);
    setTempRect({
      x: Math.min(startPos.x, current.x),
      y: Math.min(startPos.y, current.y),
      w: Math.abs(current.x - startPos.x),
      h: Math.abs(current.y - startPos.y)
    });
  };

  const handleMouseUp = () => {
    if (isDrawing && tempRect) {
      onSelectionChange(currentIndex, tempRect);
    }
    setIsDrawing(false);
    setStartPos(null);
    setTempRect(null);
  };

  const nextFrame = () => {
    if (currentIndex < frames.length - 1) {
      setCurrentIndex(c => c + 1);
    }
  };

  const prevFrame = () => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Frame {currentIndex + 1} of {frames.length}</span>
        <span>Draw a box around the object to keep</span>
      </div>

      <div 
        ref={containerRef} 
        className="relative border border-white/10 rounded-xl overflow-hidden bg-black/50 shadow-2xl"
      >
        <img 
          ref={imageRef}
          src={frames[currentIndex]} 
          alt={`Frame ${currentIndex}`}
          className="w-full h-auto block select-none pointer-events-none opacity-50"
          onLoad={handleImageLoad}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-white/10">
        <Button 
          variant="outline" 
          onClick={prevFrame} 
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
           {selections[currentIndex] ? (
             <span className="text-primary flex items-center text-sm font-medium animate-in fade-in">
               <Check className="w-4 h-4 mr-1" /> Selected
             </span>
           ) : (
             <span className="text-muted-foreground text-sm italic">No selection</span>
           )}
        </div>

        {currentIndex === frames.length - 1 ? (
          <Button onClick={onComplete} className="bg-primary text-primary-foreground">
            Finish Selection
            <Check className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={nextFrame} variant="secondary">
            Next Frame
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
