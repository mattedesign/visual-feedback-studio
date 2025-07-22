import { useState } from 'react';
import { getPatternById } from '@/data/visualPatternLibrary';

export function VisualPatternPreview({ patternId, showInteraction = false }) {
  const pattern = getPatternById(patternId);
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  if (!pattern) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Pattern preview unavailable</p>
      </div>
    );
  }
  
  return (
    <div className="relative group">
      {/* Main Image */}
      <div 
        className="relative overflow-hidden rounded-lg cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowDetails(!showDetails)}
      >
        <img 
          src={isHovered && pattern.thumbnails.hover 
            ? pattern.thumbnails.hover 
            : pattern.thumbnails.default
          }
          alt={pattern.name}
          className="w-full transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 
                        text-white text-sm rounded-full">
          {pattern.company}
        </div>
        
        {/* Impact Badge */}
        <div className="absolute bottom-3 right-3 px-3 py-1 
                        bg-green-500 text-white text-sm rounded-full">
          {pattern.impact}
        </div>
      </div>
      
      {/* Expandable Details */}
      {showDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <p className="text-sm text-gray-700">{pattern.description}</p>
          
          <div className="flex flex-wrap gap-2">
            {pattern.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-200 
                                       text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          <button className="text-sm text-blue-600 hover:underline">
            See implementation guide →
          </button>
        </div>
      )}
    </div>
  );
}