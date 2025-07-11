import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function PublicAchievement() {
  const { shareToken } = useParams();
  const [achievement, setAchievement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAchievement();
  }, [shareToken]);

  const loadAchievement = async () => {
    if (!shareToken) return;

    try {
      const { data } = await supabase
        .from('goblin_achievements')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      setAchievement(data);
    } catch (error) {
      console.error('Achievement not found');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!achievement) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Achievement Not Found</h2>
        <p className="text-gray-600">This achievement link may have expired.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <Card className="p-8 text-center">
        <span className="text-6xl mb-4 block">{achievement.badge_emoji}</span>
        <h1 className="text-2xl font-bold mb-2">{achievement.achievement_name}</h1>
        <p className="text-gray-600 mb-6">{achievement.achievement_description}</p>
        
        <div className="border-t pt-6">
          <p className="text-sm text-gray-500 mb-4">
            Earned on Figmant's UX Analysis Platform
          </p>
          <Button asChild className="w-full">
            <a href="/goblin">Track Your UX Maturity</a>
          </Button>
        </div>
      </Card>
    </div>
  );
}