import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export type Language = "en" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "nav.home": "Home",
    "nav.editor": "Editor",
    "hero.title": "Master Time with",
    "hero.subtitle": "Chronophotography",
    "hero.description": "Transform ordinary videos into stunning motion composites. Visualize trajectory, speed, and form in a single static image. Entirely in your browser.",
    "hero.cta": "Start Creating",
    "hero.demo": "Watch Demo",
    "hero.badge": "Client-side Processing",
    "feature.frames.title": "Frame Extraction",
    "feature.frames.desc": "Intelligently pull frames from your video at precise intervals to capture the perfect moments of motion.",
    "feature.masking.title": "Motion Masking",
    "feature.masking.desc": "Selectively isolate moving subjects while keeping the background clean. You control what stays visible.",
    "feature.layers.title": "Instant Composition",
    "feature.layers.desc": "Merge selected frames into a cohesive high-resolution image instantly using advanced canvas blending.",
    "editor.title": "Chronophoto Editor",
    "editor.step.upload": "Upload",
    "editor.step.extract": "Extract",
    "editor.step.select": "Select",
    "editor.step.result": "Result",
    "editor.extract.title": "Extraction Settings",
    "editor.extract.desc": "Adjust how frequently frames are captured from your video.",
    "editor.extract.interval": "Interval",
    "editor.extract.more": "More frames",
    "editor.extract.fewer": "Fewer frames",
    "editor.extract.button": "Start Extraction",
    "editor.select.complete": "Generate Chronophoto",
    "editor.result.title": "It's Ready!",
    "editor.result.desc": "Your chronophotography masterpiece has been generated.",
    "editor.result.startover": "Start Over",
    "editor.result.download": "Download Image",
    "editor.result.measure": "Measurements",
    "editor.processing": "Merging frames...",
    "editor.select.instructions": "Select the object(s) to keep by highlighting them with the brush",
    "editor.select.frame": "Frame",
    "editor.select.of": "of",
    "editor.select.painted": "Painted",
    "editor.select.none": "No selection",
    "editor.select.previous": "Previous",
    "editor.select.next": "Next Frame",
    "editor.select.finish": "Finish Selection",
    "measure.title": "Measurements",
    "measure.scale_instr": "First, set the scale by drawing a line on the image and indicating its real distance.",
    "measure.measure_instr": "Now draw lines to measure distances on the image.",
    "measure.real_dist": "Real distance:",
    "measure.set_scale": "Set Scale",
    "measure.reset_scale": "Reset Scale",
    "measure.clear": "Clear measurements",
    "measure.back": "Back to result",
    "uploader.title": "Upload Video",
    "uploader.desc": "Drag and drop your video file here, or click to browse",
    "uploader.limit": "Supports MP4, WebM, and OGG up to 50MB",
    "footer.rights": "All rights reserved."
  },
  fr: {
    "nav.home": "Accueil",
    "nav.editor": "Éditeur",
    "hero.title": "Créez facilement une",
    "hero.subtitle": "Chronophotographie",
    "hero.description": "Transformez des vidéos ordinaires en superbes compositions de mouvement. Visualisez la trajectoire, la vitesse et la forme dans une seule image statique. Entièrement dans votre navigateur.",
    "hero.cta": "Commencer à créer",
    "hero.demo": "Voir la démo",
    "hero.badge": "Traitement côté client",
    "feature.frames.title": "Extraction d'images",
    "feature.frames.desc": "Extrayez intelligemment les images de votre vidéo à des intervalles précis pour capturer les moments parfaits du mouvement.",
    "feature.masking.title": "Masquage de mouvement",
    "feature.masking.desc": "Isolez sélectivement les sujets en mouvement tout en gardant l'arrière-plan propre. Vous contrôlez ce qui reste visible.",
    "feature.layers.title": "Composition instantanée",
    "feature.layers.desc": "Fusionnez les images sélectionnées en une image haute résolution cohérente instantanément grâce au mélange de canevas avancé.",
    "editor.title": "Éditeur de Chronophoto",
    "editor.step.upload": "Télécharger",
    "editor.step.extract": "Extraire",
    "editor.step.select": "Sélectionner",
    "editor.step.result": "Résultat",
    "editor.extract.title": "Paramètres d'extraction",
    "editor.extract.desc": "Ajustez la fréquence de capture des images de votre vidéo.",
    "editor.extract.interval": "Intervalle",
    "editor.extract.more": "Plus d'images",
    "editor.extract.fewer": "Moins d'images",
    "editor.extract.button": "Démarrer l'extraction",
    "editor.select.complete": "Générer la Chronophoto",
    "editor.result.title": "C'est prêt !",
    "editor.result.desc": "Votre chef-d'œuvre de chronophotographie a été généré.",
    "editor.result.startover": "Recommencer",
    "editor.result.download": "Télécharger l'image",
    "editor.result.measure": "Mesures",
    "editor.processing": "Fusion des images...",
    "editor.select.instructions": "Sélectionnez le ou les objets à garder en les surlignant au pinceau",
    "editor.select.frame": "Image",
    "editor.select.of": "sur",
    "editor.select.painted": "Peint",
    "editor.select.none": "Aucune sélection",
    "editor.select.previous": "Précédent",
    "editor.select.next": "Image suivante",
    "editor.select.finish": "Terminer la sélection",
    "measure.title": "Outil de mesure",
    "measure.scale_instr": "D'abord, indiquez l'échelle en traçant un segment sur l'image et en indiquant sa distance réelle.",
    "measure.measure_instr": "Tracez maintenant des segments pour mesurer des distances sur l'image.",
    "measure.real_dist": "Distance réelle :",
    "measure.set_scale": "Définir l'échelle",
    "measure.reset_scale": "Réinitialiser l'échelle",
    "measure.clear": "Effacer les mesures",
    "measure.back": "Retour au résultat",
    "uploader.title": "Télécharger la vidéo",
    "uploader.desc": "Glissez-déposez votre fichier vidéo ici, ou cliquez pour parcourir",
    "uploader.limit": "Prend en charge MP4, WebM et OGG jusqu'à 50 Mo",
    "footer.rights": "Tous droits réservés."
  }
};

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "fr";
  });

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations["en"]] || key;
  };

  React.useEffect(() => {
    localStorage.setItem("app-language", language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          English {language === "en" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("fr")}>
          Français {language === "fr" && "✓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
