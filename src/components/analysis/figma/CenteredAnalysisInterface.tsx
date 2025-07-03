import React, { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Upload, 
  Filter, 
  ArrowUpDown, 
  Users, 
  Mic, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Camera,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface CenteredAnalysisInterfaceProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const CenteredAnalysisInterface: React.FC<CenteredAnalysisInterfaceProps> = ({
  workflow
}) => {
  const [analysisMessage, setAnalysisMessage] = useState(workflow.analysisContext || '');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const objectUrl = URL.createObjectURL(file);
        workflow.addUploadedFile(objectUrl);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const objectUrl = URL.createObjectURL(file);
        workflow.addUploadedFile(objectUrl);
      });
    }
  };

  const handleStartAnalysis = () => {
    if (!analysisMessage.trim() || workflow.selectedImages.length === 0) return;
    
    workflow.setAnalysisContext(analysisMessage);
    workflow.goToStep('analyzing');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartAnalysis();
    }
  };

  const canAnalyze = workflow.selectedImages.length > 0 && analysisMessage.trim().length > 0;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Analysis Name</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs and Controls */}
        <div className="border-b border-border bg-background">
          <div className="flex items-center justify-between px-6 py-3">
            <Tabs defaultValue="files" className="flex-1">
              <TabsList className="bg-muted">
                <TabsTrigger value="files" className="px-6">Files</TabsTrigger>
                <TabsTrigger value="annotations" className="px-6">Annotations</TabsTrigger>
                <TabsTrigger value="context" className="px-6">Add Context</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                Group by
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 flex items-center justify-center p-12">
          <div 
            className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="w-16 h-16 bg-muted/50 rounded-xl mx-auto mb-6 flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            
            {workflow.selectedImages.length === 0 ? (
              <>
                <h3 className="text-lg font-medium mb-2">Upload your designs</h3>
                <p className="text-muted-foreground">
                  Drop your design files here or click to browse
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">
                  {workflow.selectedImages.length} file{workflow.selectedImages.length !== 1 ? 's' : ''} uploaded
                </h3>
                <p className="text-muted-foreground">
                  Add more files or start your analysis below
                </p>
              </>
            )}
          </div>
        </div>

        {/* Bottom Chat Area */}
        <div className="border-t border-border bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Input
                value={analysisMessage}
                onChange={(e) => setAnalysisMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="How can I help..."
                className="flex-1 bg-muted/50 border-0 h-12 text-base"
                disabled={workflow.isAnalyzing}
              />
              <Button size="icon" variant="ghost" className="h-12 w-12">
                <Mic className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-12 w-12">
                <MessageSquare className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Bottom Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Camera className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">100%</span>
                <Button 
                  onClick={handleStartAnalysis}
                  disabled={!canAnalyze || workflow.isAnalyzing}
                  className="px-8"
                >
                  Analyze
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};