import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnnotationDialog from './AnnotationDialog';
import { useNavigation } from '@/contexts/NavigationContext';

interface DetailedModeViewProps {
  images: any[];
  session: any;
  results: any;
  showAnnotations: boolean;
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowAnnotations: React.Dispatch<React.SetStateAction<boolean>>;
  chatFeedbackAnchors?: {[messageId: string]: any[]};
}

const DetailedModeView: React.FC<DetailedModeViewProps> = ({
  images,
  session,
  results,
  showAnnotations,
  currentImageIndex,
  setCurrentImageIndex,
  setShowAnnotations,
  chatFeedbackAnchors = {}
}) => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setTotalImages, setCurrentImageIndex: setNavigationImageIndex } = useNavigation();

  // Sync with navigation context - optimized to prevent unnecessary re-renders
  useEffect(() => {
    if (setTotalImages && images.length > 0) {
      setTotalImages(images.length);
    }
  }, [images.length, setTotalImages]);

  useEffect(() => {
    if (setNavigationImageIndex && currentImageIndex >= 0) {
      setNavigationImageIndex(currentImageIndex);
    }
  }, [currentImageIndex, setNavigationImageIndex]);
  
  const currentImage = images[currentImageIndex];
  
  // Enhanced annotation extraction: Parse JSON analysis and extract detailed issues
  const extractAnnotationsFromPersonaData = () => {
    const personaFeedback = results?.persona_feedback;
    const personaType = session?.persona_type || 'strategic';
    
    console.log('🔍 extractAnnotationsFromPersonaData debug:', {
      hasPersonaFeedback: !!personaFeedback,
      personaType,
      personaFeedbackKeys: personaFeedback ? Object.keys(personaFeedback) : [],
      personaSpecificData: personaFeedback?.[personaType] ? Object.keys(personaFeedback[personaType]) : []
    });
    
    if (!personaFeedback) {
      console.log('❌ No persona feedback found');
      return [];
    }
    
    // Get the persona-specific data
    const personaData = personaFeedback[personaType] || personaFeedback;
    
    console.log('🔍 Persona data structure:', {
      hasPersonaData: !!personaData,
      personaDataKeys: personaData ? Object.keys(personaData) : [],
      hasAnalysis: !!personaData?.analysis,
      analysisType: personaData?.analysis ? typeof personaData.analysis : 'undefined',
      analysisPreview: personaData?.analysis ? personaData.analysis.substring(0, 200) : 'N/A',
      hasIssues: !!personaData?.issues,
      issuesType: personaData?.issues ? typeof personaData.issues : 'undefined',
      issuesLength: Array.isArray(personaData?.issues) ? personaData.issues.length : 'not array'
    });
    
    // PRIORITY 1: Parse JSON string in analysis field to extract detailed Claude annotations
    if (personaData?.analysis) {
      let analysisData;
      
      try {
        // Handle both string and object cases
        if (typeof personaData.analysis === 'string') {
          console.log('🔍 Parsing analysis JSON string...');
          analysisData = JSON.parse(personaData.analysis);
        } else if (typeof personaData.analysis === 'object') {
          console.log('🔍 Using analysis object directly...');
          analysisData = personaData.analysis;
        }
        
        if (analysisData) {
          console.log('✅ Analysis data found:', {
            hasIssues: !!analysisData.issues,
            issuesLength: Array.isArray(analysisData.issues) ? analysisData.issues.length : 'not array',
            hasRecommendations: !!analysisData.recommendations,
            recommendationsLength: Array.isArray(analysisData.recommendations) ? analysisData.recommendations.length : 'not array',
            keys: Object.keys(analysisData)
          });
          
          // Extract all detailed issues/recommendations from Claude's analysis
          const issuesArray = Array.isArray(analysisData.issues) ? analysisData.issues : [];
          const recommendationsArray = Array.isArray(analysisData.recommendations) ? analysisData.recommendations : [];
          const allIssues = [...issuesArray, ...recommendationsArray];
          
          if (allIssues.length > 0) {
            console.log('✅ Using Claude\'s detailed analysis - found:', issuesArray.length, 'issues,', recommendationsArray.length, 'recommendations');
            
            const annotations = allIssues.map((issue: any, index: number) => {
              console.log(`🎯 Processing Claude issue ${index}:`, {
                id: issue.id,
                type: issue.type,
                description: issue.description?.substring(0, 100),
                suggested_fix: issue.suggested_fix?.substring(0, 100),
                priority: issue.priority,
                coordinates: issue.coordinates
              });
              
              // Use Claude's coordinates if available, otherwise use distribution pattern
              let x, y;
              if (issue.coordinates && typeof issue.coordinates === 'object') {
                x = issue.coordinates.x || issue.coordinates.left;
                y = issue.coordinates.y || issue.coordinates.top;
              }
              
              // Fallback to distribution pattern if no coordinates
              if (x === undefined || y === undefined) {
                x = 15 + (index % 4) * 20; // 15%, 35%, 55%, 75%
                y = 15 + Math.floor(index / 4) * 20; // 15%, 35%, 55%, 75%
              }
              
              // Determine image index from Claude's data or distribute evenly
              const imageIndex = issue.image_index !== undefined ? issue.image_index : Math.floor(index / 3);
              
              return {
                id: issue.id || `claude-issue-${index}`,
                title: issue.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'UX Issue',
                description: issue.description || 'Interface issue detected by Claude',
                feedback: issue.suggested_fix || issue.description || 'Improvement recommended',
                suggested_fix: issue.suggested_fix,
                impact: issue.impact || 'Affects user experience',
                category: issue.type || 'general',
                priority: issue.priority || 'medium',
                x: x,
                y: y,
                width: 8,
                height: 4,
                image_index: imageIndex,
                imageIndex: imageIndex
              };
            });
            
            console.log('✅ Generated', annotations.length, 'annotations from Claude\'s detailed analysis');
            return annotations;
          }
        }
      } catch (error) {
        console.error('❌ Failed to parse Claude analysis:', error, {
          analysisType: typeof personaData.analysis,
          analysisPreview: typeof personaData.analysis === 'string' ? personaData.analysis.substring(0, 200) : 'Not string'
        });
        // Continue to other extraction methods
      }
    }
    
    // PRIORITY 2: Check for direct issues array with detailed analysis
    if (personaData?.issues && Array.isArray(personaData.issues) && personaData.issues.length > 0) {
      // Check if these are detailed objects rather than simple strings
      const detailedIssues = personaData.issues.filter((issue: any) => 
        typeof issue === 'object' && (issue.description || issue.suggested_fix || issue.type)
      );
      
      if (detailedIssues.length > 0) {
        console.log('✅ Using direct issues array with detailed analysis:', detailedIssues.length, 'issues');
        const annotations = detailedIssues.map((issue: any, index: number) => {
          console.log(`🎯 Processing issue ${index}:`, {
            id: issue.id,
            type: issue.type,
            description: issue.description?.substring(0, 100),
            suggested_fix: issue.suggested_fix?.substring(0, 100),
            priority: issue.priority
          });
          
          // Fix coordinate system
          const baseX = 15 + (index % 4) * 20;
          const baseY = 15 + Math.floor(index / 4) * 20;
          
          return {
            id: issue.id || `claude-issue-${index}`,
            title: issue.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'UX Issue',
            description: issue.description || 'Interface issue detected',
            feedback: issue.suggested_fix || issue.description || 'Improvement recommended',
            suggested_fix: issue.suggested_fix,
            impact: issue.impact || 'Affects user experience',
            category: issue.type || 'general',
            x: baseX,
            y: baseY,
            width: 8,
            height: 4,
            image_index: Math.floor(index / 3),
            imageIndex: Math.floor(index / 3)
          };
        });
        
        console.log('✅ Generated', annotations.length, 'annotations from direct issues');
        return annotations;
      }
    }
    
    // PRIORITY 3: Check for recommendations array with detailed data
    if (personaData?.recommendations && Array.isArray(personaData.recommendations) && personaData.recommendations.length > 0) {
      console.log('✅ Using persona recommendations array:', personaData.recommendations.length, 'recommendations');
      
      // Filter and process recommendations that have detailed structure
      const detailedRecommendations = personaData.recommendations.filter((rec: any) => 
        typeof rec === 'object' && (rec.description || rec.suggested_fix || rec.problem)
      );
      
      if (detailedRecommendations.length > 0) {
        console.log('✅ Found', detailedRecommendations.length, 'detailed recommendations');
        const annotations = detailedRecommendations.map((rec: any, index: number) => {
          console.log(`🎯 Processing recommendation ${index}:`, {
            type: typeof rec,
            description: rec.description?.substring(0, 100),
            suggested_fix: rec.suggested_fix?.substring(0, 100),
            problem: rec.problem?.substring(0, 100)
          });
          
          // Fix coordinate system
          const baseX = 15 + (index % 4) * 20;
          const baseY = 15 + Math.floor(index / 4) * 20;
          
          return {
            id: rec.id || `claude-rec-${index}`,
            title: rec.title || rec.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'UX Recommendation',
            description: rec.description || rec.problem || 'UX improvement needed',
            feedback: rec.suggested_fix || rec.solution || rec.impact || 'Apply recommended improvements',
            suggested_fix: rec.suggested_fix,
            impact: rec.impact || 'Improves user experience',
            category: rec.category || rec.type || 'general',
            x: baseX,
            y: baseY,
            width: 8,
            height: 4,
            image_index: Math.floor(index / 3),
            imageIndex: Math.floor(index / 3)
          };
        });
        
        console.log('✅ Generated', annotations.length, 'annotations from detailed recommendations');
        return annotations;
      }
    }
    
    // PRIORITY 4: Check for pre-generated annotations in persona data
    if (personaData?.annotations && Array.isArray(personaData.annotations) && personaData.annotations.length > 0) {
      console.log('✅ Using pre-generated persona annotations:', personaData.annotations.length);
      return personaData.annotations.map((ann: any, index: number) => ({
        ...ann,
        id: ann.id || `persona-ann-${index}`,
        image_index: ann.image_index !== undefined ? ann.image_index : Math.floor(index / 3),
        imageIndex: ann.imageIndex !== undefined ? ann.imageIndex : Math.floor(index / 3)
      }));
    }
    
    // PRIORITY 5: Check the root annotations data structure
    if (results?.annotations && Array.isArray(results.annotations) && results.annotations.length > 0) {
      console.log('⚠️ Using root-level annotations as fallback:', results.annotations.length);
      return results.annotations.map((ann: any, index: number) => ({
        ...ann,
        id: ann.id || `root-ann-${index}`,
        image_index: ann.image_index !== undefined ? ann.image_index : Math.floor(index / 3),
        imageIndex: ann.imageIndex !== undefined ? ann.imageIndex : Math.floor(index / 3)
      }));
    }
    
    console.log('❌ No Claude detailed analysis found in any expected data structure');
    return [];
  };
  
  // Memoize annotation extraction to prevent re-computation on every render
  const allAnnotations = React.useMemo(() => {
    const personaAnnotations = extractAnnotationsFromPersonaData();
    const legacyAnnotations = results?.annotations || [];
    
    // Prioritize persona annotations, but include legacy ones if no persona annotations exist
    return personaAnnotations.length > 0 ? personaAnnotations : legacyAnnotations;
  }, [results?.persona_feedback, results?.annotations, session?.persona_type]);

  // Just add this logging to verify annotations are coming through
  console.log('📊 DetailedModeView annotations:', {
    annotationCount: allAnnotations.length,
    sampleAnnotation: allAnnotations[0],
    annotationTitles: allAnnotations.map(a => a.title || a.feedback?.substring(0, 30))
  });
  
  console.log('📊 Annotation extraction summary:', {
    totalUsed: allAnnotations.length,
    currentImageIndex
  });
  
  // Memoize filtered annotations to prevent unnecessary filtering
  const annotations = React.useMemo(() => {
    return allAnnotations.filter((annotation: any) => {
      // Check if annotation has image_index or image_id that matches current image
      const hasImageIndex = annotation.image_index === currentImageIndex || annotation.imageIndex === currentImageIndex;
      const hasImageId = annotation.image_id === currentImage?.id;
      
      // If annotation is specifically tagged for this image, show it
      if (hasImageIndex || hasImageId) {
        return true;
      }
      
      // Fallback: If no annotations have image associations, show all on first image
      const hasAnyImageAssociations = allAnnotations.some((ann: any) => 
        ann.image_index !== undefined || ann.imageIndex !== undefined || ann.image_id !== undefined
      );
      
      // If no annotations have image associations, show them all on the first image only
      if (!hasAnyImageAssociations && currentImageIndex === 0) {
        return true;
      }
      
      return false;
    });
  }, [allAnnotations, currentImageIndex, currentImage?.id]);

  console.log(`📋 Filtered annotations for image ${currentImageIndex + 1}:`, {
    totalAvailable: allAnnotations.length,
    filtered: annotations.length,
    currentImage: currentImage?.fileName || currentImage?.file_name
  });

  // Get total feedback anchors count
  const totalFeedbackAnchors = Object.values(chatFeedbackAnchors).flat().length;

  return (
    <div className="space-y-4 w-full">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Image Analysis ({currentImageIndex + 1} of {images.length})</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAnnotations(!showAnnotations)}
            variant={showAnnotations ? "default" : "outline"}
            size="sm"
          >
            {showAnnotations ? '👁️ Hide' : '👁️ Show'} Annotations ({annotations.length})
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto mb-4">
        {images.map((img, idx) => (
          <button
            key={img.id || `img-${idx}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentImageIndex(idx);
            }}
            className={`w-20 h-20 rounded border-2 overflow-hidden transition-all duration-200 hover:scale-105 ${
              idx === currentImageIndex ? 'border-green-500' : 'border-gray-300'
            }`}
          >
            <img src={img.url || img.file_path} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <img
          src={currentImage?.url || currentImage?.file_path}
          alt={`Screen ${currentImageIndex + 1}`}
          className="w-full h-full object-contain"
        />

        {showAnnotations && annotations.length > 0 && annotations.map((annotation: any, idx: number) => {
          // Handle coordinates - they might be directly on annotation or nested
          let x, y, width, height;
          if (annotation.coordinates) {
            x = annotation.coordinates.x || 0;
            y = annotation.coordinates.y || 0;
            width = annotation.coordinates.width || 8;
            height = annotation.coordinates.height || 4;
          } else {
            // Coordinates directly on annotation object
            x = annotation.x || 0;
            y = annotation.y || 0;
            width = annotation.width || 8;
            height = annotation.height || 4;
          }

          const handleAnnotationClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedAnnotation(annotation);
            setDialogOpen(true);
          };
          
          return (
            <div
              key={idx}
              className="absolute border-2 border-pink-500 bg-pink-500/20 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-pink-500/30 transition-colors shadow-lg"
              style={{
                top: `${y}%`,
                left: `${x}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={handleAnnotationClick}
              title="Click to view full annotation"
            >
              <span className="text-pink-900 font-bold text-sm">
                {idx + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chat Feedback Integration */}
      {totalFeedbackAnchors > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              💬 Chat Feedback Anchors ({totalFeedbackAnchors})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(chatFeedbackAnchors).map(([messageId, anchors]) => (
                <div key={messageId} className="space-y-1">
                  {anchors.map((anchor, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="bg-purple-100 text-purple-700">
                        {anchor.type}
                      </Badge>
                      <span className="text-purple-600">
                        {anchor.timestamp.toLocaleTimeString()}
                      </span>
                      {anchor.data && (
                        <span className="text-purple-800 truncate max-w-xs">
                          {typeof anchor.data === 'string' ? anchor.data.slice(0, 50) + '...' : 'Feedback data'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AnnotationDialog
        annotation={selectedAnnotation}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        persona={session?.persona_type || 'clarity'}
      />
    </div>
  );
};

export default DetailedModeView;
