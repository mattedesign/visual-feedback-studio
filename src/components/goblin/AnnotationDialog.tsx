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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className={`flex items-center gap-2 ${colors.primary}`}>
              👾 {annotation.title || `${persona.charAt(0).toUpperCase() + persona.slice(1)} Feedback`}
            </DialogTitle>
            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={colors.badge}>
              {persona}
            </Badge>
            {annotation.priority && (
              <Badge variant="secondary" className={colors.badge}>
                {annotation.priority} priority
              </Badge>
            )}
            {annotation.category && (
              <Badge variant="outline" className={colors.badge}>
                {annotation.category}
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <div className={`rounded-lg p-4 ${colors.bg} ${colors.border} border`}>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {annotationText}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnotationDialog;