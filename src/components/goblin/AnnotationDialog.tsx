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
            {annotation.priority && (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 rounded-full px-3 py-1">
                {annotation.priority} priority
              </Badge>
            )}
            {annotation.category && (
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 rounded-full px-3 py-1">
                {annotation.category}
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className="bg-purple-50 rounded-lg p-6 border-0">
          <div className="annotation-content">
            {/* Problem Statement */}
            <h4 className="font-semibold text-red-600 mb-2">
              🚨 {annotation.problemStatement || annotation.description || annotation.feedback || annotationText}
            </h4>
            
            {/* Solution Statement */}
            {(annotation.solutionStatement || (annotation.description && annotation.problemStatement)) && (
              <p className="text-green-600 mt-2 mb-3">
                ✅ {annotation.solutionStatement || annotation.feedback}
              </p>
            )}
            
            {/* Fallback for legacy annotations without separate statements */}
            {!annotation.problemStatement && !annotation.solutionStatement && (
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-base">
                {annotationText}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnotationDialog;