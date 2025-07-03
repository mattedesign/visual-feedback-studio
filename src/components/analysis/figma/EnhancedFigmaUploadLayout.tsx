import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  FileImage, 
  Link, 
  Brain, 
  Zap, 
  Target, 
  Users, 
  BarChart3,
  ChevronRight,
  CheckCircle,
  Clock,
  Eye,
  Plus
} from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface EnhancedFigmaUploadLayoutProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const EnhancedFigmaUploadLayout: React.FC<EnhancedFigmaUploadLayoutProps> = ({
  workflow
}) => {
  const [analysisContext, setAnalysisContext] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: 'e-commerce',
      title: 'E-commerce Checkout',
      description: 'Optimize conversion rates and reduce cart abandonment',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'mobile-app',
      title: 'Mobile App Onboarding',
      description: 'Improve user activation and retention',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      id: 'dashboard',
      title: 'Analytics Dashboard',
      description: 'Enhance data comprehension and usability',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'saas-landing',
      title: 'SaaS Landing Page',
      description: 'Increase sign-ups and trial conversions',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    }
  ];

  const analysisSteps = [
    {
      step: 1,
      title: 'Upload & Context',
      description: 'Upload designs and provide context',
      status: workflow.currentStep === 'upload' ? 'active' : 'pending',
      icon: <Upload className="w-4 h-4" />
    },
    {
      step: 2,
      title: 'AI Analysis',
      description: 'Advanced UX pattern recognition',
      status: workflow.currentStep === 'analyzing' ? 'active' : 
              workflow.currentStep === 'upload' ? 'pending' : 'complete',
      icon: <Brain className="w-4 h-4" />
    },
    {
      step: 3,
      title: 'Strategic Insights',
      description: 'Business impact and recommendations',
      status: workflow.currentStep === 'results' ? 'active' : 
              ['upload', 'analyzing'].includes(workflow.currentStep) ? 'pending' : 'complete',
      icon: <Target className="w-4 h-4" />
    }
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'active': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="h-full bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Project Setup */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <div className="h-full border-r border-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">UX Analysis Studio</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered UX analysis and strategic insights
              </p>
            </div>

            {/* Analysis Process */}
            <div className="p-4 space-y-4 flex-1 overflow-auto">
              <div>
                <h3 className="font-medium mb-3">Analysis Process</h3>
                <div className="space-y-3">
                  {analysisSteps.map((step, index) => (
                    <div key={step.step} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        {getStepIcon(step.status)}
                        {index < analysisSteps.length - 1 && (
                          <div className="w-0.5 h-8 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium text-sm ${
                          step.status === 'active' ? 'text-primary' : 
                          step.status === 'complete' ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Templates */}
              <div>
                <h3 className="font-medium mb-3">Analysis Templates</h3>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-sm ${
                        selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setAnalysisContext(template.description);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded ${template.color}`}>
                            {template.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{template.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Center Panel - Main Upload Area */}
        <ResizablePanel defaultSize={50} minSize={40}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Start New Analysis</h1>
                  <p className="text-muted-foreground mt-1">
                    Upload your designs and get AI-powered UX insights
                  </p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  AI Ready
                </Badge>
              </div>
            </div>

            {/* Upload Area */}
            <div className="flex-1 p-6">
              <Tabs defaultValue="files" className="h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="files">
                    <FileImage className="w-4 h-4 mr-2" />
                    Upload Files
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <Link className="w-4 h-4 mr-2" />
                    From URL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="files" className="flex-1 mt-6">
                  <div className="h-full">
                    {workflow.selectedImages.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Uploaded Images ({workflow.selectedImages.length})</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('file-input')?.click()}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add More
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {workflow.selectedImages.map((imageUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-border"
                              />
                              <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="text-xs">
                                  {index + 1}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-lg h-full min-h-[300px] flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-muted/5 transition-colors"
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">Upload Design Files</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                          Drag and drop your design files here, or click to browse. 
                          Supports PNG, JPG, and other image formats.
                        </p>
                        <Button className="mt-4">
                          Choose Files
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="url" className="flex-1 mt-6">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">Import from URL</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Capture screenshots from live websites or design tools
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Website URL</label>
                        <Input
                          placeholder="https://example.com"
                          className="mt-1"
                        />
                      </div>
                      <Button className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        Capture Screenshot
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Context & Configuration */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <div className="h-full border-l border-border p-4 space-y-6">
            <div>
              <h3 className="font-medium mb-3">Analysis Context</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Project Description</label>
                  <Textarea
                    placeholder="Describe your project, goals, and what you want to analyze..."
                    value={analysisContext}
                    onChange={(e) => setAnalysisContext(e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Input
                    placeholder="e.g., B2B professionals, mobile users..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Analysis Features</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI Vision Analysis</span>
                  </div>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">UX Strategist</span>
                  </div>
                  <Badge variant="secondary">Pro</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Research Sources</span>
                  </div>
                  <Badge variant="secondary">23+</Badge>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button
                className="w-full"
                size="lg"
                disabled={workflow.selectedImages.length === 0}
                onClick={() => workflow.startAnalysis()}
              >
                {workflow.selectedImages.length === 0 ? (
                  'Upload images to start'
                ) : (
                  <>
                    Start Analysis
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
              {workflow.selectedImages.length > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Analyzing {workflow.selectedImages.length} image{workflow.selectedImages.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Hidden file input */}
      <input
        id="file-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            console.log('Files uploaded:', newImages);
          }
        }}
      />
    </div>
  );
};