import React, { useCallback, useRef, useState } from "react";
import { Upload, FileVideo, X, ShieldCheck } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";

interface VideoUploaderProps {
  onVideoSelected: (file: File) => void;
}

export function VideoUploader({ onVideoSelected }: VideoUploaderProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid video file.",
        variant: "destructive",
      });
      return;
    }
    setFileName(file.name);
    onVideoSelected(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onInputArray = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (fileName) {
    return (
      <Card className="p-8 border-dashed border-2 border-white/10 flex flex-col items-center justify-center bg-white/5 animate-in fade-in zoom-in duration-300">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
          <FileVideo className="w-8 h-8" />
        </div>
        <p className="text-xl font-medium mb-2">{fileName}</p>
        <p className="text-muted-foreground mb-6">Video loaded successfully</p>
        <Button 
          variant="outline" 
          onClick={() => {
            setFileName(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        >
          <X className="w-4 h-4 mr-2" />
          Remove
        </Button>
      </Card>
    );
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all duration-300
        flex flex-col items-center justify-center text-center
        ${isDragging 
          ? "border-primary bg-primary/10 scale-[1.02]" 
          : "border-white/10 hover:border-white/20 hover:bg-white/5"}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onInputArray}
        accept="video/*"
        capture="environment"
        className="hidden"
      />
      <div className={`
        h-20 w-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300
        ${isDragging ? "bg-primary text-white" : "bg-white/5 text-muted-foreground"}
      `}>
        <Upload className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold mb-2">{t("uploader.title")}</h3>
      <p className="text-muted-foreground max-w-sm">
        {t("uploader.desc")}
      </p>
      <div className="pt-4 flex items-center gap-6 text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Browser only</span>
        <span>{t("uploader.limit")}</span>
      </div>
    </div>
  );
}
