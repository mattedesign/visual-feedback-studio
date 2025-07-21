
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Clock, 
  Zap, 
  Code, 
  Lightbulb,
  Filter,
  Eye,
  EyeOff,
  Star,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnotationOverlay } from '@/components/goblin/ImageAnnotationOverlay';
// Add to existing imports
import { VisualPrototypeOverlay } from '@/components/prototypes/VisualPrototypeOverlay';
import { ComprehensivePrototypeViewer } from '@/components/prototypes/ComprehensivePrototypeViewer';
import { PrototypeStorageService } from '@/services/prototypes/prototypeStorageService';
import type { VisualPrototype } from '@/types/analysis';

// Enhanced interfaces for rich analysis results
interface EnhancedAnalysisIssue {
  id: string;
  title: string;
  description: string;
  category: 'accessibility' | 'usability' | 'visual' | 'content' | 'performance' | 'conversion';
  severity: 'critical' | 'warning' | 'improvement';
  confidence: number; // 0.0 - 1.0
  impact_scope: 'user-trust' | 'task-completion' | 'conversion' | 'readability' | 'performance' | 'aesthetic';
  
  element: {
    location: {
      x: number;
      y: number;
      width: number;
      height: number;
      xPercent: number;
      yPercent: number;
      widthPercent: number;
      heightPercent: number;
    };
  };
  
  // Implementation details
  implementation?: {
    effort: 'minutes' | 'hours' | 'days';
    code_snippet?: string;
    design_guidance?: string;
    rationale?: string;
  };
  
  // Business impact
  business_impact?: {
    roi_score: number;
    priority_level: 'critical' | 'high' | 'medium' | 'low';
    quick_win: boolean;
  };
}

interface AnalysisResultsProps {
  images: Array<{ url: string; fileName: string; id: string }>;
  issues: EnhancedAnalysisIssue[];
  suggestions?: Array<{
    id: string;
    title: string;
    description: string;
    impact: string;
    effort: string;
    category: string;
  }>;
  analysisMetadata?: {
    processingTime?: number;
    confidence?: number;
    totalIssues?: number;
    screenType?: string;
  };
  onBack?: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  images,
  issues,
  suggestions = [],
  analysisMetadata,
  onBack
}) => {
  // Add comprehensive logging for props
  console.log('🎨 AnalysisResults RENDER - Props received:', {
    imageCount: images?.length || 0,
    issueCount: issues?.length || 0,
    suggestionCount: suggestions?.length || 0,
    hasAnalysisMetadata: !!analysisMetadata,
    suggestionsDetailed: suggestions,
    firstSuggestion: suggestions?.[0],
    suggestionsIsArray: Array.isArray(suggestions)
  });

  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning' | 'improvement'>('all');
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'severity' | 'confidence' | 'effort'>('severity');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Add to your existing state
  const [prototypes, setPrototypes] = useState<VisualPrototype[]>([]);
  const [selectedPrototype, setSelectedPrototype] = useState<VisualPrototype | null>(null);
  const [showPrototypeViewer, setShowPrototypeViewer] = useState(false);
  const [prototypeViewMode, setPrototypeViewMode] = useState<'list' | 'overlay'>('list');
  const [prototypesLoaded, setPrototypesLoaded] = useState(false);

  // Filter and sort issues
  const filteredAndSortedIssues = useMemo(() => {
    let filtered = issues;
    
    // Apply severity filter
    if (activeFilter !== 'all') {
      filtered = issues.filter(issue => issue.severity === activeFilter);
    }
    
    // Sort issues
    return filtered.sort((a, b) => {
      if (sortBy === 'severity') {
        const severityOrder = { critical: 3, warning: 2, improvement: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      } else if (sortBy === 'confidence') {
        return b.confidence - a.confidence;
      } else if (sortBy === 'effort') {
        const effortOrder = { minutes: 1, hours: 2, days: 3 };
        return (effortOrder[a.implementation?.effort || 'days'] || 3) - 
               (effortOrder[b.implementation?.effort || 'days'] || 3);
      }
      return 0;
    });
  }, [issues, activeFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = issues.length;
    const critical = issues.filter(i => i.severity === 'critical').length;
    const warning = issues.filter(i => i.severity === 'warning').length;
    const improvement = issues.filter(i => i.severity === 'improvement').length;
    const quickWins = issues.filter(i => i.business_impact?.quick_win).length;
    const avgConfidence = issues.reduce((sum, i) => sum + i.confidence, 0) / total || 0;
    
    return { total, critical, warning, improvement, quickWins, avgConfidence };
  }, [issues]);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          color: 'hsl(var(--destructive))',
          bgClass: 'bg-destructive/10 border-destructive/20',
          icon: XCircle,
          label: 'Critical'
        };
      case 'warning':
        return {
          color: 'hsl(var(--warning))',
          bgClass: 'bg-warning/10 border-warning/20',
          icon: AlertTriangle,
          label: 'Warning'
        };
      case 'improvement':
        return {
          color: 'hsl(var(--primary))',
          bgClass: 'bg-primary/10 border-primary/20',
          icon: TrendingUp,
          label: 'Improvement'
        };
      default:
        return {
          color: 'hsl(var(--muted-foreground))',
          bgClass: 'bg-muted/10 border-muted/20',
          icon: TrendingUp,
          label: 'Unknown'
        };
    }
  };

  const getEffortConfig = (effort?: string) => {
    switch (effort) {
      case 'minutes':
        return { icon: Zap, label: 'Quick Fix', color: 'text-green-600' };
      case 'hours':
        return { icon: Clock, label: 'Medium', color: 'text-yellow-600' };
      case 'days':
        return { icon: Target, label: 'Complex', color: 'text-red-600' };
      default:
        return { icon: Clock, label: 'Unknown', color: 'text-gray-600' };
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const toggleIssueExpansion = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (expandedIssues.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  // Add this useEffect to load prototypes when analysis is available
  useEffect(() => {
    const loadPrototypes = async () => {
      if (images[0]?.id && !prototypesLoaded) {
        try {
          console.log('🎨 Loading prototypes for analysis:', images[0].id);
          const loadedPrototypes = await PrototypeStorageService.getPrototypesByAnalysisId(images[0].id);
          setPrototypes(loadedPrototypes);
          setPrototypesLoaded(true);
          console.log(`✅ Loaded ${loadedPrototypes.length} prototypes`);
        } catch (error) {
          console.error('❌ Failed to load prototypes:', error);
        }
      }
    };
    
    loadPrototypes();
  }, [images, prototypesLoaded]);

  // Add these handler functions
  const handlePrototypeSelect = (prototype: VisualPrototype) => {
    setSelectedPrototype(prototype);
    setShowPrototypeViewer(true);
  };

  const closePrototypeViewer = () => {
    setShowPrototypeViewer(false);
    setSelectedPrototype(null);
  };

  const togglePrototypeView = () => {
    setPrototypeViewMode(current => current === 'list' ? 'overlay' : 'list');
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Left Panel - Image with Annotations */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analysis Results</h1>
              <p className="text-muted-foreground">
                {stats.total} issues found • {Math.round(stats.avgConfidence * 100)}% avg confidence
                {suggestions.length > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    • {suggestions.length} molecular suggestions
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={showAnnotations ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                {showAnnotations ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                Annotations
              </Button>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Back to Dashboard
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">{stats.warning}</div>
                <div className="text-sm text-muted-foreground">Warning</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.improvement}</div>
                <div className="text-sm text-muted-foreground">Improvements</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.quickWins}</div>
                <div className="text-sm text-muted-foreground">Quick Wins</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{Math.round(stats.avgConfidence * 100)}%</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </CardContent>
            </Card>
          </div>

          {/* Image Selection Tabs */}
          {images.length > 1 && (
            <Tabs value={selectedImageIndex.toString()} onValueChange={(value) => setSelectedImageIndex(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                {images.map((image, index) => (
                  <TabsTrigger key={image.id} value={index.toString()} className="text-sm">
                    {image.fileName || `Image ${index + 1}`}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Main Image with Annotations */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {images[selectedImageIndex] && (
                <AnnotationOverlay
                  imageUrl={images[selectedImageIndex].url}
                  issues={filteredAndSortedIssues}
                  selectedIssue={selectedIssue}
                  onSelectIssue={setSelectedIssue}
                  showAnnotations={showAnnotations}
                />
              )}
            </CardContent>
          </Card>

          {/* ENHANCED Suggestions Section with Debug Info */}
          {(() => {
            console.log('🔍 SUGGESTIONS RENDER CHECK:', {
              hasSuggestions: suggestions.length > 0,
              suggestionCount: suggestions.length,
              suggestions: suggestions
            });
            return null;
          })()}
          
          {suggestions.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Molecular Suggestions ({suggestions.length})
                  <Badge variant="secondary" className="ml-2">
                    {suggestions.filter(s => s.impact === 'Critical').length} Critical
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {suggestions.map((suggestion, index) => {
                    console.log(`🔍 Rendering suggestion ${index + 1}:`, suggestion);
                    
                    return (
                      <div key={suggestion.id} className={cn(
                        "p-4 border border-border rounded-lg",
                        suggestion.impact === 'Critical' ? 'bg-destructive/5 border-destructive/20' :
                        suggestion.impact === 'High' ? 'bg-warning/5 border-warning/20' :
                        'bg-muted/20'
                      )}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold",
                              suggestion.impact === 'Critical' ? 'bg-destructive' :
                              suggestion.impact === 'High' ? 'bg-warning' :
                              'bg-primary'
                            )}>
                              {index + 1}
                            </div>
                            <h4 className="font-medium">{suggestion.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{suggestion.category}</Badge>
                            <Badge variant={
                              suggestion.impact === 'Critical' ? 'destructive' :
                              suggestion.impact === 'High' ? 'secondary' :
                              'default'
                            } className="text-xs">
                              {suggestion.impact}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span>Impact: {suggestion.impact}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Effort: {suggestion.effort}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Info for Suggestions (temporary) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-800">🐛 Debug: Suggestions Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-yellow-700 overflow-auto max-h-32">
                  {JSON.stringify({ 
                    suggestionCount: suggestions.length,
                    suggestions: suggestions,
                    analysisMetadata 
                  }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Visual Prototypes Section */}
          {prototypes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Visual Prototypes</h3>
                  <p className="text-gray-600 mt-1">
                    Interactive improvements you can implement directly
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={togglePrototypeView}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      prototypeViewMode === 'overlay'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {prototypeViewMode === 'overlay' ? 'List View' : 'Overlay View'}
                  </button>
                </div>
              </div>
              
              {prototypeViewMode === 'overlay' ? (
                // Overlay View
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <VisualPrototypeOverlay
                    originalImageUrl={images[selectedImageIndex]?.url || ''}
                    prototypes={prototypes}
                    onPrototypeSelect={handlePrototypeSelect}
                  />
                </div>
              ) : (
                // List View
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {prototypes.map((prototype) => (
                    <div
                      key={prototype.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                      onClick={() => handlePrototypeSelect(prototype)}
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-lg text-gray-900 leading-tight">
                            {prototype.title}
                          </h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium uppercase tracking-wide">
                            {prototype.category}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {prototype.explanation.summary}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <h5 className="font-medium text-sm text-gray-900">Key Changes:</h5>
                          <ul className="space-y-1">
                            {prototype.explanation.keyChanges.slice(0, 2).map((change, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-green-500 mt-1 flex-shrink-0">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                            {prototype.explanation.keyChanges.length > 2 && (
                              <li className="text-sm text-gray-500 italic">
                                +{prototype.explanation.keyChanges.length - 2} more improvements
                              </li>
                            )}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {new Date(prototype.createdAt).toLocaleDateString()}
                          </div>
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                            View Prototype
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Prototype Viewer Modal */}
      <ComprehensivePrototypeViewer
        prototype={selectedPrototype}
        isOpen={showPrototypeViewer}
        onClose={closePrototypeViewer}
      />

      {/* Right Panel - Issue Details */}
      <div className="w-96 border-l border-border bg-card overflow-auto">
        <div className="p-6">
          {/* Filters and Controls */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filters & Sort</span>
            </div>
            
            {/* Filter Tabs */}
            <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="critical" className="text-xs">Critical</TabsTrigger>
                <TabsTrigger value="warning" className="text-xs">Warning</TabsTrigger>
                <TabsTrigger value="improvement" className="text-xs">Improve</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Sort Options */}
            <div className="mt-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full p-2 text-sm border border-border rounded-md bg-background"
              >
                <option value="severity">Sort by Severity</option>
                <option value="confidence">Sort by Confidence</option>
                <option value="effort">Sort by Effort</option>
              </select>
            </div>
          </div>

          {/* Issue List */}
          <div className="space-y-4">
            {filteredAndSortedIssues.map((issue, index) => {
              const severityConfig = getSeverityConfig(issue.severity);
              const effortConfig = getEffortConfig(issue.implementation?.effort);
              const isExpanded = expandedIssues.has(issue.id);
              const isSelected = selectedIssue === issue.id;
              const SeverityIcon = severityConfig.icon;
              const EffortIcon = effortConfig.icon;

              return (
                <Card
                  key={issue.id}
                  className={cn(
                    "transition-all duration-200 cursor-pointer",
                    isSelected && "ring-2 ring-primary",
                    severityConfig.bgClass
                  )}
                  onClick={() => setSelectedIssue(issue.id)}
                >
                  <Collapsible open={isExpanded} onOpenChange={() => toggleIssueExpansion(issue.id)}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col space-y-3">
                        {/* Top row - Number, category, and quick win badges */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: severityConfig.color }}
                            >
                              {index + 1}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {issue.category}
                            </Badge>
                            {issue.business_impact?.quick_win && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                <Zap className="w-3 h-3 mr-1" />
                                Quick Win
                              </Badge>
                            )}
                          </div>
                          
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 hover:bg-muted/50">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        
                        {/* Title row */}
                        <div className="pr-2">
                          <CardTitle className="text-sm font-medium leading-tight mb-3">
                            {issue.title}
                          </CardTitle>
                        </div>
                        
                        {/* Bottom row - Severity, confidence, and effort */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <SeverityIcon className="w-3 h-3" />
                            {severityConfig.label}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className={cn("w-3 h-3", getConfidenceColor(issue.confidence))} />
                            {Math.round(issue.confidence * 100)}%
                          </div>
                          {issue.implementation && (
                            <div className="flex items-center gap-1">
                              <EffortIcon className={cn("w-3 h-3", effortConfig.color)} />
                              {effortConfig.label}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {/* Description */}
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {issue.description}
                          </p>
                        </div>

                        {/* Confidence Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium">Confidence Level</span>
                            <span className="text-xs">{Math.round(issue.confidence * 100)}%</span>
                          </div>
                          <Progress value={issue.confidence * 100} className="h-2" />
                        </div>

                        {/* Business Impact */}
                        {issue.business_impact && (
                          <div className="mb-4 p-3 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Business Impact</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">ROI Score:</span>
                                <div className="font-medium">{issue.business_impact.roi_score}/10</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Priority:</span>
                                <div className="font-medium capitalize">{issue.business_impact.priority_level}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Implementation Details */}
                        {issue.implementation && (
                          <div className="space-y-3">
                            {/* Effort */}
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                              <div className="flex items-center gap-2">
                                <EffortIcon className={cn("w-4 h-4", effortConfig.color)} />
                                <span className="text-sm">Implementation Effort</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {effortConfig.label}
                              </Badge>
                            </div>

                            {/* Code Snippet */}
                            {issue.implementation.code_snippet && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Code className="w-4 h-4" />
                                  <span className="text-sm font-medium">Code Solution</span>
                                </div>
                                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                                  <code>{issue.implementation.code_snippet}</code>
                                </pre>
                              </div>
                            )}

                            {/* Design Guidance */}
                            {issue.implementation.design_guidance && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Lightbulb className="w-4 h-4" />
                                  <span className="text-sm font-medium">Design Guidance</span>
                                </div>
                                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                                  {issue.implementation.design_guidance}
                                </p>
                              </div>
                            )}

                            {/* Rationale */}
                            {issue.implementation.rationale && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="w-4 h-4" />
                                  <span className="text-sm font-medium">Why This Matters</span>
                                </div>
                                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                                  {issue.implementation.rationale}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>

          {filteredAndSortedIssues.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">No issues found for selected filter</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
