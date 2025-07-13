import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Share2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  achievement_description: string;
  badge_emoji: string;
  unlocked_at: string;
  share_token: string;
  times_shared: number;
}

export function AchievementShowcase() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('goblin_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (data) {
        setAchievements(data);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shareAchievement = async (achievement: Achievement) => {
    const shareUrl = `https://figmant.com/achievement/${achievement.share_token}`;
    const shareText = `🏆 Achievement Unlocked: ${achievement.achievement_name}\n\n` +
      `${achievement.badge_emoji} ${achievement.achievement_description}\n\n` +
      `Track your UX maturity on @Figmant`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: achievement.achievement_name,
          text: shareText,
          url: shareUrl
        });
        
        // Track share
        await supabase
          .from('goblin_achievements')
          .update({ times_shared: achievement.times_shared + 1 })
          .eq('id', achievement.id);
          
        toast.success("Achievement shared!");
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success("Achievement link copied!");
    }
  };

  const lockedAchievements = [
    { name: 'Consistency Champion', description: '7-day analysis streak', emoji: '🔥' },
    { name: 'Goblin Whisperer', description: 'Achieve "low" gripe level 5 times', emoji: '👾' },
    { name: 'UX Transformer', description: 'Improve score by 25+ points', emoji: '🦋' },
    { name: 'Perfect Score', description: 'Reach 100/100 maturity score', emoji: '💯' },
    { name: 'Team Leader', description: 'Share 5 achievements', emoji: '👥' }
  ];

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-24 bg-gray-100 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">Achievements</h3>
        <p className="text-gray-600 text-sm">
          Unlock badges as you improve your design maturity
        </p>
      </div>

      {/* Unlocked Achievements */}
      {achievements.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-sm text-gray-600 mb-3">UNLOCKED</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-white hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl">{achievement.badge_emoji}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => shareAchievement(achievement)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                <h5 className="font-semibold mb-1">{achievement.achievement_name}</h5>
                <p className="text-sm text-gray-600">{achievement.achievement_description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(achievement.unlocked_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      <div>
        <h4 className="font-medium text-sm text-gray-600 mb-3">LOCKED</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lockedAchievements
            .filter(locked => !achievements.some(unlocked => 
              unlocked.achievement_name === locked.name
            ))
            .map((achievement) => (
              <div
                key={achievement.name}
                className="border rounded-lg p-4 bg-gray-50 border-gray-200 opacity-60"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl grayscale opacity-50">{achievement.emoji}</span>
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <h5 className="font-semibold mb-1 text-gray-700">{achievement.name}</h5>
                <p className="text-sm text-gray-500">{achievement.description}</p>
              </div>
            ))}
        </div>
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-6">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Complete your first analysis to start earning achievements!
          </p>
        </div>
      )}
    </Card>
  );
}