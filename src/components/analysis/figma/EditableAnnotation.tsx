import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Check, 
  X, 
  Move, 
  AlertTriangle, 
  Star, 
  CheckCircle, 
  Info,
  GripVertical 
} from 'lucide-react';

interface EditableAnnotationProps {
  annotation: {
    id: string;
    title: string;
    feedback: string;
    severity: string;
    category: string;
    x?: number;
    y?: number;
  };
  isSelected: boolean;
  isEditing: boolean;
  position: { x: number; y: number };
  onUpdate: (id: string, updates: Partial<{
    id: string;
    title: string;
    feedback: string;
    severity: string;
    category: string;
    x?: number;
    y?: number;
  }>) => void;
  onSelect: (id: string) => void;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
  onMove: (id: string, newPosition: { x: number; y: number }) => void;
  index: number;
  
}

export const EditableAnnotation: React.FC<EditableAnnotationProps> = ({
  annotation,
  isSelected,
  isEditing,
  position,
  onUpdate,
  onSelect,
  onStartEdit,
  onStopEdit,
  onMove,
  index
}) => {
  const [editedTitle, setEditedTitle] = useState(annotation.title);
  const [editedFeedback, setEditedFeedback] = useState(annotation.feedback);
  const [editedSeverity, setEditedSeverity] = useState(annotation.severity);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const markerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  // Reset edited values when switching annotations
  useEffect(() => {
    setEditedTitle(annotation.title);
    setEditedFeedback(annotation.feedback);
    setEditedSeverity(annotation.severity);
  }, [annotation.id, annotation.title, annotation.feedback, annotation.severity]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-3 w-3 text-destructive" />;
      case 'important': return <Star className="h-3 w-3 text-warning" />;
      case 'enhancement': return <CheckCircle className="h-3 w-3 text-success" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive border-destructive/20';
      case 'important': return 'bg-warning border-warning/20';
      case 'enhancement': return 'bg-success border-success/20';
      default: return 'bg-primary border-primary/20';
    }
  };

  const handleSave = () => {
    onUpdate(annotation.id, {
      title: editedTitle,
      feedback: editedFeedback,
      severity: editedSeverity
    });
    onStopEdit();
  };

  const handleCancel = () => {
    setEditedTitle(annotation.title);
    setEditedFeedback(annotation.feedback);
    setEditedSeverity(annotation.severity);
    onStopEdit();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Calculate new position as percentage
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      // Find the parent canvas container to calculate percentage
      const canvas = markerRef.current?.closest('.annotation-canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const newX = Math.max(2, Math.min(98, position.x + (deltaX / rect.width) * 100));
        const newY = Math.max(2, Math.min(98, position.y + (deltaY / rect.height) * 100));
        
        onMove(annotation.id, { x: newX, y: newY });
      }
    } else {
      // If minimal movement, treat as click
      onSelect(annotation.id);
    }
    
    setDragOffset({ x: 0, y: 0 });
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onStartEdit(annotation.id);
  };

  const currentX = position.x + (dragOffset.x / (markerRef.current?.closest('.annotation-canvas')?.getBoundingClientRect().width || 1000)) * 100;
  const currentY = position.y + (dragOffset.y / (markerRef.current?.closest('.annotation-canvas')?.getBoundingClientRect().height || 1000)) * 100;

  return (
    <>
      {/* Annotation Marker */}
      <div
        ref={markerRef}
        className={`absolute w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-20 ${
          isSelected 
            ? `${getSeverityColor(annotation.severity)} scale-125 ring-4 ring-blue-200 dark:ring-blue-800` 
            : `${getSeverityColor(annotation.severity)} hover:scale-110 hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-800`
        } ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'}`}
        style={{
          left: `${currentX}%`,
          top: `${currentY}%`
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {isDragging ? (
          <GripVertical className="text-white text-xs font-bold leading-none" />
        ) : (
          <span className="text-white text-xs font-bold leading-none">
            {index + 1}
          </span>
        )}
      </div>

      {/* Annotation Details (only show when selected) */}
      {isSelected && (
        <div
          className={`absolute z-30 ${
            currentX > 70 ? 'right-0' : 'left-0'
          } ${
            currentY > 70 ? 'bottom-0 mb-10' : 'top-0 mt-10'
          }`}
          style={{
            left: currentX <= 70 ? `${currentX}%` : 'auto',
            right: currentX > 70 ? `${100 - currentX}%` : 'auto',
            top: currentY <= 70 ? `${currentY}%` : 'auto',
            bottom: currentY > 70 ? `${100 - currentY}%` : 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="w-80 shadow-xl border-2">
            <CardContent className="p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getSeverityIcon(editedSeverity)}
                    <Badge variant="outline">{annotation.category}</Badge>
                    <select
                      value={editedSeverity}
                      onChange={(e) => setEditedSeverity(e.target.value)}
                      className="text-xs bg-background border rounded px-2 py-1"
                    >
                      <option value="critical">Critical</option>
                      <option value="important">Important</option>
                      <option value="enhancement">Enhancement</option>
                    </select>
                  </div>
                  
                  <Input
                    ref={titleInputRef}
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Annotation title..."
                    className="font-medium"
                  />
                  
                  <Textarea
                    value={editedFeedback}
                    onChange={(e) => setEditedFeedback(e.target.value)}
                    placeholder="Detailed feedback..."
                    className="min-h-[80px] text-sm resize-none"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="flex-1"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    {getSeverityIcon(annotation.severity)}
                    <Badge variant="outline">{annotation.category}</Badge>
                    <Badge variant={annotation.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {annotation.severity}
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-sm leading-tight">
                    {annotation.title}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {annotation.feedback}
                  </p>
                  
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStartEdit(annotation.id)}
                      className="text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelect('')}
                      className="text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};