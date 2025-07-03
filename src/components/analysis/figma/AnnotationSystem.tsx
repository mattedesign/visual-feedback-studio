import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Plus, 
  Target, 
  Eye, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  X
} from 'lucide-react';

interface Annotation {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  category: 'ux' | 'visual' | 'accessibility' | 'performance' | 'content';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  comments: Comment[];
  createdAt: Date;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

interface AnnotationSystemProps {
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  onAnnotationSelect: (annotation: Annotation | null) => void;
  onAnnotationCreate: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
  pendingPosition: { x: number; y: number } | null;
  onCancelPending: () => void;
}

const categoryIcons = {
  ux: Target,
  visual: Eye,
  accessibility: CheckCircle,
  performance: Zap,
  content: MessageSquare
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
};

export const AnnotationSystem: React.FC<AnnotationSystemProps> = ({
  annotations,
  selectedAnnotation,
  onAnnotationSelect,
  onAnnotationCreate,
  onAnnotationUpdate,
  pendingPosition,
  onCancelPending
}) => {
  const [newAnnotation, setNewAnnotation] = useState<Partial<Annotation>>({
    title: '',
    description: '',
    category: 'ux',
    priority: 'medium',
    status: 'open',
    comments: []
  });
  const [newComment, setNewComment] = useState('');

  const handleCreateAnnotation = () => {
    if (!pendingPosition || !newAnnotation.title) return;

    onAnnotationCreate({
      ...newAnnotation as Omit<Annotation, 'id' | 'createdAt'>,
      x: pendingPosition.x,
      y: pendingPosition.y,
    });

    setNewAnnotation({
      title: '',
      description: '',
      category: 'ux',
      priority: 'medium',
      status: 'open',
      comments: []
    });
    onCancelPending();
  };

  const handleAddComment = () => {
    if (!selectedAnnotation || !newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      author: 'Current User',
      createdAt: new Date()
    };

    onAnnotationUpdate(selectedAnnotation.id, {
      comments: [...selectedAnnotation.comments, comment]
    });

    setNewComment('');
  };

  return (
    <div className="w-80 border-l border-border bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Annotations
          <Badge variant="secondary" className="text-xs">
            {annotations.length}
          </Badge>
        </h3>
      </div>

      {/* Create New Annotation */}
      {pendingPosition && (
        <div className="p-4 border-b border-border bg-muted/20">
          <h4 className="font-medium mb-3 text-sm">Add Annotation</h4>
          <div className="space-y-3">
            <Input
              placeholder="Annotation title"
              value={newAnnotation.title}
              onChange={(e) => setNewAnnotation(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Describe the issue or suggestion..."
              value={newAnnotation.description}
              onChange={(e) => setNewAnnotation(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                value={newAnnotation.category}
                onChange={(e) => setNewAnnotation(prev => ({ 
                  ...prev, 
                  category: e.target.value as Annotation['category'] 
                }))}
              >
                <option value="ux">UX Issue</option>
                <option value="visual">Visual Design</option>
                <option value="accessibility">Accessibility</option>
                <option value="performance">Performance</option>
                <option value="content">Content</option>
              </select>
              <select
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                value={newAnnotation.priority}
                onChange={(e) => setNewAnnotation(prev => ({ 
                  ...prev, 
                  priority: e.target.value as Annotation['priority'] 
                }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateAnnotation} disabled={!newAnnotation.title}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelPending}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Annotation Details */}
      {selectedAnnotation && (
        <div className="p-4 border-b border-border">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-medium">{selectedAnnotation.title}</h4>
              <Button variant="ghost" size="sm" onClick={() => onAnnotationSelect(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {selectedAnnotation.description}
            </p>

            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {selectedAnnotation.category}
              </Badge>
              <Badge variant="outline" className={`text-xs ${priorityColors[selectedAnnotation.priority]}`}>
                {selectedAnnotation.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectedAnnotation.status}
              </Badge>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Comments ({selectedAnnotation.comments.length})</h5>
              
              {selectedAnnotation.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 text-sm">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {comment.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-xs">{comment.text}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {comment.author} • {comment.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add Comment */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  className="text-sm"
                />
                <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Annotations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {annotations.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No annotations yet</p>
              <p className="text-xs">Click on the canvas to add one</p>
            </div>
          ) : (
            annotations.map((annotation, index) => {
              const CategoryIcon = categoryIcons[annotation.category];
              return (
                <Card 
                  key={annotation.id}
                  className={`cursor-pointer transition-colors ${
                    selectedAnnotation?.id === annotation.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onAnnotationSelect(annotation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-primary rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{annotation.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {annotation.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <CategoryIcon className="w-3 h-3" />
                          <Badge variant="outline" className={`text-xs ${priorityColors[annotation.priority]}`}>
                            {annotation.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};