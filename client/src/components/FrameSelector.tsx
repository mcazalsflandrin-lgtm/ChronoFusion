import React, { useRef, useState, useEffect } from "react";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight, Check, Eraser, Paintbrush } from "lucide-react";

interface Selection {
  mask: string;
}

interface FrameSelectorProps {
  frames: string[];
  selections: (Selection | null)[];
  onSelectionChange: (index: number, selection: Selection | null) => void;
  onComplete: () => void;
}

export function FrameSelector({ frames, selections, onSelectionChange, onComplete }: FrameSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(30);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize mask canvas when frame changes
  useEffect(() => {
    const maskCanvas = maskCanvasRef.current;
    const maskCtx = maskCanvas.getContext("2d");
    const img = imageRef.current;

    if (img && maskCtx) {
      if (maskCanvas.width !== img.naturalWidth || maskCanvas.height !== img.naturalHeight) {
        maskCanvas.width = img.naturalWidth;
        maskCanvas.height = img.naturalHeight;
      }
      
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      const currentSelection = selections[currentIndex];
      if (currentSelection) {
        const maskImg = new Image();
        maskImg.src = currentSelection.mask;
        maskImg.onload = () => {
          maskCtx.drawImage(maskImg, 0, 0);
          draw();
        };
      } else {
        draw();
      }
    }
  }, [currentIndex, frames]);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const maskCanvas = maskCanvasRef.current;
    
    if (!canvas || !ctx || !maskCanvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw mask overlay
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "rgba(124, 58, 237, 1)";
    
    // Use the mask canvas to draw the selected area
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.globalAlpha = 1.0;
  };

  const handleImageLoad = () => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (img && canvas) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      maskCanvasRef.current.width = img.naturalWidth;
      maskCanvasRef.current.height = img.naturalHeight;
      draw();
    }
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    continueDrawing(e);
  };

  const continueDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const coords = getCanvasCoords(e);
    const maskCtx = maskCanvasRef.current.getContext("2d");
    if (!maskCtx) return;

    maskCtx.lineJoin = "round";
    maskCtx.lineCap = "round";
    maskCtx.lineWidth = brushSize;
    
    if (tool === "brush") {
      maskCtx.globalCompositeOperation = "source-over";
      maskCtx.strokeStyle = "rgba(124, 58, 237, 1)";
    } else {
      maskCtx.globalCompositeOperation = "destination-out";
      maskCtx.strokeStyle = "rgba(0,0,0,1)";
    }

    maskCtx.beginPath();
    // For simpler brush, we just draw a point/circle
    maskCtx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();
    
    draw();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      onSelectionChange(currentIndex, { mask: maskCanvasRef.current.toDataURL() });
    }
    setIsDrawing(false);
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
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <Button 
              variant={tool === 'brush' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setTool('brush')}
            >
              <Paintbrush className="h-4 w-4" />
            </Button>
            <Button 
              variant={tool === 'eraser' ? 'default' : 'ghost'} 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setTool('eraser')}
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </div>
          <input 
            type="range" 
            min="5" 
            max="100" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="relative border border-white/10 rounded-xl overflow-hidden bg-black/50 shadow-2xl">
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
          onMouseDown={startDrawing}
          onMouseMove={continueDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={continueDrawing}
          onTouchEnd={stopDrawing}
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
               <Check className="w-4 h-4 mr-1" /> Painted
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
