
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, X, Sliders } from 'lucide-react';
import { TunerSettings, PromptTunerProps } from '@/types/promptTuner';

const PromptTuner: React.FC<PromptTunerProps> = ({
  basePrompt,
  onGenerate,
  isGenerating = false,
  onClose
}) => {
  const [settings, setSettings] = useState<TunerSettings>({
    layoutDensity: 50,
    visualTone: 50,
    colorEmphasis: 50,
    fidelity: 50
  });

  const handleSettingChange = (key: keyof TunerSettings, value: number[]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value[0]
    }));
  };

  const handleGenerate = async () => {
    const enhancedPrompt = buildEnhancedPrompt(basePrompt, settings);
    await onGenerate(enhancedPrompt, settings);
  };

  const buildEnhancedPrompt = (prompt: string, settings: TunerSettings): string => {
    let enhanced = prompt;
    
    // Layout density adjustments
    if (settings.layoutDensity > 70) {
      enhanced += ' with dense, information-rich layout and compact spacing';
    } else if (settings.layoutDensity < 30) {
      enhanced += ' with spacious, minimal layout and generous whitespace';
    }
    
    // Visual tone adjustments
    if (settings.visualTone > 70) {
      enhanced += ', professional corporate aesthetic with clean lines';
    } else if (settings.visualTone < 30) {
      enhanced += ', playful creative aesthetic with rounded elements';
    }
    
    // Color emphasis adjustments
    if (settings.colorEmphasis > 70) {
      enhanced += ', vibrant colorful design with bold accents';
    } else if (settings.colorEmphasis < 30) {
      enhanced += ', monochromatic subtle colors with muted palette';
    }
    
    // Fidelity adjustments
    if (settings.fidelity > 70) {
      enhanced += ', high-fidelity detailed mockup with realistic content';
    } else if (settings.fidelity < 30) {
      enhanced += ', low-fidelity wireframe style with placeholder content';
    }
    
    return enhanced;
  };

  const getSliderLabel = (key: keyof TunerSettings, value: number): string => {
    switch (key) {
      case 'layoutDensity':
        return value > 70 ? 'Dense' : value < 30 ? 'Spacious' : 'Balanced';
      case 'visualTone':
        return value > 70 ? 'Professional' : value < 30 ? 'Playful' : 'Balanced';
      case 'colorEmphasis':
        return value > 70 ? 'Vibrant' : value < 30 ? 'Subtle' : 'Balanced';
      case 'fidelity':
        return value > 70 ? 'High Detail' : value < 30 ? 'Wireframe' : 'Standard';
      default:
        return 'Balanced';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            🎛️ Customize Visual Design
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Layout Density */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white">Layout Density</label>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
              {getSliderLabel('layoutDensity', settings.layoutDensity)}
            </span>
          </div>
          <Slider
            value={[settings.layoutDensity]}
            onValueChange={(value) => handleSettingChange('layoutDensity', value)}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Spacious</span>
            <span>Dense</span>
          </div>
        </div>

        {/* Visual Tone */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white">Visual Tone</label>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
              {getSliderLabel('visualTone', settings.visualTone)}
            </span>
          </div>
          <Slider
            value={[settings.visualTone]}
            onValueChange={(value) => handleSettingChange('visualTone', value)}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Playful</span>
            <span>Professional</span>
          </div>
        </div>

        {/* Color Emphasis */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white">Color Emphasis</label>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
              {getSliderLabel('colorEmphasis', settings.colorEmphasis)}
            </span>
          </div>
          <Slider
            value={[settings.colorEmphasis]}
            onValueChange={(value) => handleSettingChange('colorEmphasis', value)}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtle</span>
            <span>Vibrant</span>
          </div>
        </div>

        {/* Fidelity */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-white">Design Fidelity</label>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
              {getSliderLabel('fidelity', settings.fidelity)}
            </span>
          </div>
          <Slider
            value={[settings.fidelity]}
            onValueChange={(value) => handleSettingChange('fidelity', value)}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Wireframe</span>
            <span>High Detail</span>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-4 border-t border-slate-600">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Custom Visual...
              </>
            ) : (
              <>
                <Sliders className="w-4 h-4 mr-2" />
                Generate Custom Visual
              </>
            )}
          </Button>
        </div>

        {/* Settings Preview */}
        <div className="bg-slate-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-white mb-2">Current Settings:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-slate-300">
              Layout: <span className="text-white">{getSliderLabel('layoutDensity', settings.layoutDensity)}</span>
            </div>
            <div className="text-slate-300">
              Tone: <span className="text-white">{getSliderLabel('visualTone', settings.visualTone)}</span>
            </div>
            <div className="text-slate-300">
              Colors: <span className="text-white">{getSliderLabel('colorEmphasis', settings.colorEmphasis)}</span>
            </div>
            <div className="text-slate-300">
              Detail: <span className="text-white">{getSliderLabel('fidelity', settings.fidelity)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptTuner;
