import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { FigmantImageGrid } from '@/components/analysis/figmant/FigmantImageGrid';
import { EnhancedFigmaAnalysisLayout } from '@/components/analysis/figma/EnhancedFigmaAnalysisLayout';
import { ChevronLeft, Grid, FileText } from 'lucide-react';

interface AnalysisLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  onTabChange: (tab: 'menu' | 'chat') => void;
  activeTab: 'menu' | 'chat';
  images?: any[];
  analysisData?: any;
  strategistAnalysis?: any;
  userChallenge?: string;
  onBack?: () => void;
}

export function AnalysisLayout({ 
  children, 
  sidebar, 
  onTabChange, 
  activeTab, 
  images, 
  analysisData, 
  strategistAnalysis, 
  userChallenge, 
  onBack 
}: AnalysisLayoutProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'detail'>('gallery');

  // Check if we have analysis data to show the enhanced layout
  const showEnhancedLayout = analysisData && images;

  // Handle image selection
  const handleImageSelect = (image: any) => {
    setSelectedImage(image);
    setViewMode('detail');
  };

  // Handle back to gallery
  const handleBackToGallery = () => {
    setSelectedImage(null);
    setViewMode('gallery');
  };

  // If we have analysis data, show the enhanced two-part structure
  if (showEnhancedLayout) {
    return (
      <div className="h-screen flex bg-muted/20">
        {/* Left Sidebar - Analysis Summary */}
        <div className="w-80 flex flex-col bg-card border-r border-border">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="p-1 h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Figmant Analysis</h2>
                <p className="text-sm text-muted-foreground">
                  {viewMode === 'gallery' ? 'Image Gallery' : 'Detailed Analysis'}
                </p>
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button 
                variant={viewMode === 'gallery' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="flex-1 flex items-center gap-2"
                onClick={handleBackToGallery}
              >
                <Grid className="h-4 w-4" />
                Gallery
              </Button>
              <Button 
                variant={viewMode === 'detail' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="flex-1 flex items-center gap-2"
                disabled={!selectedImage}
              >
                <FileText className="h-4 w-4" />
                Details
              </Button>
            </div>
          </div>
          
          {/* Analysis Summary Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {viewMode === 'gallery' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Session Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Images:</span>
                      <span className="text-foreground">{images?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issues Found:</span>
                      <span className="text-foreground">
                        {analysisData?.claude_analysis_data?.issues?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
                
                {userChallenge && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">User Challenge</h3>
                    <p className="text-sm text-muted-foreground">{userChallenge}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Select an Image</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on any image in the gallery to view detailed analysis and recommendations.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Image Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Viewing detailed recommendations for: {selectedImage?.file_name}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToGallery}
                  className="w-full"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Back to Gallery
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {viewMode === 'gallery' ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground mb-2">Image Gallery</h1>
                  <p className="text-muted-foreground">
                    Select an image to view detailed analysis and recommendations
                  </p>
                </div>
                
                <FigmantImageGrid
                  images={images}
                  onImageSelect={handleImageSelect}
                  analysisData={analysisData}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <EnhancedFigmaAnalysisLayout
                analysisData={analysisData}
                strategistAnalysis={strategistAnalysis}
                userChallenge={userChallenge}
                onBack={handleBackToGallery}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback to original layout for compatibility
  return (
    <div className="h-screen flex bg-muted/20">
      {/* Left Sidebar */}
      <div className="w-72 flex flex-col">
        {/* Sidebar Header */}
        <div className="bg-card border-r border-border p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Dashboard Analysis</h2>
              <p className="text-sm text-muted-foreground">Session in progress</p>
            </div>
          </div>
          
          {/* Menu/Chat Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button 
              variant={activeTab === 'menu' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="flex-1"
              onClick={() => onTabChange('menu')}
            >
              Menu
            </Button>
            <Button 
              variant={activeTab === 'chat' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="flex-1"
              onClick={() => onTabChange('chat')}
            >
              Chat
            </Button>
          </div>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 bg-card border-r border-border overflow-y-auto">
          {sidebar || <div className="p-4 text-sm text-muted-foreground">Switch to Menu to see navigation options</div>}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}