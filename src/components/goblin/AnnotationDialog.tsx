import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AnnotationDialogProps {
  annotation: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: string;
}

const AnnotationDialog: React.FC<AnnotationDialogProps> = ({
  annotation,
  open,
  onOpenChange,
  persona
}) => {
  if (!annotation) return null;

  const getPersonaColors = (personaType: string) => {
    switch(personaType) {
      case 'clarity':
        return {
          primary: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-800'
        };
      default:
        return {
          primary: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          badge: 'bg-purple-100 text-purple-800'
        };
    }
  };

  const colors = getPersonaColors(persona);
  const annotationText = annotation.feedback || annotation.description || annotation.text || 'No description available';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-none shadow-lg">
        <DialogHeader className="space-y-0 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              👾 {annotation.title || `${persona.charAt(0).toUpperCase() + persona.slice(1)} Recommendation ${annotation.id?.split('-').pop() || ''}`}
            </DialogTitle>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          
            <div className="flex items-center gap-2 pt-3">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 rounded-full px-3 py-1">
              {persona}
            </Badge>
            {annotation.impact && (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 rounded-full px-3 py-1">
                {annotation.impact}
              </Badge>
            )}
            {annotation.category && (
              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0 rounded-full px-3 py-1">
                {annotation.category}
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="bg-purple-50 rounded-lg p-6 border-0">
          <div className="annotation-content space-y-4">
            {/* Problem Statement */}
            {(annotation.description || annotation.problemStatement || annotation.problem || annotation.issue) && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  🚨 Problem Identified
                </h4>
                <p className="text-gray-800 bg-red-50 p-3 rounded border-l-4 border-red-400">
                  {annotation.description || annotation.problemStatement || annotation.problem || annotation.issue}
                </p>
              </div>
            )}
            
            {/* Specific Solution - Updated to include suggested_fix */}
            {(annotation.suggested_fix || annotation.solutionStatement || annotation.solution || annotation.recommendation) && (
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  ✅ Specific Solution
                </h4>
                <p className="text-gray-800 bg-green-50 p-3 rounded border-l-4 border-green-400">
                  {annotation.suggested_fix || annotation.solutionStatement || annotation.solution || annotation.recommendation}
                </p>
              </div>
            )}
            
            {/* Implementation Steps */}
            {(annotation.implementationSteps || annotation.steps || annotation.howTo) && (
              <div>
                <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                  🔧 How to Implement
                </h4>
                <div className="text-gray-800 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                  {Array.isArray(annotation.implementationSteps || annotation.steps || annotation.howTo) ? (
                    <ol className="list-decimal list-inside space-y-1">
                      {(annotation.implementationSteps || annotation.steps || annotation.howTo).map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p>{annotation.implementationSteps || annotation.steps || annotation.howTo}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Business Impact */}
            {(annotation.businessImpact || annotation.impact || annotation.why) && (
              <div>
                <h4 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
                  📈 Business Impact
                </h4>
                <p className="text-gray-800 bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                  {annotation.businessImpact || annotation.impact || annotation.why}
                </p>
              </div>
            )}
            
            {/* Fallback for legacy annotations without structured data */}
            {!annotation.description && !annotation.problemStatement && !annotation.problem && !annotation.issue && 
             !annotation.suggested_fix && !annotation.solutionStatement && !annotation.solution && !annotation.recommendation && (
              <div>
                <h4 className="font-semibold text-gray-600 mb-2">📝 Feedback</h4>
                {annotationText && (
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded">
                    {annotationText}
                  </p>
                )}
                <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Note:</strong> This annotation uses a legacy format. For more detailed, actionable insights, 
                    try running a new analysis which will provide structured problem statements, specific solutions, and implementation steps.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnotationDialog;