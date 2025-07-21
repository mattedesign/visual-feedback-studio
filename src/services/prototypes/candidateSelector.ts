import type { PrototypeCandidate } from '@/types/analysis';

export class PrototypeCandidateSelector {
  /**
   * Select high-impact issues for prototype generation
   * Limits to maximum 3 prototypes for optimal user experience
   */
  static selectCandidates(issues: any[], visionData: any): PrototypeCandidate[] {
    console.log(`🎯 Evaluating ${issues.length} issues for prototype generation`);
    
    // Score and filter issues for prototype potential
    const candidates = issues
      .map(issue => this.scoreIssueForPrototyping(issue, visionData))
      .filter((candidate): candidate is PrototypeCandidate => candidate !== null)
      .filter(candidate => candidate.impactScore > 0.7) // High impact only
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 3); // Maximum 3 prototypes per analysis
    
    console.log(`✅ Selected ${candidates.length} candidates for prototyping:`, 
      candidates.map(c => `${c.issue.id}: ${c.impactScore.toFixed(2)}`));
    
    return candidates;
  }
  
  private static scoreIssueForPrototyping(issue: any, visionData: any): PrototypeCandidate | null {
    let impactScore = 0;
    let prototypeType: PrototypeCandidate['prototypeType'] = 'component';
    let complexity: PrototypeCandidate['complexity'] = 'detailed';
    let visualScope: PrototypeCandidate['visualScope'] = 'single-element';
    
    // Business impact scoring (40% of total score)
    const impactWeights = {
      'conversion': 0.4,
      'task-completion': 0.3,
      'user-trust': 0.25,
      'readability': 0.2,
      'performance': 0.15,
      'aesthetic': 0.1
    };
    
    if (issue.impact_scope && impactWeights[issue.impact_scope]) {
      impactScore += impactWeights[issue.impact_scope];
    }
    
    // Severity scoring (30% of total score)  
    const severityWeights = {
      'critical': 0.3,
      'warning': 0.2,
      'improvement': 0.1
    };
    
    if (issue.severity && severityWeights[issue.severity]) {
      impactScore += severityWeights[issue.severity];
    }
    
    // Confidence scoring (30% of total score)
    impactScore += (issue.confidence || 0.5) * 0.3;
    
    // Complexity and scope detection based on issue level
    if (issue.level === 'layout') {
      complexity = 'comprehensive';
      visualScope = 'section';
      prototypeType = 'layout';
      impactScore += 0.1; // Bonus for layout improvements
    } else if (issue.level === 'flow') {
      complexity = 'comprehensive';  
      visualScope = 'page';
      prototypeType = 'interaction';
      impactScore += 0.15; // High bonus for flow improvements
    } else if (issue.category === 'content') {
      prototypeType = 'content';
      complexity = 'advanced';
    } else if (issue.category === 'accessibility') {
      complexity = 'advanced';
      impactScore += 0.05; // Bonus for accessibility improvements
    }
    
    // Must have element location for visual prototype
    if (!issue.element?.location) {
      console.log(`⚠️ Skipping issue ${issue.id}: No element location`);
      return null;
    }
    
    // Only create prototypes for high-impact, visual issues
    if (impactScore < 0.7) {
      console.log(`⚠️ Skipping issue ${issue.id}: Impact score too low (${impactScore.toFixed(2)})`);
      return null;
    }
    
    return {
      issue,
      prototypeType,
      complexity,
      impactScore,
      visualScope
    };
  }
  
  /**
   * Analyze design context to inform prototype generation
   */
  static analyzeDesignContext(visionData: any, platform: string = 'web') {
    const dominantColors = visionData.imageProperties?.dominantColors?.slice(0, 3) || ['#2563eb', '#ffffff', '#f8fafc'];
    const detectedElements = visionData.localizedObjectAnnotations || [];
    const overallStyle = this.detectDesignStyle(visionData);
    
    return {
      dominantColors,
      detectedElements,
      overallStyle,
      platform
    };
  }
  
  private static detectDesignStyle(visionData: any): string {
    // Analyze visual patterns to determine design style
    const colors = visionData.imageProperties?.dominantColors || [];
    const labels = visionData.labelAnnotations?.map((l: any) => l.description.toLowerCase()) || [];
    
    // Check for style indicators
    const hasRoundedElements = labels.some(l => l.includes('rounded') || l.includes('circle'));
    const hasSharpElements = labels.some(l => l.includes('square') || l.includes('angular'));
    const isColorful = colors.length > 5;
    const hasGradients = labels.some(l => l.includes('gradient'));
    
    if (hasGradients) return 'gradient-modern';
    if (isColorful) return 'colorful-expressive';
    if (hasRoundedElements) return 'modern-rounded';
    if (hasSharpElements) return 'minimal-sharp';
    
    return 'standard-clean';
  }
}