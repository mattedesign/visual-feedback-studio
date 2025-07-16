import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  feedback_type?: string;
  description?: string;
  image_id?: string;
  confidence?: number;
  category?: 'usability' | 'visual_design' | 'accessibility' | 'content';
}

interface AnnotationsPanelProps {
  annotations: Annotation[];
  selectedAnnotation?: Annotation | null;
  onAnnotationSelect: (annotation: Annotation | null) => void;
  onAnnotationUpdate: (annotationId: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete: (annotationId: string) => void;
  onAnnotationCreate: (annotation: Omit<Annotation, 'id'>) => void;
  selectedImageId?: string;
}

export function AnnotationsPanel({
  annotations,
  selectedAnnotation,
  onAnnotationSelect,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationCreate,
  selectedImageId
}: AnnotationsPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAnnotation, setNewAnnotation] = useState({
    label: '',
    feedback_type: 'general',
    description: ''
  });

  // Filter annotations for current image
  const currentImageAnnotations = annotations.filter(
    annotation => annotation.image_id === selectedImageId
  );

  const handleCreateAnnotation = () => {
    if (!selectedImageId || !newAnnotation.label) return;
    
    onAnnotationCreate({
      x: 20, // Default position
      y: 20,
      width: 20,
      height: 15,
      label: newAnnotation.label,
      feedback_type: newAnnotation.feedback_type,
      description: newAnnotation.description,
      image_id: selectedImageId,
      category: 'usability'
    });

    setNewAnnotation({ label: '', feedback_type: 'general', description: '' });
    setIsCreating(false);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'usability': return <Target className="w-4 h-4" />;
      case 'visual_design': return <Eye className="w-4 h-4" />;
      case 'accessibility': return <EyeOff className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'usability': return 'destructive';
      case 'visual_design': return 'secondary';
      case 'accessibility': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-foreground">Annotations</h3>
            <p className="text-sm text-muted-foreground">
              {currentImageAnnotations.length} annotations on this image
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
            disabled={!selectedImageId}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Create New Annotation */}
          {isCreating && (
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">New Annotation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Annotation label"
                  value={newAnnotation.label}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, label: e.target.value }))}
                />
                <select
                  className="w-full p-2 border border-border rounded text-sm"
                  value={newAnnotation.feedback_type}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, feedback_type: e.target.value }))}
                >
                  <option value="general">General Feedback</option>
                  <option value="usability">Usability Issue</option>
                  <option value="accessibility">Accessibility</option>
                  <option value="visual">Visual Design</option>
                  <option value="content">Content</option>
                </select>
                <Textarea
                  placeholder="Description (optional)"
                  value={newAnnotation.description}
                  onChange={(e) => setNewAnnotation(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateAnnotation}>
                    Create
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Annotations */}
          {currentImageAnnotations.map((annotation) => (
            <Card 
              key={annotation.id}
              className={`cursor-pointer transition-colors ${
                selectedAnnotation?.id === annotation.id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onAnnotationSelect(
                selectedAnnotation?.id === annotation.id ? null : annotation
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(annotation.category)}
                    <CardTitle className="text-sm">{annotation.label}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(annotation.id);
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnnotationDelete(annotation.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {annotation.feedback_type && (
                  <Badge 
                    variant={getCategoryColor(annotation.category) as any}
                    className="text-xs"
                  >
                    {annotation.feedback_type}
                  </Badge>
                )}
                {annotation.description && (
                  <p className="text-xs text-muted-foreground">
                    {annotation.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  Position: {Math.round(annotation.x)}%, {Math.round(annotation.y)}% • 
                  Size: {Math.round(annotation.width)} × {Math.round(annotation.height)}
                  {annotation.confidence && (
                    <span className="ml-2">• {Math.round(annotation.confidence * 100)}% confidence</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {currentImageAnnotations.length === 0 && !isCreating && (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h4 className="font-medium text-foreground mb-2">No annotations yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedImageId 
                  ? "Click an image area or use the chat to create annotations"
                  : "Select an image to start annotating"
                }
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
