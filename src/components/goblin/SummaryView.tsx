import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Rocket } from 'lucide-react';
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
    console.log('🎭 Rendering persona content:', { personaType, personaData });

    // Parse JSON if it's a string - handles markdown code blocks and raw JSON
    let parsedData = personaData;
    if (typeof personaData === 'string') {
      try {
        // Try to extract JSON from markdown code blocks first
        const jsonMatch = personaData.match(/```json\s*\n?({[\s\S]*?})\s*\n?```/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          // Try parsing the string directly
          parsedData = JSON.parse(personaData);
        }
      } catch (e) {
        console.warn('Failed to parse persona data as JSON:', e);
        parsedData = { analysis: personaData };
      }
    }

    // Handle different persona types with their specific fields
    const getPersonaContent = () => {
      switch(personaType) {
        case 'mirror':
          return (
            <div className="space-y-6">
              {/* Insights */}
              {(parsedData?.insights || parsedData?.analysis || fallbackSummary) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    🔍 Mirror Insights
                  </h4>
                  <p className="text-blue-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.insights || parsedData?.analysis || fallbackSummary || 'Mirror is reflecting on the user experience...'}
                  </p>
                </div>
              )}

              {/* Reflection */}
              {(parsedData?.reflection || parsedData?.goblinWisdom) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    🪞 Reflection
                  </h4>
                  <p className="text-purple-700 leading-relaxed italic whitespace-pre-wrap">
                    {parsedData?.reflection || parsedData?.goblinWisdom || 'Reflecting on the emotional journey through this interface...'}
                  </p>
                </div>
              )}

              {/* Visual Reflections */}
              {parsedData?.visualReflections && Array.isArray(parsedData.visualReflections) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    👁️ Visual Reflections
                  </h4>
                  <ul className="space-y-2">
                    {parsedData.visualReflections.map((reflection: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-600 mt-1">✨</span>
                        <span className="text-green-700 leading-relaxed">{reflection}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Emotional Impact */}
              {(parsedData?.emotionalImpact || parsedData?.biggestGripe) && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-pink-800 mb-3 flex items-center gap-2">
                    💝 Emotional Impact
                  </h4>
                  <p className="text-pink-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.emotionalImpact || parsedData?.biggestGripe || 'Users may experience mixed emotions with this design...'}
                  </p>
                </div>
              )}

              {/* User Story */}
              {(parsedData?.userStory || parsedData?.goblinPrediction) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    📖 User Story
                  </h4>
                  <p className="text-orange-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.userStory || parsedData?.goblinPrediction || 'Every user has a story with this interface...'}
                  </p>
                </div>
              )}

              {/* Empathy Gaps */}
              {parsedData?.empathyGaps && Array.isArray(parsedData.empathyGaps) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                    💔 Empathy Gaps
                  </h4>
                  <ul className="space-y-2">
                    {parsedData.empathyGaps.map((gap: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-red-600 mt-1">⚠️</span>
                        <span className="text-red-700 leading-relaxed">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
          
        case 'mad':
          return (
            <div className="space-y-6">
              {/* Mad Science Hypothesis */}
              {(parsedData?.hypothesis || parsedData?.analysis || fallbackSummary) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    🧪 Mad Science Hypothesis
                  </h4>
                  <p className="text-purple-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.hypothesis || parsedData?.analysis || fallbackSummary || 'Mad scientist is formulating wild theories...'}
                  </p>
                </div>
              )}

              {/* Crazy Experiments */}
              {parsedData?.experiments && Array.isArray(parsedData.experiments) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    ⚗️ Crazy Experiments
                  </h4>
                  <ul className="space-y-2">
                    {parsedData.experiments.map((experiment: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-blue-600 mt-1 text-lg font-bold">{idx + 1}.</span>
                        <span className="text-blue-700 leading-relaxed">{experiment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mad Science Insights */}
              {(parsedData?.madScience || parsedData?.goblinWisdom) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    🔬 Mad Science Discovery
                  </h4>
                  <p className="text-green-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.madScience || parsedData?.goblinWisdom || 'Conducting wild experiments on UX patterns...'}
                  </p>
                </div>
              )}

              {/* Weird Findings */}
              {(parsedData?.weirdFindings || parsedData?.biggestGripe) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    🔍 Weird Findings
                  </h4>
                  <p className="text-orange-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.weirdFindings || parsedData?.biggestGripe || 'Strange patterns detected in the interface...'}
                  </p>
                </div>
              )}

              {/* Crazy Ideas */}
              {parsedData?.crazyIdeas && Array.isArray(parsedData.crazyIdeas) && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-pink-800 mb-3 flex items-center gap-2">
                    💡 Crazy Ideas
                  </h4>
                  <ul className="space-y-2">
                    {parsedData.crazyIdeas.map((idea: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-pink-600 mt-1">💥</span>
                        <span className="text-pink-700 leading-relaxed">{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Lab Notes */}
              {(parsedData?.labNotes || parsedData?.goblinPrediction) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    📝 Lab Notes
                  </h4>
                  <p className="text-gray-700 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                    {parsedData?.labNotes || parsedData?.goblinPrediction || 'Mad scientist observations from the lab...'}
                  </p>
                </div>
              )}

              {/* Fallback for simple experiments string */}
              {!parsedData?.hypothesis && !parsedData?.experiments && !parsedData?.madScience && (parsedData?.experiments || parsedData?.crazyIdeas) && typeof (parsedData?.experiments || parsedData?.crazyIdeas) === 'string' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    🧪 Mad Experiments
                  </h4>
                  <p className="text-purple-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.experiments || parsedData?.crazyIdeas}
                  </p>
                </div>
              )}
            </div>
          );
          
        case 'strategic':
          return (
            <div className="space-y-6">
              {/* Strategic Analysis */}
              {(parsedData?.analysis || fallbackSummary) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    🎯 Strategic Analysis
                  </h4>
                  <p className="text-blue-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.analysis || fallbackSummary || 'Strategic analysis in progress...'}
                  </p>
                </div>
              )}

              {/* Business Impact */}
              {(parsedData?.businessImpact || parsedData?.biggestGripe) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    💰 Business Impact
                  </h4>
                  <p className="text-green-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.businessImpact || parsedData?.biggestGripe || 'Assessing business implications of current UX...'}
                  </p>
                </div>
              )}

              {/* Strategic Priority */}
              {(parsedData?.strategicPriority || parsedData?.goblinWisdom) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    ⭐ Strategic Priority
                  </h4>
                  <p className="text-orange-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.strategicPriority || parsedData?.goblinWisdom || 'Identifying high-impact strategic priorities...'}
                  </p>
                </div>
              )}

              {/* Competitive Advantage */}
              {parsedData?.competitiveAdvantage && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    🏆 Competitive Advantage
                  </h4>
                  <p className="text-purple-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData.competitiveAdvantage}
                  </p>
                </div>
              )}

              {/* Measurable Outcomes */}
              {(parsedData?.measurableOutcomes || parsedData?.goblinPrediction) && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                    📊 Measurable Outcomes
                  </h4>
                  <p className="text-indigo-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.measurableOutcomes || parsedData?.goblinPrediction || 'Defining measurable success metrics...'}
                  </p>
                </div>
              )}
            </div>
          );
          
        case 'exec':
          return (
            <div className="space-y-6">
              {/* Executive Summary */}
              {(parsedData?.executiveSummary || parsedData?.analysis || fallbackSummary) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    💼 Executive Summary
                  </h4>
                  <p className="text-blue-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.executiveSummary || parsedData?.analysis || fallbackSummary || 'Executive analysis in progress...'}
                  </p>
                </div>
              )}

              {/* Business Risks */}
              {(parsedData?.businessRisks || parsedData?.biggestGripe) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                    ⚠️ Business Risks
                  </h4>
                  {Array.isArray(parsedData?.businessRisks) ? (
                    <ul className="space-y-2">
                      {parsedData.businessRisks.map((risk: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-red-600 mt-1">🚨</span>
                          <span className="text-red-700 leading-relaxed">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-700 leading-relaxed whitespace-pre-wrap">
                      {parsedData?.businessRisks || parsedData?.biggestGripe || 'Identifying critical business risks...'}
                    </p>
                  )}
                </div>
              )}

              {/* ROI Impact */}
              {(parsedData?.roiImpact || parsedData?.goblinWisdom) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    💰 ROI Impact
                  </h4>
                  <p className="text-green-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.roiImpact || parsedData?.goblinWisdom || 'Calculating return on investment implications...'}
                  </p>
                </div>
              )}

              {/* Stakeholder Concerns */}
              {parsedData?.stakeholderConcerns && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    👥 Stakeholder Concerns
                  </h4>
                  <p className="text-orange-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData.stakeholderConcerns}
                  </p>
                </div>
              )}

              {/* Strategic Recommendations */}
              {parsedData?.strategicRecommendations && Array.isArray(parsedData.strategicRecommendations) && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    📋 Strategic Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {parsedData.strategicRecommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-purple-600 mt-1 font-bold">{idx + 1}.</span>
                        <span className="text-purple-700 leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Competitive Implications */}
              {(parsedData?.competitiveImplications || parsedData?.goblinPrediction) && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                    🏆 Competitive Implications
                  </h4>
                  <p className="text-indigo-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.competitiveImplications || parsedData?.goblinPrediction || 'Assessing competitive positioning impacts...'}
                  </p>
                </div>
              )}
            </div>
          );
          
        default: // clarity and fallback
          return (
            <div className="space-y-6">
              {/* Analysis */}
              {(parsedData?.analysis || fallbackSummary) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    👾 Goblin Analysis
                  </h4>
                  <p className="text-green-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.analysis || fallbackSummary || 'Analysis completed - awaiting detailed feedback from the goblin...'}
                  </p>
                </div>
              )}

              {/* Biggest Gripe */}
              {parsedData?.biggestGripe && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                    😤 Biggest Gripe
                  </h4>
                  <p className="text-red-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {parsedData.biggestGripe}
                  </p>
                </div>
              )}

              {/* What Makes Goblin Happy */}
              {parsedData?.whatMakesGoblinHappy && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    😊 What Makes Goblin Happy
                  </h4>
                  <p className="text-green-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData.whatMakesGoblinHappy}
                  </p>
                </div>
              )}

              {/* Goblin Wisdom */}
              {parsedData?.goblinWisdom && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    🧠 Goblin Wisdom
                  </h4>
                  <p className="text-blue-700 leading-relaxed italic whitespace-pre-wrap">
                    {parsedData.goblinWisdom}
                  </p>
                </div>
              )}

              {/* Goblin Prediction */}
              {parsedData?.goblinPrediction && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    🔮 Goblin Prediction
                  </h4>
                  <p className="text-purple-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData.goblinPrediction}
                  </p>
                </div>
              )}

              {/* Fallback for simple string data */}
              {!parsedData?.analysis && !parsedData?.biggestGripe && (parsedData?.wildCard || parsedData?.experiments) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    🔮 Goblin Insights
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {parsedData?.wildCard || 
                     (Array.isArray(parsedData?.experiments) ? parsedData.experiments.join(", ") : parsedData?.experiments) || 
                     'The goblin is formulating insights...'}
                  </p>
                </div>
              )}
            </div>
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
                          {item}
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
                         {rec}
                       </span>
                    </li>
                  ))}
                </ul>
              );
            } else if (recommendations && typeof recommendations === 'string') {
              return (
                 <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                   {recommendations}
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
               {results.synthesis_summary}
             </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SummaryView;