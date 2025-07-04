// Phase 6: Collaborative Features - Multi-user Analysis Review
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  Share2, 
  Download, 
  Clock,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useAuth } from '@/hooks/useAuth';

interface CollaborationComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  status: 'pending' | 'resolved' | 'approved';
  annotationId?: string;
  replies?: CollaborationComment[];
}

interface CollaborationSession {
  id: string;
  analysisId: string;
  owner: string;
  collaborators: Array<{
    userId: string;
    userName: string;
    role: 'owner' | 'editor' | 'viewer';
    lastActive: Date;
  }>;
  comments: CollaborationComment[];
  version: number;
  status: 'active' | 'review' | 'completed';
}

interface CollaborativeAnalysisPanelProps {
  analysisId: string;
  analysisData: any;
  onCommentAdd?: (comment: CollaborationComment) => void;
  onStatusChange?: (status: string) => void;
}

export const CollaborativeAnalysisPanel: React.FC<CollaborativeAnalysisPanelProps> = ({
  analysisId,
  analysisData,
  onCommentAdd,
  onStatusChange
}) => {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [newComment, setNewComment] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const collaborativeEnabled = useFeatureFlag('collaborative-features');

  useEffect(() => {
    if (collaborativeEnabled && analysisId) {
      loadCollaborationSession();
    }
  }, [collaborativeEnabled, analysisId]);

  const loadCollaborationSession = async () => {
    try {
      // Mock collaboration session - in real implementation, this would fetch from backend
      const mockSession: CollaborationSession = {
        id: `collab-${analysisId}`,
        analysisId,
        owner: user?.id || 'current-user',
        collaborators: [
          {
            userId: user?.id || 'current-user',
            userName: user?.email || 'Current User',
            role: 'owner',
            lastActive: new Date()
          }
        ],
        comments: [
          {
            id: 'comment-1',
            userId: 'reviewer-1',
            userName: 'John Designer',
            userAvatar: '/avatars/john.jpg',
            content: 'The color contrast in the header section could be improved for better accessibility.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'pending',
            annotationId: 'annotation-1'
          },
          {
            id: 'comment-2',
            userId: 'reviewer-2',
            userName: 'Sarah UX',
            userAvatar: '/avatars/sarah.jpg',
            content: 'Great analysis on the navigation structure. This will definitely improve user flow.',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            status: 'approved'
          }
        ],
        version: 1,
        status: 'review'
      };
      
      setSession(mockSession);
    } catch (error) {
      console.error('Failed to load collaboration session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !session) return;

    const comment: CollaborationComment = {
      id: `comment-${Date.now()}`,
      userId: user?.id || 'current-user',
      userName: user?.email || 'Current User',
      content: newComment,
      timestamp: new Date(),
      status: 'pending'
    };

    setSession({
      ...session,
      comments: [...session.comments, comment]
    });

    setNewComment('');
    onCommentAdd?.(comment);
  };

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim() || !session) return;

    // Mock invite - in real implementation, this would send an invitation
    const newCollaborator = {
      userId: `user-${Date.now()}`,
      userName: inviteEmail,
      role: 'editor' as const,
      lastActive: new Date()
    };

    setSession({
      ...session,
      collaborators: [...session.collaborators, newCollaborator]
    });

    setInviteEmail('');
  };

  const handleStatusChange = (commentId: string, newStatus: 'pending' | 'resolved' | 'approved') => {
    if (!session) return;

    const updatedComments = session.comments.map(comment =>
      comment.id === commentId ? { ...comment, status: newStatus } : comment
    );

    setSession({
      ...session,
      comments: updatedComments
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Resolved</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  if (!collaborativeEnabled) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Collaborative features are not enabled.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-6">
      {/* Collaboration Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Collaborators */}
          <div>
            <h4 className="font-medium mb-3">Collaborators ({session.collaborators.length})</h4>
            <div className="space-y-2">
              {session.collaborators.map((collaborator) => (
                <div key={collaborator.userId} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`/avatars/${collaborator.userName.toLowerCase()}.jpg`} />
                      <AvatarFallback>
                        {collaborator.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{collaborator.userName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{collaborator.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {collaborator.lastActive.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Collaborator */}
          <div>
            <h4 className="font-medium mb-2">Invite Collaborator</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleInviteCollaborator} disabled={!inviteEmail.trim()}>
                Invite
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments & Discussion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Discussion ({session.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comment List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {session.comments.length > 0 ? (
              session.comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback>
                          {comment.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{comment.userName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {comment.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(comment.status)}
                      {getStatusBadge(comment.status)}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{comment.content}</p>
                  
                  {comment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(comment.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(comment.id, 'resolved')}
                      >
                        Resolve
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No comments yet. Start the discussion!
              </div>
            )}
          </div>

          {/* Add Comment */}
          <div className="pt-4 border-t">
            <Textarea
              placeholder="Add a comment or question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3"
              rows={3}
            />
            <div className="flex justify-end">
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};