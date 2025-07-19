import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface FigmantImage {
  id: string;
  url: string;
  original_name: string;
  order_number: number;
}

interface ImageGridProps {
  images: FigmantImage[];
  onImageSelect: (image: FigmantImage) => void;
  analysisData?: any;
}

export function FigmantImageGrid({ images, onImageSelect, analysisData }: ImageGridProps) {
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) return imageUrl;
    return supabase.storage.from('analysis-images').getPublicUrl(imageUrl).data.publicUrl;
  };

  const getAnnotationCount = (image: FigmantImage) => {
    // Extract annotation count from analysis data
    // For now, using mock data based on image order
    const mockCounts = [4, 0, 0, 0];
    return mockCounts[image.order_number - 1] || 0;
  };

  const getImageTitle = (image: FigmantImage) => {
    // Extract meaningful titles from analysis or use filename
    const mockTitles = [
      'SaaS Website Landing Page',
      'Cute Shop Storefront Icon', 
      'Futuristic Humanoid Robot',
      'Cloud Solution Dashboard'
    ];
    return mockTitles[image.order_number - 1] || image.original_name;
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
                    src={getImageUrl(image.url)}
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