import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, Brain, Lightbulb, Target, TrendingUp } from 'lucide-react';
import { downloadFile, generateWireframeFilename } from '@/utils/downloadUtils';

interface MentorGuidanceCardProps {
  sessionId: string;
  persona: string;
  mentorGuidance: string | null;
  redesignHtml: string | null;
  className?: string;
}

export const MentorGuidanceCard: React.FC<MentorGuidanceCardProps> = ({
  sessionId,
  persona,
  mentorGuidance,
  redesignHtml,
  className = ""
}) => {
  if (!mentorGuidance && !redesignHtml) return null;

  const handleDownloadHtml = () => {
    if (redesignHtml) {
      const filename = generateWireframeFilename(sessionId);
      downloadFile(redesignHtml, filename, 'text/html');
    }
  };

  // Get persona-specific styling and icons
  const getPersonaConfig = (persona: string) => {
    const configs = {
      clarity: {
        bgColor: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
        textColor: 'text-green-800 dark:text-green-200',
        icon: Sparkles,
        title: '👾 Clarity Goblin Mentor',
        subtitle: 'Brutally honest but helpful'
      },
      strategic: {
        bgColor: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
        textColor: 'text-blue-800 dark:text-blue-200', 
        icon: Target,
        title: '🎯 Strategic UX Mentor',
        subtitle: 'Business-focused guidance'
      },
      mirror: {
        bgColor: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
        textColor: 'text-purple-800 dark:text-purple-200',
        icon: Brain,
        title: '🪞 Reflective UX Coach', 
        subtitle: 'Self-awareness and insights'
      },
      mad: {
        bgColor: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
        textColor: 'text-orange-800 dark:text-orange-200',
        icon: Lightbulb,
        title: '🧪 Mad UX Scientist',
        subtitle: 'Creative experimentation'
      },
      exec: {
        bgColor: 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800',
        textColor: 'text-gray-800 dark:text-gray-200',
        icon: TrendingUp,
        title: '💼 Executive UX Advisor',
        subtitle: 'ROI and business impact'
      }
    };

    return configs[persona] || configs.clarity;
  };

  const config = getPersonaConfig(persona);
  const IconComponent = config.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      {mentorGuidance && (
        <Card className={config.bgColor}>
          <CardHeader className="pb-3">
            <CardTitle className={`flex items-center gap-2 ${config.textColor}`}>
              <IconComponent className="h-5 w-5" />
              {config.title}
            </CardTitle>
            <p className={`text-sm ${config.textColor} opacity-80`}>
              {config.subtitle}
            </p>
          </CardHeader>
          <CardContent>
            <div className={`${config.textColor} leading-relaxed`}>
              <pre className="whitespace-pre-wrap font-sans">
                {mentorGuidance}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {redesignHtml && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>🎨 Mentor's Wireframe Suggestion</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadHtml}
                className="ml-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Download HTML
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden mb-4 bg-white">
              <iframe 
                title="Mentor Wireframe Preview"
                srcDoc={redesignHtml}
                className="w-full h-[400px] border-0"
                sandbox="allow-same-origin"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This wireframe reflects your mentor's specific recommendations. 
              Download and customize as needed for your project.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};