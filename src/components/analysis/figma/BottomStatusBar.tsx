import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity,
  Zap,
  Target,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Share2,
  Download,
  Play,
  Pause,
  Settings,
  Wifi,
  WifiOff,
  TrendingUp,
  Brain,
  Database,
  Gauge,
  ChevronUp,
  Monitor,
  Info
} from 'lucide-react';

interface BottomStatusBarProps {
  analysisData?: any;
  strategistAnalysis?: any;
  isAnalyzing?: boolean;
  activeModule: 'ux-insights' | 'research' | 'business-impact';
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  pipelineStage?: string;
  modelConfidence?: number;
  onExport?: () => void;
  onShare?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const BottomStatusBar: React.FC<BottomStatusBarProps> = ({
  analysisData,
  strategistAnalysis,
  isAnalyzing = false,
  activeModule,
  zoomLevel,
  onZoomChange,
  pipelineStage = 'completed',
  modelConfidence = 88,
  onExport,
  onShare,
  collapsed = false,
  onToggleCollapse
}) => {
  const [realTimeStatus, setRealTimeStatus] = useState<'connected' | 'disconnected'>('connected');
  const [processingTime, setProcessingTime] = useState(0);
  const [activeUsers, setActiveUsers] = useState(1);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAnalyzing) {
        setProcessingTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const annotations = analysisData?.annotations || [];
  const totalIssues = annotations.length;
  const criticalIssues = annotations.filter(a => a.severity === 'critical').length;

  const getStageProgress = () => {
    switch (pipelineStage) {
      case 'analyzing': return 25;
      case 'processing': return 50;
      case 'synthesizing': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStageIcon = () => {
    switch (pipelineStage) {
      case 'analyzing': return <Brain className="h-3 w-3" />;
      case 'processing': return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'synthesizing': return <TrendingUp className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3 text-success" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-success';
    if (confidence >= 60) return 'text-warning';
    return 'text-destructive';
  };

  if (collapsed) {
    return (
      <div className="h-8 bg-sidebar text-sidebar-foreground border-t border-sidebar-border flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getStageIcon()}
            <span className="text-xs font-medium capitalize">{pipelineStage}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Gauge className="h-3 w-3" />
            <span className={`text-xs font-medium ${getConfidenceColor(modelConfidence)}`}>
              {modelConfidence}%
            </span>
          </div>
          
          <Badge variant="outline" className="text-xs h-5">
            {totalIssues} issues
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-6 w-6 p-0"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-20 bg-sidebar text-sidebar-foreground border-t border-sidebar-border flex items-center justify-between px-6">
      {/* Left Section - Pipeline Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStageIcon()}
            <span className="text-sm font-medium capitalize">{pipelineStage}</span>
          </div>
          
          <div className="w-32">
            <Progress value={getStageProgress()} className="h-2" />
          </div>
          
          <span className="text-xs text-muted-foreground">
            {getStageProgress()}%
          </span>
        </div>
        
        <div className="h-8 w-px bg-sidebar-border" />
        
        <div className="flex items-center gap-4">
          {/* Model Confidence */}
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">Confidence:</span>
            <span className={`text-sm font-medium ${getConfidenceColor(modelConfidence)}`}>
              {modelConfidence}%
            </span>
          </div>
          
          {/* Processing Time */}
          {(isAnalyzing || processingTime > 0) && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">Time:</span>
              <span className="text-sm font-medium">
                {Math.floor(processingTime / 60)}:{(processingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
          
          {/* Real-time Status */}
          <div className="flex items-center gap-2">
            {realTimeStatus === 'connected' ? (
              <Wifi className="h-4 w-4 text-success" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </div>
      
      {/* Center Section - Analysis Summary */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold">{totalIssues}</div>
            <div className="text-xs text-muted-foreground">Total Issues</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">{criticalIssues}</div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-success">
              {strategistAnalysis?.expertRecommendations?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Recommendations</div>
          </div>
        </div>
        
        <div className="h-8 w-px bg-sidebar-border" />
        
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm">{activeUsers}</span>
          <span className="text-xs text-muted-foreground">viewing</span>
        </div>
      </div>
      
      {/* Right Section - Controls */}
      <div className="flex items-center gap-4">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onZoomChange(Math.max(50, zoomLevel - 25))}
            disabled={zoomLevel <= 50}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          
          <span className="text-sm font-medium min-w-[3rem] text-center">
            {zoomLevel}%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onZoomChange(Math.min(200, zoomLevel + 25))}
            disabled={zoomLevel >= 200}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onZoomChange(100)}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="h-8 w-px bg-sidebar-border" />
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="h-8 w-8 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="h-8 w-8 p-0"
          >
            <Share2 className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          <Monitor className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};