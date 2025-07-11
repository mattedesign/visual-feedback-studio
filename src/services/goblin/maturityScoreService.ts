import { supabase } from "@/integrations/supabase/client";

interface DimensionScores {
  usability: number;
  accessibility: number;
  performance: number;
  clarity: number;
  delight: number;
}

interface MaturityLevel {
  level: string;
  minScore: number;
  badge: string;
  description: string;
}

const MATURITY_LEVELS: MaturityLevel[] = [
  { level: 'Novice', minScore: 0, badge: '🌱', description: 'Just starting your UX journey' },
  { level: 'Developing', minScore: 20, badge: '🌿', description: 'Building foundational skills' },
  { level: 'Competent', minScore: 40, badge: '🌳', description: 'Solid UX understanding' },
  { level: 'Advanced', minScore: 60, badge: '🎯', description: 'Sophisticated design thinking' },
  { level: 'Expert', minScore: 80, badge: '🏆', description: 'UX mastery achieved' }
];

export class MaturityScoreService {
  /**
   * Calculate maturity score from analysis results
   */
  static async calculateScore(sessionId: string, analysisResult: any): Promise<DimensionScores> {
    const feedback = analysisResult.persona_feedback;
    const gripeLevel = analysisResult.goblin_gripe_level;
    
    // Base scores from gripe level
    const baseScore = gripeLevel === 'low' ? 15 : gripeLevel === 'medium' ? 10 : 5;
    
    // Calculate dimension scores based on feedback patterns
    const scores: DimensionScores = {
      usability: this.calculateUsabilityScore(feedback, baseScore),
      accessibility: this.calculateAccessibilityScore(feedback, baseScore),
      performance: this.calculatePerformanceScore(feedback, baseScore),
      clarity: this.calculateClarityScore(feedback, baseScore),
      delight: this.calculateDelightScore(feedback, baseScore)
    };
    
    return scores;
  }

  private static calculateUsabilityScore(feedback: any, base: number): number {
    let score = base;
    const feedbackText = JSON.stringify(feedback).toLowerCase();
    
    if (feedbackText.includes('intuitive')) score += 2;
    if (feedbackText.includes('confusing')) score -= 3;
    if (feedbackText.includes('easy to use')) score += 3;
    if (feedbackText.includes('friction')) score -= 2;
    if (feedbackText.includes('clear navigation')) score += 2;
    if (feedbackText.includes('lost')) score -= 3;
    
    return Math.max(0, Math.min(20, score));
  }

  private static calculateAccessibilityScore(feedback: any, base: number): number {
    let score = base;
    const feedbackText = JSON.stringify(feedback).toLowerCase();
    
    if (feedbackText.includes('contrast')) score -= 3;
    if (feedbackText.includes('accessible')) score += 3;
    if (feedbackText.includes('screen reader')) score += 2;
    if (feedbackText.includes('color blind')) score += 1;
    if (feedbackText.includes('touch target')) score -= 2;
    if (feedbackText.includes('keyboard')) score += 2;
    
    return Math.max(0, Math.min(20, score));
  }

  private static calculatePerformanceScore(feedback: any, base: number): number {
    let score = base;
    const feedbackText = JSON.stringify(feedback).toLowerCase();
    
    if (feedbackText.includes('slow')) score -= 4;
    if (feedbackText.includes('loading')) score -= 2;
    if (feedbackText.includes('responsive')) score += 3;
    if (feedbackText.includes('snappy')) score += 3;
    if (feedbackText.includes('lag')) score -= 3;
    if (feedbackText.includes('instant')) score += 2;
    
    return Math.max(0, Math.min(20, score));
  }

  private static calculateClarityScore(feedback: any, base: number): number {
    let score = base;
    
    // Clarity is the goblin's specialty!
    if (feedback.biggestGripe?.includes('unclear')) score -= 4;
    if (feedback.biggestGripe?.includes('obvious')) score += 3;
    if (feedback.improvements?.some((i: string) => i.includes('label'))) score -= 2;
    if (feedback.whatMakesGoblinHappy?.includes('clear')) score += 3;
    
    return Math.max(0, Math.min(20, score));
  }

  private static calculateDelightScore(feedback: any, base: number): number {
    let score = base;
    const feedbackText = JSON.stringify(feedback).toLowerCase();
    
    if (feedbackText.includes('delight')) score += 4;
    if (feedbackText.includes('boring')) score -= 3;
    if (feedbackText.includes('engaging')) score += 3;
    if (feedbackText.includes('fun')) score += 2;
    if (feedbackText.includes('personality')) score += 2;
    if (feedbackText.includes('generic')) score -= 2;
    
    return Math.max(0, Math.min(20, score));
  }

  /**
   * Get maturity level from score
   */
  static getMaturityLevel(score: number): MaturityLevel {
    return MATURITY_LEVELS
      .slice()
      .reverse()
      .find(level => score >= level.minScore) || MATURITY_LEVELS[0];
  }

  /**
   * Calculate percentile rank
   */
  static async calculatePercentile(userId: string, score: number): Promise<number> {
    const { data, error } = await supabase
      .from('goblin_maturity_scores')
      .select('overall_score')
      .order('overall_score', { ascending: true });
      
    if (!data || error || data.length === 0) return 50; // Default to median
    
    const scores = data.map(d => d.overall_score);
    const position = scores.filter(s => s < score).length;
    
    return Math.round((position / scores.length) * 100);
  }

  /**
   * Generate improvement roadmap
   */
  static async generateRoadmap(
    userId: string, 
    currentScores: DimensionScores
  ): Promise<any[]> {
    const roadmapItems = [];
    
    // Find weakest dimensions
    const dimensions = Object.entries(currentScores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3); // Focus on top 3 weakest areas
    
    for (const [dimension, score] of dimensions) {
      const improvements = this.getImprovementsForDimension(dimension, score);
      roadmapItems.push(...improvements);
    }
    
    // Sort by impact and difficulty
    return roadmapItems
      .sort((a, b) => {
        // Prioritize high impact, low difficulty
        const scoreA = a.estimated_impact / (a.difficulty === 'Quick Win' ? 1 : a.difficulty === 'Moderate' ? 2 : 3);
        const scoreB = b.estimated_impact / (b.difficulty === 'Quick Win' ? 1 : b.difficulty === 'Moderate' ? 2 : 3);
        return scoreB - scoreA;
      })
      .slice(0, 5); // Top 5 recommendations
  }

  private static getImprovementsForDimension(dimension: string, currentScore: number): any[] {
    const improvements = {
      usability: [
        {
          title: 'Simplify primary navigation',
          description: 'Reduce cognitive load by limiting main nav to 5-7 items',
          estimated_impact: 3,
          difficulty: 'Moderate'
        },
        {
          title: 'Add clear CTAs above the fold',
          description: 'Users should immediately know what action to take',
          estimated_impact: 4,
          difficulty: 'Quick Win'
        },
        {
          title: 'Implement breadcrumb navigation',
          description: 'Help users understand where they are in your app',
          estimated_impact: 2,
          difficulty: 'Quick Win'
        }
      ],
      accessibility: [
        {
          title: 'Fix color contrast issues',
          description: 'Ensure all text meets WCAG AA standards (4.5:1 ratio)',
          estimated_impact: 5,
          difficulty: 'Quick Win'
        },
        {
          title: 'Add keyboard navigation',
          description: 'All interactive elements should be keyboard accessible',
          estimated_impact: 4,
          difficulty: 'Moderate'
        },
        {
          title: 'Include alt text for images',
          description: 'Describe images for screen reader users',
          estimated_impact: 3,
          difficulty: 'Quick Win'
        }
      ],
      performance: [
        {
          title: 'Implement skeleton loading states',
          description: 'Show users that content is loading with visual feedback',
          estimated_impact: 3,
          difficulty: 'Quick Win'
        },
        {
          title: 'Optimize image loading',
          description: 'Use lazy loading and responsive images',
          estimated_impact: 4,
          difficulty: 'Moderate'
        },
        {
          title: 'Add loading progress indicators',
          description: 'Show actual progress for long operations',
          estimated_impact: 2,
          difficulty: 'Moderate'
        }
      ],
      clarity: [
        {
          title: 'Rewrite error messages',
          description: 'Make errors human-friendly and actionable',
          estimated_impact: 4,
          difficulty: 'Quick Win'
        },
        {
          title: 'Add contextual help text',
          description: 'Guide users with inline hints and tooltips',
          estimated_impact: 3,
          difficulty: 'Quick Win'
        },
        {
          title: 'Use consistent terminology',
          description: "Don't call the same thing by different names",
          estimated_impact: 3,
          difficulty: 'Moderate'
        }
      ],
      delight: [
        {
          title: 'Add micro-interactions',
          description: 'Small animations on hover and click for feedback',
          estimated_impact: 3,
          difficulty: 'Moderate'
        },
        {
          title: 'Implement success celebrations',
          description: 'Celebrate user achievements with delightful animations',
          estimated_impact: 2,
          difficulty: 'Quick Win'
        },
        {
          title: 'Add personality to copy',
          description: 'Make your interface feel human and approachable',
          estimated_impact: 2,
          difficulty: 'Quick Win'
        }
      ]
    };
    
    return improvements[dimension]?.map(item => ({
      ...item,
      dimension,
      priority: 0 // Will be set later
    })) || [];
  }

  /**
   * Check and unlock achievements
   */
  static async checkAchievements(userId: string, newScore: number, previousScore: number): Promise<any[]> {
    const achievements = [];
    
    // First analysis
    if (!previousScore) {
      achievements.push({
        achievement_type: 'milestone',
        achievement_name: 'UX Journey Begins',
        achievement_description: 'Completed your first design analysis',
        badge_emoji: '🚀'
      });
    }
    
    // Score milestones
    const milestones = [25, 50, 75, 90];
    for (const milestone of milestones) {
      if (previousScore < milestone && newScore >= milestone) {
        achievements.push({
          achievement_type: 'score',
          achievement_name: `${milestone} Club`,
          achievement_description: `Achieved a maturity score of ${milestone}+`,
          badge_emoji: milestone >= 75 ? '🏆' : '⭐'
        });
      }
    }
    
    // Improvement achievements
    if (previousScore && newScore > previousScore + 10) {
      achievements.push({
        achievement_type: 'improvement',
        achievement_name: 'Rapid Learner',
        achievement_description: 'Improved your score by 10+ points',
        badge_emoji: '📈'
      });
    }
    
    // Perfect dimension scores
    const dimensionScores = await this.getLatestDimensionScores(userId);
    Object.entries(dimensionScores).forEach(([dimension, score]) => {
      if (score === 20) {
        achievements.push({
          achievement_type: 'perfection',
          achievement_name: `${dimension.charAt(0).toUpperCase() + dimension.slice(1)} Master`,
          achievement_description: `Achieved perfect score in ${dimension}`,
          badge_emoji: '💎'
        });
      }
    });
    
    return achievements;
  }

  private static async getLatestDimensionScores(userId: string): Promise<DimensionScores> {
    const { data } = await supabase
      .from('goblin_maturity_scores')
      .select('usability_score, accessibility_score, performance_score, clarity_score, delight_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (data) {
      return {
        usability: data.usability_score || 0,
        accessibility: data.accessibility_score || 0,
        performance: data.performance_score || 0,
        clarity: data.clarity_score || 0,
        delight: data.delight_score || 0
      };
    }
    
    return {
      usability: 0,
      accessibility: 0,
      performance: 0,
      clarity: 0,
      delight: 0
    };
  }

  /**
   * Calculate streak days
   */
  static async calculateStreak(userId: string): Promise<number> {
    const { data } = await supabase
      .from('goblin_maturity_scores')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!data || data.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i < data.length; i++) {
      const current = new Date(data[i].created_at);
      const previous = new Date(data[i - 1].created_at);
      
      current.setHours(0, 0, 0, 0);
      previous.setHours(0, 0, 0, 0);
      
      const dayDiff = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}