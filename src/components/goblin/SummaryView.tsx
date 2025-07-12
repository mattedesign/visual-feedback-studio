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
          primary: 'text-primary',
          bg: 'bg-warm-cream',
          border: 'border-warm-tan',
          badge: 'bg-warm-beige text-professional-brown'
        };
      case 'exec':
        return {
          primary: 'text-primary',
          bg: 'bg-warm-cream',
          border: 'border-warm-tan',
          badge: 'bg-warm-beige text-professional-brown'
        };
      case 'strategic':
        return {
          primary: 'text-primary',
          bg: 'bg-warm-cream',
          border: 'border-warm-tan',
          badge: 'bg-warm-beige text-professional-brown'
        };
      case 'mirror':
        return {
          primary: 'text-primary',
          bg: 'bg-warm-cream',
          border: 'border-warm-tan',
          badge: 'bg-warm-beige text-professional-brown'
        };
      case 'mad':
        return {
          primary: 'text-primary',
          bg: 'bg-warm-cream',
          border: 'border-warm-tan',
          badge: 'bg-warm-beige text-professional-brown'
        };
      default:
        return {
          primary: 'text-primary',
          bg: 'bg-warm-cream',
          border: 'border-warm-tan',
          badge: 'bg-warm-beige text-professional-brown'
        };
    }
  };

  const colors = getPersonaColors(session?.persona_type);

  const renderPersonaSpecificContent = (personaData: any, personaType: string, fallbackSummary: string) => {
    console.log('🎭 Rendering persona content:', { personaType, personaData });

    // Enhanced JSON parsing with better error handling
    let parsedData = personaData;
    if (typeof personaData === 'string') {
      try {
        // Try to extract JSON from markdown code blocks first
        const jsonMatch = personaData.match(/```json\s*\n?({[\s\S]*?})\s*\n?```/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[1]);
          console.log('✅ Successfully parsed JSON from markdown block');
        } else {
          // Try parsing the string directly
          parsedData = JSON.parse(personaData);
          console.log('✅ Successfully parsed JSON string');
        }
      } catch (e) {
        console.warn('⚠️ Failed to parse persona data as JSON:', e);
        parsedData = { analysis: personaData };
      }
    }

    // GUARANTEED FIX: Handle the JSON string analysis field for exec and mad personas
    if (personaType === 'exec') {
      console.log('🔄 Processing executive persona data structure');
      
      // THE ISSUE: analysis field is a JSON STRING, not object - parse it first
      if (parsedData?.analysis && typeof parsedData.analysis === 'string') {
        try {
          const analysisData = JSON.parse(parsedData.analysis);
          console.log('🎯 Successfully parsed JSON string analysis for exec:', analysisData);
          
          // Extract executive-specific fields to top level
          if (analysisData.executiveSummary) parsedData.executiveSummary = analysisData.executiveSummary;
          if (analysisData.businessRisks) parsedData.businessRisks = analysisData.businessRisks;
          if (analysisData.roiImpact) parsedData.roiImpact = analysisData.roiImpact;
          if (analysisData.stakeholderConcerns) parsedData.stakeholderConcerns = analysisData.stakeholderConcerns;
          if (analysisData.strategicRecommendations) parsedData.strategicRecommendations = analysisData.strategicRecommendations;
          if (analysisData.competitiveImplications) parsedData.competitiveImplications = analysisData.competitiveImplications;
        } catch (e) {
          console.error('❌ Failed to parse exec analysis JSON string:', e);
        }
      }
      // Fallback: if analysis is already an object
      else if (parsedData?.analysis && typeof parsedData.analysis === 'object') {
        const analysisData = parsedData.analysis;
        if (analysisData.executiveSummary) parsedData.executiveSummary = analysisData.executiveSummary;
        if (analysisData.businessRisks) parsedData.businessRisks = analysisData.businessRisks;
        if (analysisData.roiImpact) parsedData.roiImpact = analysisData.roiImpact;
        if (analysisData.stakeholderConcerns) parsedData.stakeholderConcerns = analysisData.stakeholderConcerns;
        if (analysisData.strategicRecommendations) parsedData.strategicRecommendations = analysisData.strategicRecommendations;
        if (analysisData.competitiveImplications) parsedData.competitiveImplications = analysisData.competitiveImplications;
      }
      
      console.log('✅ Executive persona data processed:', { 
        executiveSummary: !!parsedData.executiveSummary, 
        businessRisks: !!parsedData.businessRisks,
        roiImpact: !!parsedData.roiImpact 
      });
    }
    
    // GUARANTEED FIX: Handle the JSON string analysis field for mad persona
    if (personaType === 'mad') {
      console.log('🔄 Processing mad scientist persona data structure');
      
      // THE ISSUE: analysis field is a JSON STRING, not object - parse it first
      if (parsedData?.analysis && typeof parsedData.analysis === 'string') {
        try {
          const analysisData = JSON.parse(parsedData.analysis);
          console.log('🎯 Successfully parsed JSON string analysis for mad:', analysisData);
          
          // Extract mad scientist-specific fields to top level
          if (analysisData.hypothesis) parsedData.hypothesis = analysisData.hypothesis;
          if (analysisData.madScience) parsedData.madScience = analysisData.madScience;
          if (analysisData.weirdFindings) parsedData.weirdFindings = analysisData.weirdFindings;
          if (analysisData.crazyIdeas) parsedData.crazyIdeas = analysisData.crazyIdeas;
          if (analysisData.labNotes) parsedData.labNotes = analysisData.labNotes;
          if (analysisData.experiments) parsedData.experiments = analysisData.experiments;
        } catch (e) {
          console.error('❌ Failed to parse mad analysis JSON string:', e);
        }
      }
      // Fallback: if analysis is already an object
      else if (parsedData?.analysis && typeof parsedData.analysis === 'object') {
        const analysisData = parsedData.analysis;
        if (analysisData.hypothesis) parsedData.hypothesis = analysisData.hypothesis;
        if (analysisData.madScience) parsedData.madScience = analysisData.madScience;
        if (analysisData.weirdFindings) parsedData.weirdFindings = analysisData.weirdFindings;
        if (analysisData.crazyIdeas) parsedData.crazyIdeas = analysisData.crazyIdeas;
        if (analysisData.labNotes) parsedData.labNotes = analysisData.labNotes;
        if (analysisData.experiments) parsedData.experiments = analysisData.experiments;
      }
      
      console.log('✅ Mad scientist persona data processed:', { 
        hypothesis: !!parsedData.hypothesis, 
        experiments: !!parsedData.experiments,
        madScience: !!parsedData.madScience 
      });
    }

    // Convert any remaining objects to strings to prevent React rendering errors
    Object.keys(parsedData).forEach(key => {
      if (typeof parsedData[key] === 'object' && parsedData[key] !== null && !Array.isArray(parsedData[key])) {
        try {
          parsedData[key] = JSON.stringify(parsedData[key], null, 2);
        } catch (e) {
          parsedData[key] = String(parsedData[key]);
        }
      }
    });

    const getPersonaContent = () => {
      switch(personaType) {
        case 'mirror':
          return (
            <div className="space-y-6">
              {/* Insights */}
              {(parsedData?.insights || parsedData?.analysis || fallbackSummary) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🔍 Mirror Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.insights || parsedData?.analysis || fallbackSummary || 'Mirror is reflecting on the user experience...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Reflection */}
              {(parsedData?.reflection || parsedData?.goblinWisdom) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🪞 Reflection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed italic whitespace-pre-wrap">
                      {parsedData?.reflection || parsedData?.goblinWisdom || 'Reflecting on the emotional journey through this interface...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Visual Reflections */}
              {parsedData?.visualReflections && Array.isArray(parsedData.visualReflections) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      👁️ Visual Reflections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {parsedData.visualReflections.map((reflection: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-accent-warm mt-1 text-lg">✨</span>
                          <span className="text-muted-foreground leading-relaxed">{reflection}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Emotional Impact */}
              {(parsedData?.emotionalImpact || parsedData?.biggestGripe) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      💝 Emotional Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.emotionalImpact || parsedData?.biggestGripe || 'Users may experience mixed emotions with this design...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* User Story */}
              {(parsedData?.userStory || parsedData?.goblinPrediction) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      📖 User Story
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.userStory || parsedData?.goblinPrediction || 'Every user has a story with this interface...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Empathy Gaps */}
              {parsedData?.empathyGaps && Array.isArray(parsedData.empathyGaps) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      💔 Empathy Gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {parsedData.empathyGaps.map((gap: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-destructive mt-1 text-lg">⚠️</span>
                          <span className="text-muted-foreground leading-relaxed">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          );
          
        case 'mad':
          return (
            <div className="space-y-6">
              {/* Mad Science Hypothesis */}
              {(parsedData?.hypothesis || parsedData?.analysis || fallbackSummary) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🧪 Mad Science Hypothesis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.hypothesis || parsedData?.analysis || fallbackSummary || 'Mad scientist is formulating wild theories...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Crazy Experiments */}
              {parsedData?.experiments && Array.isArray(parsedData.experiments) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      ⚗️ Crazy Experiments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {parsedData.experiments.map((experiment: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-accent-warm mt-1 text-lg font-bold">{idx + 1}.</span>
                          <span className="text-muted-foreground leading-relaxed">{experiment}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Mad Science Insights */}
              {(parsedData?.madScience || parsedData?.goblinWisdom) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🔬 Mad Science Discovery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.madScience || parsedData?.goblinWisdom || 'Conducting wild experiments on UX patterns...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Weird Findings */}
              {(parsedData?.weirdFindings || parsedData?.biggestGripe) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🔍 Weird Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.weirdFindings || parsedData?.biggestGripe || 'Strange patterns detected in the interface...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Crazy Ideas */}
              {parsedData?.crazyIdeas && Array.isArray(parsedData.crazyIdeas) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      💡 Crazy Ideas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {parsedData.crazyIdeas.map((idea: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-accent-warm mt-1 text-lg">💥</span>
                          <span className="text-muted-foreground leading-relaxed">{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Lab Notes */}
              {(parsedData?.labNotes || parsedData?.goblinPrediction) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      📝 Lab Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed font-mono text-sm whitespace-pre-wrap">
                      {parsedData?.labNotes || parsedData?.goblinPrediction || 'Mad scientist observations from the lab...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Fallback for simple experiments string */}
              {!parsedData?.hypothesis && !parsedData?.experiments && !parsedData?.madScience && (parsedData?.experiments || parsedData?.crazyIdeas) && typeof (parsedData?.experiments || parsedData?.crazyIdeas) === 'string' && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🧪 Mad Experiments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.experiments || parsedData?.crazyIdeas}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          );
          
        case 'strategic':
          return (
            <div className="space-y-6">
              {/* Strategic Analysis */}
              {(parsedData?.analysis || fallbackSummary) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🎯 Strategic Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.analysis || fallbackSummary || 'Strategic analysis in progress...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Business Impact */}
              {(parsedData?.businessImpact || parsedData?.biggestGripe) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      💰 Business Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.businessImpact || parsedData?.biggestGripe || 'Assessing business implications of current UX...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Strategic Priority */}
              {(parsedData?.strategicPriority || parsedData?.goblinWisdom) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      ⭐ Strategic Priority
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.strategicPriority || parsedData?.goblinWisdom || 'Identifying high-impact strategic priorities...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Competitive Advantage */}
              {parsedData?.competitiveAdvantage && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🏆 Competitive Advantage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData.competitiveAdvantage}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Measurable Outcomes */}
              {(parsedData?.measurableOutcomes || parsedData?.goblinPrediction) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      📊 Measurable Outcomes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.measurableOutcomes || parsedData?.goblinPrediction || 'Defining measurable success metrics...'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          );
          
        case 'exec':
          return (
            <div className="space-y-6">
              {/* Executive Summary */}
              {(parsedData?.executiveSummary || parsedData?.analysis || fallbackSummary) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      💼 Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.executiveSummary || parsedData?.analysis || fallbackSummary || 'Executive analysis in progress...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Business Risks */}
              {(parsedData?.businessRisks || parsedData?.biggestGripe) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      ⚠️ Business Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(parsedData?.businessRisks) ? (
                      <ul className="space-y-3">
                        {parsedData.businessRisks.map((risk: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-destructive mt-1 text-lg">🚨</span>
                            <span className="text-muted-foreground leading-relaxed">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {parsedData?.businessRisks || parsedData?.biggestGripe || 'Identifying critical business risks...'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ROI Impact */}
              {(parsedData?.roiImpact || parsedData?.goblinWisdom) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      💰 ROI Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.roiImpact || parsedData?.goblinWisdom || 'Calculating return on investment implications...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stakeholder Concerns */}
              {(parsedData?.stakeholderConcerns || parsedData?.teamAlignment) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      👥 Stakeholder Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.stakeholderConcerns || parsedData?.teamAlignment || 'Identifying stakeholder alignment issues...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Strategic Recommendations */}
              {parsedData?.strategicRecommendations && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      📋 Strategic Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(parsedData.strategicRecommendations) ? (
                      <ol className="space-y-3">
                        {parsedData.strategicRecommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-accent-warm mt-1 text-lg font-bold">{idx + 1}.</span>
                            <span className="text-muted-foreground leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {parsedData.strategicRecommendations}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Competitive Implications */}
              {(parsedData?.competitiveImplications || parsedData?.goblinPrediction) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🏆 Competitive Implications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.competitiveImplications || parsedData?.goblinPrediction || 'Assessing competitive positioning impacts...'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          );
          
        default: // clarity and fallback
          return (
            <div className="space-y-6">
              {/* Analysis */}
              {(parsedData?.analysis || fallbackSummary) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      👾 Goblin Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.analysis || fallbackSummary || 'Analysis completed - awaiting detailed feedback from the goblin...'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Biggest Gripe */}
              {parsedData?.biggestGripe && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      😤 Biggest Gripe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                      {parsedData.biggestGripe}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* What Makes Goblin Happy */}
              {parsedData?.whatMakesGoblinHappy && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      😊 What Makes Goblin Happy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData.whatMakesGoblinHappy}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Goblin Wisdom */}
              {parsedData?.goblinWisdom && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🧠 Goblin Wisdom
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed italic whitespace-pre-wrap">
                      {parsedData.goblinWisdom}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Goblin Prediction */}
              {parsedData?.goblinPrediction && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🔮 Goblin Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData.goblinPrediction}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Fallback for simple string data */}
              {!parsedData?.analysis && !parsedData?.biggestGripe && (parsedData?.wildCard || parsedData?.experiments) && (
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-primary mb-0 flex items-center gap-2">
                      🔮 Goblin Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {parsedData?.wildCard || 
                       (Array.isArray(parsedData?.experiments) ? parsedData.experiments.join(", ") : parsedData?.experiments) || 
                       'The goblin is formulating insights...'}
                    </p>
                  </CardContent>
                </Card>
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
        color: 'text-primary',
        bgColor: 'bg-card',
        borderColor: 'border-border',
        items: matrix.whatWorks || []
      },
      {
        title: "What Needs Attention",
        icon: AlertTriangle,
        color: 'text-primary',
        bgColor: 'bg-card',
        borderColor: 'border-border',
        items: matrix.whatHurts || []
      },
      {
        title: "Next Steps",
        icon: Rocket,
        color: 'text-primary',
        bgColor: 'bg-card',
        borderColor: 'border-border',
        items: matrix.whatNext || []
      }
    ];

    return (
      <div className="grid gap-6 md:grid-cols-3">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          const items = Array.isArray(section.items) ? section.items : [];
          
          return (
            <Card key={idx} className={`${section.bgColor} ${section.borderColor} shadow-sm`}>
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
                        <span className="text-accent-warm mt-1">•</span>
                        <span className="text-muted-foreground">
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
    <div className="max-w-5xl mx-auto space-y-8 p-6 mobile-content-card">
      {/* Header with actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mobile-text-content">
            {session?.title || 'Goblin Analysis'}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <Badge variant="outline" className={`${colors.badge} mobile-badge`}>
              {session?.persona_type?.charAt(0).toUpperCase() + session?.persona_type?.slice(1) || 'Analysis'}
            </Badge>
            {results?.goblin_gripe_level && (
              <Badge variant="secondary" className={`${colors.badge} mobile-badge`}>
                {getGripeEmoji(results.goblin_gripe_level)} {results.goblin_gripe_level}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-3 mobile-button-group">
          <Button onClick={onCopyLink} variant="outline" className="border-border hover:bg-accent hover:text-accent-foreground">
            {copied ? '✅ Copied!' : 'Copy Link'}
          </Button>
          <Button onClick={onExport} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Export Results
          </Button>
        </div>
      </div>

      {/* Goblin Feedback Section - Always show if we have session data */}
      <Card className={`border-0 shadow-sm ${colors.bg} insights-card-mobile`}>
        <CardHeader className="pb-4">
          <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${colors.primary} mobile-text-content`}>
            {session?.persona_type === 'clarity' ? '👾 Goblin Feedback' :
             session?.persona_type === 'exec' ? '💼 Executive Analysis' :
             session?.persona_type === 'strategic' ? '🎯 Strategic Analysis' :
             session?.persona_type === 'mirror' ? '🪞 Mirror Insights' :
             session?.persona_type === 'mad' ? '🧪 Mad Science Results' :
             '👾 Analysis Results'}
            {results?.goblin_gripe_level && session?.persona_type === 'clarity' && (
              <Badge variant="outline" className="bg-green-100 text-green-700 mobile-badge">
                {getGripeEmoji(results.goblin_gripe_level)} {results.goblin_gripe_level}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 mobile-text-content">
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
             session?.persona_type === 'exec' ? '💼 Executive Action Items' :
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
                recommendations = personaData?.strategicRecommendations || personaData?.actionItems;
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
                   session?.persona_type === 'exec' ? 'Executive action items are being prioritized...' :
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