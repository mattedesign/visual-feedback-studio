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
  chatFeedbackAnchors?: {[messageId: string]: any[]};
}

const SummaryView: React.FC<SummaryViewProps> = ({
  results,
  session,
  personaData,
  onExport,
  onCopyLink,
  copied,
  chatFeedbackAnchors = {}
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
          primary: 'text-professional-brown',
          bg: 'bg-card',
          border: 'border-border',
          badge: 'bg-accent-warm text-professional-brown'
        };
      default:
        return {
          primary: 'text-professional-brown',
          bg: 'bg-card',
          border: 'border-border',
          badge: 'bg-accent-warm text-professional-brown'
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
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 border-emerald-200',
        borderColor: 'border-emerald-200',
        items: matrix.whatWorks || []
      },
      {
        title: "What Needs Attention",
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
        borderColor: 'border-amber-200',
        items: matrix.whatHurts || []
      },
      {
        title: "Next Steps",
        icon: Rocket,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        borderColor: 'border-blue-200',
        items: matrix.whatNext || []
      }
    ];

    return (
      <div className="grid gap-6 md:grid-cols-3">{sections.map((section, idx) => {
          const Icon = section.icon;
          const items = Array.isArray(section.items) ? section.items : [];
          
          return (
            <Card key={idx} className={`${section.bgColor} border-0 shadow-sm`}>
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
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">{session?.title || 'Goblin Analysis'}</h2>
          <div className="flex items-center gap-3 mt-3">
            <Badge variant="outline" className={colors.badge}>{session?.persona_type}</Badge>
            {results?.goblin_gripe_level && (
              <Badge variant="secondary" className={colors.badge}>
                {getGripeEmoji(results.goblin_gripe_level)} {results.goblin_gripe_level}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={onCopyLink} variant="outline" className="border-border hover:bg-accent">
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button onClick={onExport} className="bg-professional-brown hover:bg-professional-brown/90">
            Export Results
          </Button>
        </div>
      </div>

      {/* Goblin Feedback Section - Always show if we have session data */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader className="pb-4">
          <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${colors.primary}`}>
            👾 Goblin Feedback
            {results?.goblin_gripe_level && (
              <Badge variant="outline" className={colors.badge}>
                {getGripeEmoji(results.goblin_gripe_level)} {results.goblin_gripe_level}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Analysis:</h4>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {personaData?.analysis || results?.synthesis_summary || 'Analysis completed - awaiting detailed feedback from the goblin...'}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-red-600">🤬 Biggest Gripe:</h4>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {personaData?.biggestGripe || personaData?.wildCard || 'The goblin is still formulating their biggest complaint...'}
            </p>
          </div>
          
          <div>
            <h4 className={`font-semibold mb-3 ${colors.primary}`}>😈 What Actually Works:</h4>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {personaData?.whatMakesGoblinHappy || 
               (Array.isArray(personaData?.experiments) ? personaData.experiments.join(", ") : personaData?.experiments) || 
               'The goblin is identifying what makes them happy...'}
            </p>
          </div>

          {/* Strategic persona specific fields */}
          {personaData?.businessImpact && (
            <div>
              <h4 className="font-semibold mb-3 text-emerald-600">💼 Business Impact:</h4>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {personaData.businessImpact}
              </p>
            </div>
          )}

          {personaData?.implementation && (
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">⚙️ Implementation Strategy:</h4>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {personaData.implementation}
              </p>
            </div>
          )}

          {personaData?.visualStrategy && Array.isArray(personaData.visualStrategy) && personaData.visualStrategy.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-purple-600">🎨 Visual Strategy:</h4>
              <ul className="space-y-2">
                {personaData.visualStrategy.map((strategy: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-purple-600 mt-1">•</span>
                    <span className="text-muted-foreground">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {personaData?.competitiveVisualEdge && Array.isArray(personaData.competitiveVisualEdge) && personaData.competitiveVisualEdge.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-orange-600">🏆 Competitive Visual Edge:</h4>
              <ul className="space-y-2">
                {personaData.competitiveVisualEdge.map((edge: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-600 mt-1">•</span>
                    <span className="text-muted-foreground">{edge}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h4 className={`font-semibold mb-3 ${colors.primary}`}>💎 Goblin Wisdom:</h4>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {personaData?.goblinWisdom || 'Goblin wisdom is being distilled...'}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-blue-600">🔮 Goblin Prediction:</h4>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {personaData?.goblinPrediction || 'The goblin is peering into the future...'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations - Always show */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader className="pb-4">
          <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${colors.primary}`}>
            🚀 Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(personaData?.recommendations) && personaData.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {personaData.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className={`${colors.primary} mt-1 text-lg`}>•</span>
                  <span className="text-muted-foreground leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          ) : personaData?.recommendations && typeof personaData.recommendations === 'string' ? (
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{personaData.recommendations}</p>
          ) : (
            <p className="text-muted-foreground italic">The goblin is crafting personalized recommendations...</p>
          )}
        </CardContent>
      </Card>

      {/* Priority Matrix */}
      {results?.priority_matrix && (
        <Card className="border-0 shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className={`text-xl font-semibold ${colors.primary}`}>🎯 Priority Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPriorityMatrix(results.priority_matrix)}
          </CardContent>
        </Card>
      )}

      {/* Synthesis Summary */}
      {results?.synthesis_summary && (
        <Card className="border-0 shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className={`text-xl font-semibold ${colors.primary}`}>📋 Synthesis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{results.synthesis_summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SummaryView;