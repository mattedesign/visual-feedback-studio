import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Share2, 
  Trophy, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MaturityScoreService } from "@/services/goblin/maturityScoreService";
import { toast } from "sonner";

const MATURITY_LEVELS = [
  { level: 'Novice', minScore: 0, badge: '🌱', description: 'Just starting your UX journey' },
  { level: 'Developing', minScore: 20, badge: '🌿', description: 'Building foundational skills' },
  { level: 'Competent', minScore: 40, badge: '🌳', description: 'Solid UX understanding' },
  { level: 'Advanced', minScore: 60, badge: '🎯', description: 'Sophisticated design thinking' },
  { level: 'Expert', minScore: 80, badge: '🏆', description: 'UX mastery achieved' }
];

export function MaturityScoreDashboard() {
  const [score, setScore] = useState<any>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadMaturityData();
  }, []);

  const loadMaturityData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Get latest score
      const { data: scores } = await supabase
        .from('goblin_maturity_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);

      if (scores && scores.length > 0) {
        setScore(scores[0]);
        setPreviousScore(scores[1]?.overall_score || null);
        
        // Calculate percentile
        const percentileRank = await MaturityScoreService.calculatePercentile(
          user.id,
          scores[0].overall_score
        );
        setPercentile(percentileRank);
      }
    } catch (error) {
      console.error('Error loading maturity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shareScore = async () => {
    if (!score) return;

    const shareText = `🎯 My UX Design Maturity Score: ${score.overall_score}/100\n\n` +
      `Level: ${score.maturity_level} ${MaturityScoreService.getMaturityLevel(score.overall_score).badge}\n` +
      `Top ${100 - percentile}% of designers on @Figmant\n\n` +
      `Track your UX maturity: figmant.com/goblin`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My UX Design Maturity Score',
          text: shareText,
          url: 'https://figmant.com/goblin'
        });
        
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(shareText);
      toast.success("Score copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-gray-100 rounded"></div>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card className="p-8 text-center">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Maturity Score Yet</h3>
        <p className="text-gray-600 text-sm">
          Complete your first analysis to get your UX maturity score
        </p>
      </Card>
    );
  }

  const maturityLevel = MaturityScoreService.getMaturityLevel(score.overall_score);
  const scoreChange = previousScore ? score.overall_score - previousScore : 0;
  const nextLevel = MATURITY_LEVELS.find(l => l.minScore > score.overall_score);

  return (
    <div className="space-y-6" style={{ width: '100vw', maxWidth: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
      {/* Main Score Card */}
      <Card className="p-8 bg-gradient-to-br from-purple-50 to-white border-purple-200" style={{ width: '100%' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Design Maturity Score</h2>
            <p className="text-gray-600">Track your UX improvement journey</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={shareScore}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        {/* Score Display */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-6xl font-bold">{score.overall_score}</span>
            <span className="text-3xl text-gray-400">/100</span>
            {scoreChange !== 0 && (
              <Badge 
                variant={scoreChange > 0 ? "default" : "destructive"}
                className="ml-2"
              >
                {scoreChange > 0 ? '+' : ''}{scoreChange}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">{maturityLevel.badge}</span>
            <span className="text-xl font-semibold">{maturityLevel.level}</span>
          </div>
          
          <p className="text-gray-600">{maturityLevel.description}</p>
          
          {/* Percentile */}
          <div className="mt-4 inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
            <Trophy className="w-4 h-4 text-purple-700" />
            <span className="text-sm font-medium text-purple-900">
              Top {100 - percentile}% of designers
            </span>
          </div>
        </div>

        {/* Progress to Next Level */}
        {score.overall_score < 100 && nextLevel && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress to {nextLevel.level}</span>
              <span className="font-medium">
                {score.overall_score} / {nextLevel.minScore}
              </span>
            </div>
            <Progress 
              value={(score.overall_score / nextLevel.minScore) * 100} 
              className="h-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {nextLevel.minScore - score.overall_score} points to next level
            </p>
          </div>
        )}

        {/* Dimension Breakdown Toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full justify-between"
        >
          <span>View dimension breakdown</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </Button>
        
        {/* Dimension Details */}
        {showDetails && (
          <div className="mt-4 space-y-3 pt-4 border-t">
            {[
              { name: 'Usability', score: score.usability_score, icon: '🎯', color: 'blue' },
              { name: 'Accessibility', score: score.accessibility_score, icon: '♿', color: 'green' },
              { name: 'Performance', score: score.performance_score, icon: '⚡', color: 'yellow' },
              { name: 'Clarity', score: score.clarity_score, icon: '👾', color: 'purple' },
              { name: 'Delight', score: score.delight_score, icon: '✨', color: 'pink' }
            ].map((dimension) => (
              <div key={dimension.name} className="flex items-center gap-3">
                <span className="text-2xl w-8">{dimension.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{dimension.name}</span>
                    <span className="text-sm text-gray-600">{dimension.score}/20</span>
                  </div>
                  <Progress 
                    value={(dimension.score / 20) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Streak Indicator */}
      {score.streak_days > 0 && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Sparkles className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-orange-900">
                {score.streak_days} day improvement streak!
              </p>
              <p className="text-sm text-orange-700">
                Keep analyzing to maintain your streak
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}