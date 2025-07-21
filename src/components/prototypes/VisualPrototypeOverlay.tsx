'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VisualPrototype } from '@/types/analysis';

interface VisualPrototypeOverlayProps {
  originalImageUrl: string;
  prototypes: VisualPrototype[];
  onPrototypeSelect: (prototype: VisualPrototype) => void;
  className?: string;
}

export function VisualPrototypeOverlay({
  originalImageUrl,
  prototypes,
  onPrototypeSelect,
  className = ''
}: VisualPrototypeOverlayProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [showAllHotspots, setShowAllHotspots] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  // Handle image load to get actual dimensions
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    setImageDimensions({ 
      width: img.naturalWidth, 
      height: img.naturalHeight 
    });
    setImageLoaded(true);
    console.log('📐 Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
  };
  
  const handleHotspotClick = (prototype: VisualPrototype) => {
    console.log('🎯 Hotspot clicked:', prototype.title);
    setSelectedHotspot(prototype.id);
    onPrototypeSelect(prototype);
  };
  
  // Calculate responsive hotspot position
  const calculateHotspotStyle = (prototype: VisualPrototype) => {
    if (!imageLoaded || imageDimensions.width === 0) {
      return { display: 'none' };
    }
    
    // Convert absolute pixel coordinates to percentage
    const leftPercent = (prototype.hotspot.x / imageDimensions.width) * 100;
    const topPercent = (prototype.hotspot.y / imageDimensions.height) * 100;
    const widthPercent = (prototype.hotspot.width / imageDimensions.width) * 100;
    const heightPercent = (prototype.hotspot.height / imageDimensions.height) * 100;
    
    return {
      left: `${Math.max(0, Math.min(95, leftPercent))}%`,
      top: `${Math.max(0, Math.min(95, topPercent))}%`,
      width: `${Math.max(2, Math.min(20, widthPercent))}%`,
      height: `${Math.max(1, Math.min(15, heightPercent))}%`,
    };
  };
  
  const getHotspotClassName = (prototype: VisualPrototype) => {
    const baseClasses = "absolute cursor-pointer group transition-all duration-200 rounded-lg border-2";
    
    let typeClasses = "";
    switch (prototype.hotspot.type) {
      case 'pulse':
        typeClasses = "border-blue-500 animate-pulse hover:animate-none";
        break;
      case 'glow':
        typeClasses = "border-purple-500 shadow-lg shadow-purple-500/50";
        break;
      case 'outline':
        typeClasses = "border-green-500 border-dashed";
        break;
      default:
        typeClasses = "border-blue-500";
    }
    
    const stateClasses = selectedHotspot === prototype.id 
      ? "bg-blue-500/30 border-blue-600 scale-105 z-20" 
      : "bg-transparent hover:bg-blue-500/20 hover:scale-105 z-10";
    
    return `${baseClasses} ${typeClasses} ${stateClasses}`;
  };
  
  const getSeverityColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'accessibility': 'bg-red-600',
      'usability': 'bg-blue-600', 
      'visual': 'bg-purple-600',
      'content': 'bg-green-600',
      'performance': 'bg-orange-600'
    };
    return colorMap[category] || 'bg-blue-600';
  };
  
  return (
    <div className={`relative w-full ${className}`}>
      {/* Main Image */}
      <div className="relative">
        <img 
          src={originalImageUrl} 
          alt="Original Design with Improvement Hotspots"
          className="w-full h-auto rounded-lg shadow-lg"
          onLoad={handleImageLoad}
          onError={(e) => {
            console.error('❌ Failed to load image:', originalImageUrl);
            setImageLoaded(false);
          }}
        />
        
        {/* Loading Overlay */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading preview...</span>
            </div>
          </div>
        )}
        
        {/* Interactive Hotspots */}
        <AnimatePresence>
          {imageLoaded && showAllHotspots && prototypes.map((prototype, index) => (
            <motion.div
              key={prototype.id}
              className={getHotspotClassName(prototype)}
              style={calculateHotspotStyle(prototype)}
              onClick={() => handleHotspotClick(prototype)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: selectedHotspot === prototype.id ? 1.05 : 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Improvement Number Badge */}
              <div className={`
                absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center 
                text-white text-sm font-bold shadow-lg z-10
                ${getSeverityColor(prototype.category)}
              `}>
                {index + 1}
              </div>
              
              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 pointer-events-none">
                <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl max-w-xs">
                  <div className="font-semibold text-sm">{prototype.title}</div>
                  <div className="text-gray-300 text-xs mt-1 leading-relaxed">
                    {prototype.explanation.summary}
                  </div>
                  <div className="text-blue-300 text-xs mt-2 font-medium">
                    Click to view prototype →
                  </div>
                </div>
                {/* Tooltip Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                  <div className="w-3 h-3 bg-gray-900 rotate-45 transform -mt-1.5"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Overlay Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-30">
        <button
          onClick={() => setShowAllHotspots(!showAllHotspots)}
          className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-white transition-all duration-200 border border-gray-200"
        >
          {showAllHotspots ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Hide Improvements
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Show Improvements
            </span>
          )}
        </button>
        
        <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm border border-gray-200">
          <span className="font-semibold text-gray-800">{prototypes.length}</span>
          <span className="text-gray-600 ml-1">
            Improvement{prototypes.length !== 1 ? 's' : ''} Found
          </span>
        </div>
      </div>
      
      {/* Legend */}
      {imageLoaded && prototypes.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm text-gray-800 mb-3">Improvement Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {prototypes.map((prototype, index) => (
              <button
                key={prototype.id}
                onClick={() => handleHotspotClick(prototype)}
                className={`
                  flex items-center gap-3 p-2 rounded-lg text-left transition-all duration-200
                  ${selectedHotspot === prototype.id 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
                  ${getSeverityColor(prototype.category)}
                `}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {prototype.title}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {prototype.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}