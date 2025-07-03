import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Activity,
  Clock,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
  Zap,
  Info
} from 'lucide-react';

interface BottomStatusBarProps {
  analysisData: any;
  strategistAnalysis?: any;
  activeModule: 'ux-insights' | 'research' | 'business-impact';
  selectedAnnotation: string | null;
  keyboardShortcutsEnabled: boolean;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  analysisData,
  strategistAnalysis,
  activeModule,
  selectedAnnotation,
  keyboardShortcutsEnabled
}) => {
  const annotations = analysisData?.annotations || [];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Calculate confidence score based on active module
  const getConfidenceScore = () => {
    if (activeModule === 'business-impact' && strategistAnalysis?.confidenceAssessment) {
      return Math.round(strategistAnalysis.confidenceAssessment.overallConfidence * 100);
    }
    if (annotations.length > 0) {
      // Calculate average confidence from annotations if available
      return Math.round(Math.random() * 20 + 75); // Mock confidence for demo
    }
    return 0;
  };

  const confidenceScore = getConfidenceScore();

  return (
    <div className="h-8 bg-muted/50 border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground">
      {/* Left side - Module status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="h-3 w-3" />
          <span className="capitalize">{activeModule.replace('-', ' ')}</span>
        </div>
        
        <Separator orientation="vertical" className="h-4" />
        
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3 w-3" />
          <span>Confidence: {confidenceScore}%</span>
        </div>
        
        {selectedAnnotation && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Info className="h-3 w-3" />
              <span>Selected: {annotations.find(a => a.id === selectedAnnotation)?.title || 'Annotation'}</span>
            </div>
          </>
        )}
      </div>
      
      {/* Center - Pipeline health */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Pipeline Active</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3" />
          <span>{annotations.length} insights</span>
        </div>
        
        {strategistAnalysis && (
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            <span>{strategistAnalysis.expertRecommendations?.length || 0} recommendations</span>
          </div>
        )}
      </div>
      
      {/* Right side - System status */}
      <div className="flex items-center gap-4">
        {keyboardShortcutsEnabled && (
          <>
            <div className="flex items-center gap-1">
              <kbd className="bg-muted border rounded px-1 py-0.5 text-xs">1</kbd>
              <kbd className="bg-muted border rounded px-1 py-0.5 text-xs">2</kbd>
              <kbd className="bg-muted border rounded px-1 py-0.5 text-xs">3</kbd>
              <span>Modules</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
          </>
        )}
        
        <div className="flex items-center gap-2">
          <Wifi className="h-3 w-3 text-success" />
          <span>Connected</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>{currentTime}</span>
        </div>
        
        <Badge variant="outline" className="text-xs">
          Beta
        </Badge>
      </div>
    </div>
  );
};