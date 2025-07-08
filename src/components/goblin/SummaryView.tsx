import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Rocket } from 'lucide-react';

interface SummaryViewProps {
  results: any;
  session: any;
  personaData: any;
  onExport: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  results,
  session,
  personaData,
  onExport,
  onCopyLink,
  copied
}) => {
  const getGripeEmoji = (level: string) => {
    switch(level) {
      case 'low': return '😤';
      case 'medium': return '🤬';
      case 'rage-cranked': return '🌋';
      default: return '👾';
    }
  };

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

  const colors = getPersonaColors(session?.persona_type);

  const renderPriorityMatrix = (matrix: any) => {
    if (!matrix) return null;

    const sections = [
      {
        title: "What's Working",
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        items: matrix.whatWorks || []
      },
      {
        title: "What Needs Attention",
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        items: matrix.whatHurts || []
      },
      {
        title: "Next Steps",
        icon: Rocket,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        items: matrix.whatNext || []
      }
    ];

    return (
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          const items = Array.isArray(section.items) ? section.items : [];
          
          return (
            <Card key={idx} className={`${section.bgColor} ${section.borderColor}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-medium ${section.color} flex items-center gap-2`}>
                  <Icon className="w-4 h-4" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {items.length > 0 ? (
                  <ul className="space-y-2">
                    {items.map((item: string, itemIdx: number) => (
                      <li key={itemIdx} className="flex items-start gap-2 text-sm">
                        <span className={`${section.color} mt-1`}>•</span>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No items identified</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{session?.title || 'Goblin Analysis'}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={colors.badge}>{session?.persona_type}</Badge>
            {results?.goblin_gripe_level && (
              <Badge variant="secondary" className={colors.badge}>
                {getGripeEmoji(results.goblin_gripe_level)} {results.goblin_gripe_level}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCopyLink} variant="outline">
            {copied ? '✅ Copied!' : '📋 Share Analysis'}
          </Button>
          <Button onClick={onExport} variant="secondary">
            📥 Export Goblin Wisdom
          </Button>
        </div>
      </div>

      {/* Goblin Feedback Section */}
      {personaData?.analysis && (
        <Card className={colors.bg}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${colors.primary}`}>
              👾 Goblin Feedback
              {results?.goblin_gripe_level && (
                <Badge variant="outline" className={colors.badge}>
                  {getGripeEmoji(results.goblin_gripe_level)} {results.goblin_gripe_level}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Analysis:</h4>
              <p className="whitespace-pre-wrap">{personaData.analysis}</p>
            </div>
            
            {(personaData.biggestGripe || personaData.wildCard) && (
              <div>
                <h4 className="font-semibold mb-2 text-red-600">🤬 Biggest Gripe:</h4>
                <p className="whitespace-pre-wrap">{personaData.biggestGripe || personaData.wildCard || 'No specific gripes identified'}</p>
              </div>
            )}
            
            {(personaData.whatMakesGoblinHappy || personaData.experiments) && (
              <div>
                <h4 className={`font-semibold mb-2 ${colors.primary}`}>😈 What Actually Works:</h4>
                <p className="whitespace-pre-wrap">
                  {personaData.whatMakesGoblinHappy || 
                   (Array.isArray(personaData.experiments) ? personaData.experiments.join(", ") : personaData.experiments) || 
                   'Effective approaches identified'}
                </p>
              </div>
            )}
            
            {personaData.goblinWisdom && (
              <div>
                <h4 className={`font-semibold mb-2 ${colors.primary}`}>💎 Goblin Wisdom:</h4>
                <p className="whitespace-pre-wrap">{personaData.goblinWisdom}</p>
              </div>
            )}
            
            {personaData.goblinPrediction && (
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">🔮 Goblin Prediction:</h4>
                <p className="whitespace-pre-wrap">{personaData.goblinPrediction}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {(personaData?.recommendations || (Array.isArray(personaData?.recommendations) && personaData.recommendations.length > 0)) && (
        <Card className={colors.bg}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${colors.primary}`}>
              🚀 Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(personaData.recommendations) ? (
              <ul className="space-y-2">
                {personaData.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className={`${colors.primary} mt-1`}>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="whitespace-pre-wrap">{personaData.recommendations}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Priority Matrix */}
      {results?.priority_matrix && (
        <Card>
          <CardHeader>
            <CardTitle className={colors.primary}>🎯 Priority Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPriorityMatrix(results.priority_matrix)}
          </CardContent>
        </Card>
      )}

      {/* Synthesis Summary */}
      {results?.synthesis_summary && (
        <Card className={colors.bg}>
          <CardHeader>
            <CardTitle className={colors.primary}>📋 Synthesis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{results.synthesis_summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SummaryView;