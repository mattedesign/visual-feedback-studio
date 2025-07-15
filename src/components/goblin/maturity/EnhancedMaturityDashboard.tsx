import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  BookOpen, 
  Zap, 
  Shield, 
  Component,
  Gauge,
  Sparkles,
  Award,
  Calendar,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MaturityScoreService } from "@/services/goblin/maturityScoreService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface MaturityData {
  overall_score: number;
  percentile_rank: number;
  maturity_level: string;
  streak_days: number;
  accessibility_score: number;
  clarity_score: number;
  performance_score: number;
  usability_score: number;
  delight_score: number;
  previous_score: number;
  created_at: string;
}

interface StrengthPattern {
  dimension: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  insights: string[];
}

interface ImprovementPattern {
  dimension: string;
  currentScore: number;
  targetScore: number;
  priority: 'high' | 'medium' | 'low';
  recommendations: string[];
  estimatedImpact: number;
}

const MATURITY_LEVELS = [
  { name: 'Novice', minScore: 0, maxScore: 40, color: 'text-red-600', badge: '🌱' },
  { name: 'Developing', minScore: 41, maxScore: 60, color: 'text-orange-600', badge: '🌿' },
  { name: 'Proficient', minScore: 61, maxScore: 80, color: 'text-blue-600', badge: '🌳' },
  { name: 'Advanced', minScore: 81, maxScore: 95, color: 'text-purple-600', badge: '🏆' },
  { name: 'Expert', minScore: 96, maxScore: 100, color: 'text-green-600', badge: '🎯' }
];

export function EnhancedMaturityDashboard() {
  const { user } = useAuth();
  const [maturityData, setMaturityData] = useState<MaturityData | null>(null);
  const [strengthPatterns, setStrengthPatterns] = useState<StrengthPattern[]>([]);
  const [improvementPatterns, setImprovementPatterns] = useState<ImprovementPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadMaturityData();
    }
  }, [user]);

  const loadMaturityData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load current maturity score
      const { data: scoreData, error: scoreError } = await supabase
        .from('goblin_maturity_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (scoreError && scoreError.code !== 'PGRST116') {
        console.error('Error loading maturity data:', scoreError);
        return;
      }

      if (scoreData) {
        // Calculate percentile
        const percentileRank = await MaturityScoreService.calculatePercentile(
          user.id,
          scoreData.overall_score
        );

        setMaturityData({
          ...scoreData,
          percentile_rank: percentileRank
        });

        // Generate insights based on scores
        generateInsights(scoreData);
      }
    } catch (error) {
      console.error('Error loading maturity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = (data: any) => {
    const dimensions = [
      { name: 'accessibility', score: data.accessibility_score || 0 },
      { name: 'clarity', score: data.clarity_score || 0 },
      { name: 'performance', score: data.performance_score || 0 },
      { name: 'usability', score: data.usability_score || 0 },
      { name: 'delight', score: data.delight_score || 0 }
    ];

    // Identify strengths (scores >= 75)
    const strengths: StrengthPattern[] = dimensions
      .filter(d => d.score >= 75)
      .map(d => ({
        dimension: d.name,
        score: d.score,
        trend: 'stable' as const,
        insights: getStrengthInsights(d.name, d.score)
      }));

    // Identify improvement areas (scores < 65)
    const improvements: ImprovementPattern[] = dimensions
      .filter(d => d.score < 65)
      .map(d => ({
        dimension: d.name,
        currentScore: d.score,
        targetScore: Math.min(d.score + 20, 85),
        priority: d.score < 40 ? 'high' : d.score < 55 ? 'medium' : 'low',
        recommendations: getImprovementRecommendations(d.name, d.score),
        estimatedImpact: Math.round((Math.min(d.score + 20, 85) - d.score) * 0.2)
      }));

    setStrengthPatterns(strengths);
    setImprovementPatterns(improvements);
  };

  const getStrengthInsights = (dimension: string, score: number): string[] => {
    const insights: Record<string, string[]> = {
      accessibility: [
        "Strong foundation in inclusive design principles",
        "Consistent use of semantic HTML and ARIA labels",
        "Good color contrast and keyboard navigation"
      ],
      clarity: [
        "Clear information architecture and navigation",
        "Effective use of visual hierarchy",
        "Well-structured content and labeling"
      ],
      performance: [
        "Optimized loading times and interactions",
        "Efficient use of resources and assets",
        "Smooth user experience across devices"
      ],
      usability: [
        "Intuitive user flows and interactions",
        "Consistent design patterns and behaviors",
        "Effective error prevention and handling"
      ],
      delight: [
        "Engaging visual design and interactions",
        "Thoughtful micro-interactions and animations",
        "Emotional connection with users"
      ]
    };

    return insights[dimension] || ["Strong performance in this area"];
  };

  const getImprovementRecommendations = (dimension: string, score: number): string[] => {
    const recommendations: Record<string, string[]> = {
      accessibility: [
        "Implement proper heading hierarchy (h1-h6)",
        "Add alt text to all images and icons",
        "Ensure minimum 4.5:1 color contrast ratio",
        "Test with screen readers and keyboard navigation"
      ],
      clarity: [
        "Simplify navigation structure and labeling",
        "Improve visual hierarchy with typography and spacing",
        "Add clear call-to-action buttons",
        "Reduce cognitive load in complex interfaces"
      ],
      performance: [
        "Optimize image sizes and formats (WebP, AVIF)",
        "Implement lazy loading for below-fold content",
        "Minimize JavaScript bundle size",
        "Use efficient CSS and avoid layout shifts"
      ],
      usability: [
        "Conduct user testing to identify pain points",
        "Improve form design and validation messages",
        "Add helpful tooltips and guidance",
        "Optimize mobile touch targets (minimum 44px)"
      ],
      delight: [
        "Add subtle animations and transitions",
        "Implement contextual micro-interactions",
        "Enhance visual design with better colors and typography",
        "Create moments of surprise and delight"
      ]
    };

    return recommendations[dimension]?.slice(0, 3) || ["Focus on fundamental improvements"];
  };

  const getCurrentLevel = () => {
    if (!maturityData) return MATURITY_LEVELS[0];
    return MATURITY_LEVELS.find(level => 
      maturityData.overall_score >= level.minScore && maturityData.overall_score <= level.maxScore
    ) || MATURITY_LEVELS[0];
  };

  const getNextLevel = () => {
    if (!maturityData) return MATURITY_LEVELS[1];
    const currentLevel = getCurrentLevel();
    const currentIndex = MATURITY_LEVELS.indexOf(currentLevel);
    return MATURITY_LEVELS[currentIndex + 1] || currentLevel;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!maturityData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Start Your UX Journey</h3>
          <p className="text-muted-foreground text-center mb-4">
            Complete your first Goblin analysis to unlock your personalized maturity dashboard
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = nextLevel ? 
    ((maturityData.overall_score - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                <p className="text-3xl font-bold">{maturityData.overall_score}</p>
                <p className="text-xs text-muted-foreground">
                  {currentLevel.name} {currentLevel.badge}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Percentile</p>
                <p className="text-3xl font-bold">{Math.round(maturityData.percentile_rank || 0)}</p>
                <p className="text-xs text-muted-foreground">Top performer</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Growth</p>
                <p className="text-3xl font-bold">
                  {maturityData.previous_score ? 
                    `+${maturityData.overall_score - maturityData.previous_score}` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Since last analysis</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Streak</p>
                <p className="text-3xl font-bold">{maturityData.streak_days || 0}</p>
                <p className="text-xs text-muted-foreground">Days active</p>
              </div>
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="improvements">Growth Areas</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {currentLevel.name} {currentLevel.badge}
                  </span>
                  {nextLevel && (
                    <span className="text-sm text-muted-foreground">
                      Next: {nextLevel.name} {nextLevel.badge}
                    </span>
                  )}
                </div>
                <Progress value={progressToNext} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {nextLevel ? 
                    `${nextLevel.minScore - maturityData.overall_score} points to next level` :
                    'Maximum level achieved!'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dimension Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Dimension Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { name: 'Accessibility', score: maturityData.accessibility_score, icon: Shield },
                  { name: 'Clarity', score: maturityData.clarity_score, icon: BookOpen },
                  { name: 'Performance', score: maturityData.performance_score, icon: Zap },
                  { name: 'Usability', score: maturityData.usability_score, icon: Component },
                  { name: 'Delight', score: maturityData.delight_score, icon: Sparkles }
                ].map((dimension, index) => {
                  const Icon = dimension.icon;
                  return (
                    <div key={index} className="text-center">
                      <Icon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{dimension.score || 0}</p>
                      <p className="text-xs text-muted-foreground">{dimension.name}</p>
                      <Progress value={dimension.score || 0} className="h-1 mt-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strengths" className="space-y-4">
          {strengthPatterns.length > 0 ? (
            strengthPatterns.map((strength, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <Award className="w-5 h-5 text-green-600" />
                    {strength.dimension} Strength
                    <Badge variant="secondary">{strength.score}/100</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {strength.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Complete more analyses to identify your design strengths
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          {improvementPatterns.length > 0 ? (
            improvementPatterns.map((improvement, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    {improvement.dimension} Growth
                    <Badge variant={
                      improvement.priority === 'high' ? 'destructive' : 
                      improvement.priority === 'medium' ? 'secondary' : 'default'
                    }>
                      {improvement.priority} priority
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current: {improvement.currentScore}/100</span>
                    <span>Target: {improvement.targetScore}/100</span>
                  </div>
                  <Progress value={(improvement.currentScore / improvement.targetScore) * 100} />
                  <div>
                    <h4 className="font-medium mb-2">Recommended Actions:</h4>
                    <ul className="space-y-1">
                      {improvement.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Estimated impact: +{improvement.estimatedImpact} points overall score
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  You're performing well across all dimensions! 🎉
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Based on your current level and improvement areas, here's your personalized learning path:
              </p>
              
              <div className="space-y-4">
                {improvementPatterns.slice(0, 3).map((improvement, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">
                        Week {index + 1}: Focus on {improvement.dimension}
                      </h4>
                      <Badge variant="outline">
                        {improvement.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Current score: {improvement.currentScore}/100 → Target: {improvement.targetScore}/100
                    </p>
                    <p className="text-sm">
                      {improvement.recommendations[0]}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}