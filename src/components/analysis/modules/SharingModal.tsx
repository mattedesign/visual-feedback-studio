
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Mail, Share2, ExternalLink, Twitter, Linkedin } from 'lucide-react';

interface SharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  siteName: string;
}

export const SharingModal: React.FC<SharingModalProps> = ({
  isOpen,
  onClose,
  analysisId,
  siteName
}) => {
  const [shareableLink, setShareableLink] = useState<string>('');
  const [emailRecipients, setEmailRecipients] = useState<string>('');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const generateShareableLink = async () => {
    setIsGeneratingLink(true);
    try {
      // Simplified - just generate a basic link for now
      const link = `${window.location.origin}/analysis/${analysisId}`;
      setShareableLink(link);
      toast.success('Shareable link generated successfully!');
    } catch (error) {
      toast.error('Failed to generate shareable link');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareToSocial = (platform: 'twitter' | 'linkedin') => {
    const text = `Check out this professional UX analysis for ${siteName} - insights backed by 23+ research sources!`;
    const url = shareableLink || window.location.href;
    
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const sendEmail = () => {
    const subject = `UX Analysis Results for ${siteName}`;
    const body = `${emailMessage}\n\nView the analysis: ${shareableLink}`;
    const mailtoLink = `mailto:${emailRecipients}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    toast.success('Opening email client...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Analysis Results
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Generate Shareable Link */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Shareable Link</Label>
            <div className="flex gap-2">
              <Button
                onClick={generateShareableLink}
                disabled={isGeneratingLink}
                className="flex-shrink-0"
              >
                {isGeneratingLink ? 'Generating...' : 'Generate Link'}
              </Button>
              {shareableLink && (
                <>
                  <Input
                    value={shareableLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className="flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            {shareableLink && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Public access - no login required
                </Badge>
              </div>
            )}
          </div>

          {/* Email Sharing */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Email to Team</Label>
            <div className="space-y-2">
              <Input
                placeholder="recipient@company.com, team@company.com"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
              />
              <Textarea
                placeholder="Add a personal message (optional)"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={3}
              />
              <Button
                onClick={sendEmail}
                disabled={!emailRecipients || !shareableLink}
                className="w-full"
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Social Sharing</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => shareToSocial('linkedin')}
                disabled={!shareableLink}
                variant="outline"
                className="flex-1"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                onClick={() => shareToSocial('twitter')}
                disabled={!shareableLink}
                variant="outline"
                className="flex-1"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
            </div>
          </div>

          {/* Analytics Preview */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
            <h4 className="font-medium mb-2">Analytics & Tracking</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Track link views and engagement</li>
              <li>• Monitor team member access</li>
              <li>• Export sharing analytics</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
