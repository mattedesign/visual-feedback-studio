import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Rocket } from 'lucide-react';
import { ParsedText } from '@/utils/textParsing';
import { useNavigation } from '@/contexts/NavigationContext';

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
  const { setTotalImages } = useNavigation();

  // Set total images count for navigation context
  useEffect(() => {
    const imageCount = results?.images?.length || 0;
    setTotalImages(imageCount);
  }, [results?.images, setTotalImages]);
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

  const renderPersonaSpecificContent = (personaData: any, personaType: string, fallbackSummary: string) => {
    // Handle different persona types with their specific fields
    const getPersonaContent = () => {
      switch(personaType) {
        case 'mirror':
          return (
            <>
              <div>
                <h4 className="font-semibold mb-3 text-purple-600">🔮 Empathetic Insights:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.insights || personaData?.analysis || fallbackSummary || 'Mirror is reflecting on the user experience...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">💭 User Experience Reflection:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.reflection || personaData?.goblinWisdom || 'Reflecting on the emotional journey through this interface...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-pink-600">❤️ Emotional Impact:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.emotionalImpact || personaData?.biggestGripe || 'Users may experience mixed emotions with this design...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-indigo-600">📖 User Story:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.userStory || personaData?.goblinPrediction || 'Every user has a story with this interface...'}
                  </ParsedText>
                </p>
              </div>
            </>
          );
          
        case 'mad':
          return (
            <>
              <div>
                <h4 className="font-semibold mb-3 text-red-600">🧪 Mad Science Hypothesis:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.hypothesis || personaData?.analysis || fallbackSummary || 'Mad scientist is formulating wild theories...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-orange-600">🔬 Mad Science Analysis:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.madScience || personaData?.goblinWisdom || 'Conducting wild experiments on UX patterns...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-yellow-600">🎭 Weird Findings:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.weirdFindings || personaData?.biggestGripe || 'Strange patterns detected in the interface wild...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-green-600">📝 Lab Notes:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.labNotes || personaData?.goblinPrediction || 'Mad scientist observations from the lab...'}
                  </ParsedText>
                </p>
              </div>
            </>
          );
          
        case 'strategic':
          return (
            <>
              <div>
                <h4 className="font-semibold mb-3 text-foreground">📊 Strategic Analysis:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.analysis || fallbackSummary || 'Strategic analysis in progress...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-emerald-600">💼 Business Impact:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.businessImpact || personaData?.biggestGripe || 'Assessing business implications of current UX...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">🎯 Strategic Priority:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.strategicPriority || personaData?.goblinWisdom || 'Identifying high-impact strategic priorities...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-purple-600">📈 Measurable Outcomes:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.measurableOutcomes || personaData?.goblinPrediction || 'Defining measurable success metrics...'}
                  </ParsedText>
                </p>
              </div>
            </>
          );
          
        case 'exec':
          return (
            <>
              <div>
                <h4 className="font-semibold mb-3 text-foreground">📋 Executive Summary:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.executiveSummary || personaData?.analysis || fallbackSummary || 'Executive analysis in progress...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-red-600">⚠️ Business Risks:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {Array.isArray(personaData?.businessRisks) ? personaData.businessRisks.join(', ') : 
                     personaData?.businessRisks || personaData?.biggestGripe || 'Identifying critical business risks...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-green-600">💰 ROI Impact:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.roiImpact || personaData?.goblinWisdom || 'Calculating return on investment implications...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">🏆 Competitive Implications:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.competitiveImplications || personaData?.goblinPrediction || 'Assessing competitive positioning impacts...'}
                  </ParsedText>
                </p>
              </div>
            </>
          );
          
        default: // clarity and fallback
          return (
            <>
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Analysis:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.analysis || fallbackSummary || 'Analysis completed - awaiting detailed feedback from the goblin...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-red-600">🤬 Biggest Gripe:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.biggestGripe || personaData?.wildCard || 'The goblin is still formulating their biggest complaint...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className={`font-semibold mb-3 ${colors.primary}`}>😈 What Actually Works:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.whatMakesGoblinHappy || 
                     (Array.isArray(personaData?.experiments) ? personaData.experiments.join(", ") : personaData?.experiments) || 
                     'The goblin is identifying what makes them happy...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className={`font-semibold mb-3 ${colors.primary}`}>💎 Goblin Wisdom:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.goblinWisdom || 'Goblin wisdom is being distilled...'}
                  </ParsedText>
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-blue-600">🔮 Goblin Prediction:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>
                    {personaData?.goblinPrediction || 'The goblin is peering into the future...'}
                  </ParsedText>
                </p>
              </div>
            </>
          );
      }
    };

    return getPersonaContent();
  };

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
                        <span className="text-foreground">
                          <ParsedText>{item}</ParsedText>
                        </span>
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
          {/* Dynamic persona-specific content rendering */}
          {renderPersonaSpecificContent(personaData, session?.persona_type, results?.synthesis_summary)}

        </CardContent>
      </Card>

          {/* Recommendations - Persona-specific rendering */}
      <Card className="border-0 shadow-sm bg-card">
        <CardHeader className="pb-4">
          <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${colors.primary}`}>
            {session?.persona_type === 'mad' ? '🧪 Crazy Experiments' :
             session?.persona_type === 'mirror' ? '💭 Empathy Reflections' :
             session?.persona_type === 'strategic' ? '📊 Strategic Recommendations' :
             session?.persona_type === 'exec' ? '💼 Executive Recommendations' :
             '🚀 Recommendations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Get the right recommendations field based on persona
            let recommendations = null;
            switch(session?.persona_type) {
              case 'mad':
                recommendations = personaData?.experiments || personaData?.crazyIdeas;
                break;
              case 'mirror':
                recommendations = personaData?.visualReflections || personaData?.empathyGaps;
                break;
              case 'strategic':
                recommendations = personaData?.recommendations;
                break;
              case 'exec':
                recommendations = personaData?.strategicRecommendations || personaData?.businessRisks;
                break;
              default:
                recommendations = personaData?.recommendations;
            }
            
            if (Array.isArray(recommendations) && recommendations.length > 0) {
              return (
                <ul className="space-y-3">
                  {recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className={`${colors.primary} mt-1 text-lg`}>•</span>
                      <span className="text-muted-foreground leading-relaxed">
                        <ParsedText>{rec}</ParsedText>
                      </span>
                    </li>
                  ))}
                </ul>
              );
            } else if (recommendations && typeof recommendations === 'string') {
              return (
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  <ParsedText>{recommendations}</ParsedText>
                </p>
              );
            } else {
              return (
                <p className="text-muted-foreground italic">
                  {session?.persona_type === 'mad' ? 'Mad scientist is brewing up wild experiments...' :
                   session?.persona_type === 'mirror' ? 'Mirror is reflecting on empathetic insights...' :
                   session?.persona_type === 'strategic' ? 'Strategic analyst is formulating recommendations...' :
                   session?.persona_type === 'exec' ? 'Executive perspective is being prepared...' :
                   'The goblin is crafting personalized recommendations...'}
                </p>
              );
            }
          })()}
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
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              <ParsedText>{results.synthesis_summary}</ParsedText>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SummaryView;