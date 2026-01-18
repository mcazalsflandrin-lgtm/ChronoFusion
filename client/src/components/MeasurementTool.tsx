import React, { useState, useRef, useEffect } from "react";
import { Button } from "./Button";
import { Ruler, Trash2, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Point {
  x: number;
  y: number;
}

interface Line {
  p1: Point;
  p2: Point;
  length?: number;
  unit?: string;
}

interface MeasurementToolProps {
  image: string;
  onBack: () => void;
}

export function MeasurementTool({ image, onBack }: MeasurementToolProps) {
  const { t } = useLanguage();
  const [scaleSet, setScaleSet] = useState(false);
  const [scaleLine, setScaleLine] = useState<Line | null>(null);
  const [scaleValue, setScaleValue] = useState("1.0");
  const [scaleUnit, setScaleUnit] = useState("m");
  const [measurements, setMeasurements] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const calculateDistance = (p1: Point, p2: Point) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ("touches" in e) {
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

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Draw scale line
    if (scaleLine) {
      ctx.strokeStyle = "#7c3aed"; // Primary purple
      ctx.beginPath();
      ctx.moveTo(scaleLine.p1.x, scaleLine.p1.y);
      ctx.lineTo(scaleLine.p2.x, scaleLine.p2.y);
      ctx.stroke();
      
      // End caps
      drawEndCap(ctx, scaleLine.p1, scaleLine.p2);
    }

    // Draw current line
    if (currentLine) {
      ctx.strokeStyle = scaleSet ? "#10b981" : "#7c3aed"; // Green or Purple
      ctx.beginPath();
      ctx.moveTo(currentLine.p1.x, currentLine.p1.y);
      ctx.lineTo(currentLine.p2.x, currentLine.p2.y);
      ctx.stroke();
      drawEndCap(ctx, currentLine.p1, currentLine.p2);
    }

    // Draw measurements
    measurements.forEach((m) => {
      ctx.strokeStyle = "#10b981"; // Emerald green
      ctx.beginPath();
      ctx.moveTo(m.p1.x, m.p1.y);
      ctx.lineTo(m.p2.x, m.p2.y);
      ctx.stroke();
      drawEndCap(ctx, m.p1, m.p2);

      // Label
      if (m.length) {
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        const text = `${m.length.toFixed(2)} ${m.unit}`;
        const midX = (m.p1.x + m.p2.x) / 2;
        const midY = (m.p1.y + m.p2.y) / 2;
        ctx.strokeText(text, midX + 10, midY);
        ctx.fillText(text, midX + 10, midY);
      }
    });
  };

  const drawEndCap = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point) => {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const length = 10;
    
    [p1, p2].forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p.x - Math.sin(angle) * length, p.y + Math.cos(angle) * length);
      ctx.lineTo(p.x + Math.sin(angle) * length, p.y - Math.cos(angle) * length);
      ctx.stroke();
    });
  };

  useEffect(() => {
    draw();
  }, [scaleLine, currentLine, measurements]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setCurrentLine({ p1: coords, p2: coords });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    setCurrentLine(prev => prev ? { ...prev, p2: coords } : null);
  };

  const handleEnd = () => {
    if (!isDrawing || !currentLine) return;
    setIsDrawing(false);

    const dist = calculateDistance(currentLine.p1, currentLine.p2);
    if (dist < 5) {
      setCurrentLine(null);
      return;
    }

    if (!scaleSet) {
      setScaleLine(currentLine);
    } else if (scaleLine) {
      const scalePixelDist = calculateDistance(scaleLine.p1, scaleLine.p2);
      const ratio = parseFloat(scaleValue) / scalePixelDist;
      const realDist = dist * ratio;
      setMeasurements([...measurements, { ...currentLine, length: realDist, unit: scaleUnit }]);
    }
    setCurrentLine(null);
  };

  const handleImageLoad = () => {
    if (imageRef.current && canvasRef.current) {
      canvasRef.current.width = imageRef.current.naturalWidth;
      canvasRef.current.height = imageRef.current.naturalHeight;
      draw();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">{t("measure.title")}</h2>
        <p className="text-muted-foreground">
          {!scaleSet ? t("measure.scale_instr") : t("measure.measure_instr")}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-center bg-card p-4 rounded-xl border border-white/10">
        {!scaleSet ? (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">{t("measure.real_dist")}</label>
              <Input 
                type="number" 
                value={scaleValue} 
                onChange={(e) => setScaleValue(e.target.value)}
                className="w-24 bg-white/5 border-white/10"
              />
            </div>
            <Select value={scaleUnit} onValueChange={setScaleUnit}>
              <SelectTrigger className="w-24 bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm">mm</SelectItem>
                <SelectItem value="cm">cm</SelectItem>
                <SelectItem value="m">m</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              disabled={!scaleLine} 
              onClick={() => setScaleSet(true)}
              className="bg-primary text-primary-foreground"
            >
              <Check className="w-4 h-4 mr-2" />
              {t("measure.set_scale")}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-primary font-bold">Échelle : {scaleValue} {scaleUnit}</span>
              <Button variant="ghost" size="sm" onClick={() => {
                setScaleSet(false);
                setMeasurements([]);
              }}>
                {t("measure.reset_scale")}
              </Button>
            </div>
          </>
        )}
        <Button variant="outline" size="sm" onClick={() => setMeasurements([])}>
          <Trash2 className="w-4 h-4 mr-2" />
          {t("measure.clear")}
        </Button>
      </div>

      <div className="relative border border-white/10 rounded-xl overflow-hidden bg-black/50 shadow-2xl" ref={containerRef}>
        <img 
          ref={imageRef}
          src={image} 
          alt="Measurement Base"
          className="w-full h-auto block select-none pointer-events-none"
          onLoad={handleImageLoad}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack}>
          {t("measure.back")}
        </Button>
      </div>
    </div>
  );
}
