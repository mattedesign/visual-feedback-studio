import { useState } from 'react';
import { getPatternById } from '@/data/visualPatternLibrary';

interface Props {
  userImage: string;
  patternId: string;
}

export function PatternComparisonSlider({ userImage, patternId }: Props) {
  const [blendAmount, setBlendAmount] = useState(0);
  const pattern = getPatternById(patternId);
  
  return (
    <div className="space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-lg">
        {/* User's design */}
        <img 
          src={userImage}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 1 - blendAmount / 100 }}
        />
        
        {/* Pattern overlay */}
        <img 
          src={pattern.thumbnails.default}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: blendAmount / 100 }}
        />
        
        {/* Blend indicator */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 
                        text-white text-sm rounded-full">
          {blendAmount === 0 ? 'Your Design' : 
           blendAmount === 100 ? `${pattern.company} Style` :
           `${blendAmount}% ${pattern.company}`}
        </div>
      </div>
      
      {/* Slider */}
      <div className="flex items-center gap-4">
        <span className="text-sm">Your Design</span>
        <input
          type="range"
          min="0"
          max="100"
          value={blendAmount}
          onChange={(e) => setBlendAmount(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm">{pattern.company}</span>
      </div>
    </div>
  );
}