
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2, X, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { TunerSettings, PromptTunerProps } from '../types/promptTuner';

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

  const [showPreview, setShowPreview] = useState(false);

  // Enhanced prompt generation
  const enhancedPrompt = useMemo(() => {
    return buildEnhancedPrompt(basePrompt, settings);
  }, [basePrompt, settings]);

  const handleSliderChange = (key: keyof TunerSettings, values: number[]) => {
    setSettings(prev => ({ ...prev, [key]: values[0] }));
  };

  const handleGenerate = async () => {
    await onGenerate(enhancedPrompt, settings);
  };

  const resetToDefaults = () => {
    setSettings({
      layoutDensity: 50,
      visualTone: 50,
      colorEmphasis: 50,
      fidelity: 50
    });
  };

  const sliderConfigs = [
    {
      key: 'layoutDensity' as keyof TunerSettings,
      label: 'Layout Density',
      description: 'Sparse, minimal layouts ↔ Dense, information-rich layouts',
      leftLabel: 'Sparse',
      rightLabel: 'Dense',
      icon: '📐'
    },
    {
      key: 'visualTone' as keyof TunerSettings,
      label: 'Visual Tone', 
      description: 'Playful, casual design ↔ Professional, formal design',
      leftLabel: 'Playful',
      rightLabel: 'Professional',
      icon: '🎨'
    },
    {
      key: 'colorEmphasis' as keyof TunerSettings,
      label: 'Color Emphasis',
      description: 'Neutral, monochrome palette ↔ Vibrant, colorful palette',
      leftLabel: 'Neutral',
      rightLabel: 'Vibrant',
      icon: '🌈'
    },
    {
      key: 'fidelity' as keyof TunerSettings,
      label: 'Visual Fidelity',
      description: 'Basic wireframes ↔ High-fidelity realistic mockups',
      leftLabel: 'Wireframe',
      rightLabel: 'Realistic',
      icon: '🔍'
    }
  ];

  return (
    <Card className="bg-slate-800 border-slate-700 animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎛️</span>
            <span>Customize Visual</span>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sliders */}
        <div className="space-y-6">
          {sliderConfigs.map((config) => (
            <div key={config.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{config.icon}</span>
                <label className="text-white font-medium">{config.label}</label>
                <div className="ml-auto bg-blue-600 text-white px-2 py-1 rounded text-xs">
                  {settings[config.key]}%
                </div>
              </div>
              
              <p className="text-slate-400 text-sm">{config.description}</p>
              
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 w-16">{config.leftLabel}</span>
                
                <div className="flex-1">
                  <Slider
                    value={[settings[config.key]]}
                    onValueChange={(values) => handleSliderChange(config.key, values)}
                    max={100}
                    min={0}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
                
                <span className="text-xs text-slate-500 w-16 text-right">{config.rightLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Prompt Preview Toggle */}
        <div className="space-y-3">
          <Button
            variant="ghost"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 p-0"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide' : 'Preview'} Enhanced Prompt
          </Button>
          
          {showPreview && (
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-600">
              <pre className="text-slate-300 text-sm whitespace-pre-wrap overflow-auto max-h-32">
                {enhancedPrompt}
              </pre>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <span className="mr-2">🎨</span>
                Generate Custom Visual
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="px-4 bg-slate-700 hover:bg-slate-600 border-slate-600"
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced prompt builder function
const buildEnhancedPrompt = (basePrompt: string, settings: TunerSettings): string => {
  const mapValue = (value: number, lowDesc: string, midDesc: string, highDesc: string) => {
    if (value <= 33) return lowDesc;
    if (value <= 66) return midDesc;
    return highDesc;
  };

  const layoutDesc = mapValue(
    settings.layoutDensity,
    'spacious layout with minimal elements and plenty of whitespace',
    'balanced layout with moderate content density',
    'content-rich layout with multiple elements and efficient space usage'
  );

  const toneDesc = mapValue(
    settings.visualTone,
    'playful, casual design with friendly colors and rounded elements',
    'semi-professional design balancing approachability and credibility',
    'professional, formal design with clean lines and corporate aesthetics'
  );

  const colorDesc = mapValue(
    settings.colorEmphasis,
    'neutral, monochrome color palette with subtle accents',
    'moderate color usage with thoughtful accent colors',
    'vibrant, colorful palette with bold, attention-grabbing colors'
  );

  const fidelityDesc = mapValue(
    settings.fidelity,
    'basic wireframe style with simple shapes and placeholder elements',
    'mid-fidelity mockup with some visual details and realistic proportions',
    'high-fidelity, photorealistic mockup with detailed UI elements and realistic styling'
  );

  return `${basePrompt}

VISUAL STYLE CUSTOMIZATION:
- Layout: ${layoutDesc}
- Tone: ${toneDesc}
- Colors: ${colorDesc}
- Fidelity: ${fidelityDesc}

Create a UI mockup incorporating these preferences while maintaining UX best practices and accessibility standards.`;
};

export default PromptTuner;
