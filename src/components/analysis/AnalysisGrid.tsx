import React from 'react';
import { Card } from '@/components/ui/card';

export function AnalysisGrid() {
  const mockImages = [
    {
      id: 1,
      title: 'SaaS Website Landing Page',
      annotations: 4,
      description: 'Create High-Impact Marketing Content in Seconds with AI',
      status: 'analyzed'
    },
    {
      id: 2,
      title: 'Cute Shop Storefront Icon',
      annotations: 0,
      description: '3D Icons',
      status: 'analyzed'
    },
    {
      id: 3,
      title: 'Futuristic Humanoid Robot',
      annotations: 0,
      description: 'Untitled Folder',
      status: 'processing'
    },
    {
      id: 4,
      title: 'Cute Shop Storefront Icon',
      annotations: 0,
      description: '3D Icons',
      status: 'processing'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {mockImages.map((image) => (
        <Card key={image.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="aspect-video bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-lg mb-2 mx-auto flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <p className="text-sm font-medium">{image.title}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">{image.title}</h3>
            <p className="text-xs text-muted-foreground">{image.description}</p>
            
            {image.annotations > 0 && (
              <div className="text-xs text-muted-foreground">
                {image.annotations} Annotations
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                image.status === 'analyzed' ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-xs text-muted-foreground capitalize">
                {image.status}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}