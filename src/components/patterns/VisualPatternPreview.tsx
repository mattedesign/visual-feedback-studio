import { useState } from 'react';
import { getPatternById } from '@/data/visualPatternLibrary';

interface Props {
  patternId: string;
  showInteraction?: boolean;
}

export function VisualPatternPreview({ patternId, showInteraction = false }: Props) {
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
        className="relative overflow-hidden rounded-lg cursor-pointer shadow-sm"
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
        
        {/* Company Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur
                        text-white text-sm rounded-full">
          {pattern.company}
        </div>
        
        {/* Impact Badge */}
        <div className="absolute bottom-3 right-3 px-3 py-1 
                        bg-green-500 text-white text-sm rounded-full font-medium">
          {pattern.impact}
        </div>
        
        {/* Click Hint */}
        {showInteraction && (
          <div className="absolute inset-0 flex items-center justify-center 
                          bg-black/0 group-hover:bg-black/20 transition-all">
            <span className="opacity-0 group-hover:opacity-100 text-white 
                           bg-black/70 px-3 py-1 rounded-full text-sm">
              Click to explore
            </span>
          </div>
        )}
      </div>
      
      {/* Expandable Details */}
      {showDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3 animate-in slide-in-from-top-2">
          <p className="text-sm text-gray-700">{pattern.description}</p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {pattern.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-200 
                                       text-xs rounded-full text-gray-700">
                {tag}
              </span>
            ))}
          </div>
          
          {/* Implementation Time */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-gray-500">
              Implementation: {pattern.implementation_time}
            </span>
            <button className="text-sm text-blue-600 hover:underline font-medium">
              See implementation →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}