
export interface TunerSettings {
  layoutDensity: number;    // 0-100
  visualTone: number;       // 0-100
  colorEmphasis: number;    // 0-100
  fidelity: number;         // 0-100
}

export interface PromptTunerProps {
  basePrompt: string;
  onGenerate: (enhancedPrompt: string, settings: TunerSettings) => Promise<void>;
  isGenerating?: boolean;
  onClose: () => void;
}

// Separate interface for custom visual results (won't conflict with existing VisualSuggestion)
export interface CustomVisualResult {
  id: string;
  imageUrl: string;
  settings: TunerSettings;
  prompt: string;
  createdAt: Date;
  baseImageUrl?: string; // Reference to original image
}

// Helper type for prompt enhancement
export interface PromptEnhancement {
  originalPrompt: string;
  enhancedPrompt: string;
  settings: TunerSettings;
  timestamp: Date;
}
