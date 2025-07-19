import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface FigmantImage {
  id: string;
  file_path: string;
  file_name: string;
  upload_order: number;
}

interface ImageGridProps {
  images: FigmantImage[];
  onImageSelect: (image: FigmantImage) => void;
  analysisData?: any;
}

export function FigmantImageGrid({ images, onImageSelect, analysisData }: ImageGridProps) {
  const getImageUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return supabase.storage.from('analysis-images').getPublicUrl(filePath).data.publicUrl;
  };

  const getAnnotationCount = (image: FigmantImage) => {
    if (!analysisData?.claude_analysis) return 0;
    
    const claudeAnalysis = analysisData.claude_analysis;
    const criticalIssues = claudeAnalysis.criticalIssues || [];
    const recommendations = claudeAnalysis.recommendations || [];
    
    // For the first image (main interface), show all issues
    // For other images, distribute issues or show 0 for now
    if (image.upload_order === 1) {
      return criticalIssues.length + Math.min(recommendations.length, 2);
    }
    return 0;
  };

  const getImageTitle = (image: FigmantImage) => {
    // Use filename without extension as title, cleaned up
    const nameWithoutExt = image.file_name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    const cleanName = nameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return cleanName || `Image ${image.upload_order}`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#121212] mb-2">Analysis Results</h2>
        <p className="text-[#7B7B7B]">Click on any image to view detailed analysis and annotations</p>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {images.map((image) => {
          const annotationCount = getAnnotationCount(image);
          const title = getImageTitle(image);
          
          return (
            <Card 
              key={image.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => onImageSelect(image)}
            >
              <div className="p-4">
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={getImageUrl(image.file_path)}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <div class="text-center">
                            <div class="w-16 h-16 bg-white/20 rounded-lg mb-2 mx-auto flex items-center justify-center">
                              <span class="text-2xl">🎨</span>
                            </div>
                            <p class="text-sm font-medium">${title}</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-[#121212]">{title}</h3>
                  
                  {annotationCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {annotationCount} Annotations
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-[#7B7B7B]">Analyzed</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}