import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Target, 
  ChevronRight, 
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoadmapItem {
  id: string;
  priority: number;
  dimension: string;
  title: string;
  description: string;
  estimated_impact: number;
  difficulty: string;
  status: string;
}

export function ImprovementRoadmap() {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('goblin_roadmap_items')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (data) {
        setRoadmapItems(data);
        setCompletedCount(data.filter(item => item.status === 'completed').length);
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemStatus = async (item: RoadmapItem) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    
    const { error } = await supabase
      .from('goblin_roadmap_items')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', item.id);

    if (!error) {
      setRoadmapItems(prev => 
        prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i)
      );
      
      if (newStatus === 'completed') {
        setCompletedCount(prev => prev + 1);
        toast.success(`Nice work! +${item.estimated_impact} points potential`);
      } else {
        setCompletedCount(prev => prev - 1);
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Quick Win': return 'text-green-700 bg-green-100';
      case 'Moderate': return 'text-yellow-700 bg-yellow-100';
      case 'Complex': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getDimensionIcon = (dimension: string) => {
    const icons = {
      usability: '🎯',
      accessibility: '♿',
      performance: '⚡',
      clarity: '👾',
      delight: '✨'
    };
    return icons[dimension] || '📋';
  };

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </Card>
    );
  }

  const totalPotentialPoints = roadmapItems
    .filter(item => item.status !== 'completed')
    .reduce((sum, item) => sum + item.estimated_impact, 0);

  return (
    <Card className="p-6 w-full max-w-none">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">Your Improvement Roadmap</h3>
          <Badge variant="secondary">
            {completedCount}/{roadmapItems.length} completed
          </Badge>
        </div>
        <p className="text-gray-600 text-sm">
          Personalized recommendations based on your analyses
        </p>
        
        {totalPotentialPoints > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Potential score increase: <strong>+{totalPotentialPoints} points</strong>
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {roadmapItems.map((item, index) => (
          <div
            key={item.id}
            className={`border rounded-lg p-4 transition-all ${
              item.status === 'completed' 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={item.status === 'completed'}
                onCheckedChange={() => toggleItemStatus(item)}
                className="mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getDimensionIcon(item.dimension)}</span>
                    <h4 className={`font-medium ${
                      item.status === 'completed' ? 'line-through text-gray-500' : ''
                    }`}>
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <Badge 
                      variant="outline" 
                      className={getDifficultyColor(item.difficulty)}
                    >
                      {item.difficulty}
                    </Badge>
                    <Badge variant="secondary">
                      +{item.estimated_impact}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  {item.description}
                </p>
                
                {item.status !== 'completed' && index === 0 && (
                  <Button size="sm" variant="ghost" className="gap-1 text-purple-600">
                    Start with this
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {roadmapItems.length === 0 && (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            Complete more analyses to get personalized improvement recommendations
          </p>
        </div>
      )}
    </Card>
  );
}