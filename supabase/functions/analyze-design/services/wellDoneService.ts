
import { WellDoneInsight, WellDoneData } from '../types.ts';

export class WellDoneService {
  static extractInsights(content: string): WellDoneInsight[] {
    console.log('🎉 Extracting Well Done insights from Claude response');
    
    const insights: WellDoneInsight[] = [];
    const lines = content.split('\n');
    
    // Patterns to identify positive feedback
    const positivePatterns = [
      /(?:excellent|great|well[\s-]done|good|strong|effective|clear|impressive|solid)/i,
      /(?:properly|correctly|appropriately|successfully)/i,
      /(?:follows.*best.*practice|adheres.*to.*standard|implements.*well)/i,
      /(?:demonstrates|shows|exhibits|displays).*(?:good|strong|excellent)/i,
      /(?:nice|smart|clever|thoughtful|professional|clean)/i
    ];
    
    // Categories to look for
    const categoryPatterns = {
      visual: /(?:color|typography|layout|design|aesthetic|visual|hierarchy|spacing|alignment)/i,
      ux: /(?:user.*experience|usability|navigation|flow|interaction|intuitive|user.*friendly)/i,
      accessibility: /(?:accessibility|contrast|wcag|inclusive|accessible|readable)/i,
      conversion: /(?:conversion|cta|call.*to.*action|button|form|signup|purchase)/i,
      mobile: /(?:mobile|responsive|device|touch|tablet|phone|adaptive)/i
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.length < 20) continue; // Skip short lines
      
      // Check if this line contains positive feedback
      const isPositive = positivePatterns.some(pattern => pattern.test(line));
      
      if (isPositive) {
        // Determine category
        let currentCategory: keyof typeof categoryPatterns | 'overall' = 'overall';
        for (const [cat, pattern] of Object.entries(categoryPatterns)) {
          if (pattern.test(line)) {
            currentCategory = cat as keyof typeof categoryPatterns;
            break;
          }
        }
        
        // Extract the insight
        const cleanLine = line
          .replace(/^[•\-\*\d\.\)]\s*/, '') // Remove bullet points
          .replace(/^\**\s*/, '') // Remove asterisks
          .trim();
        
        // Try to get the title and description
        let title = '';
        let description = '';
        
        if (cleanLine.includes(':')) {
          const parts = cleanLine.split(':', 2);
          title = parts[0].trim();
          description = parts[1].trim();
        } else if (cleanLine.length > 100) {
          // Long line - take first sentence as title
          const sentences = cleanLine.split(/[.!?]+/);
          title = sentences[0].trim() + '.';
          description = sentences.slice(1).join(' ').trim();
        } else {
          // Short line - use as title, generate description
          title = cleanLine;
          description = `This demonstrates strong ${currentCategory === 'overall' ? 'design' : currentCategory} principles and user-centered thinking.`;
        }
        
        // Clean up title and description
        title = title.substring(0, 80).trim(); // Limit title length
        if (!title.endsWith('.') && !title.endsWith('!') && !title.endsWith('?')) {
          title += '.';
        }
        
        if (title.length > 15 && !insights.find(i => i.title === title)) { // Ensure meaningful content and no duplicates
          insights.push({
            title,
            description: description || `Excellent ${currentCategory === 'overall' ? 'design' : currentCategory} implementation that follows best practices.`,
            category: currentCategory
          });
        }
      }
      
      // Stop if we have enough insights
      if (insights.length >= 5) break;
    }
    
    // If no specific insights found, generate generic positive feedback
    if (insights.length === 0) {
      insights.push({
        title: "Strong Design Foundation",
        description: "The design demonstrates solid UX principles and thoughtful consideration for user needs. The overall approach shows attention to detail and user-centered design thinking.",
        category: 'overall'
      });
    }
    
    // Limit to top 3-4 insights to avoid overwhelming
    const topInsights = insights.slice(0, 4);
    
    console.log(`🎉 Extracted ${topInsights.length} Well Done insights:`, 
      topInsights.map(i => ({ title: i.title, category: i.category }))
    );
    
    return topInsights;
  }

  static processInsights(insights: WellDoneInsight[]): WellDoneData {
    const categoryHighlights: Record<string, string> = {};
    const overallStrengths: string[] = [];
    
    // Group insights by category
    const byCategory = insights.reduce((acc, insight) => {
      if (!acc[insight.category]) acc[insight.category] = [];
      acc[insight.category].push(insight);
      return acc;
    }, {} as Record<string, WellDoneInsight[]>);
    
    // Create category highlights
    Object.entries(byCategory).forEach(([category, categoryInsights]) => {
      const highlight = categoryInsights[0]; // Take the first/best insight for each category
      categoryHighlights[category] = highlight.title;
    });
    
    // Create overall strengths list
    insights.forEach(insight => {
      if (insight.title && !overallStrengths.includes(insight.title)) {
        overallStrengths.push(insight.title);
      }
    });
    
    console.log('🎉 Processed Well Done data:', {
      insightsCount: insights.length,
      categoriesFound: Object.keys(categoryHighlights),
      strengthsCount: overallStrengths.length
    });
    
    return {
      insights,
      overallStrengths: overallStrengths.slice(0, 5), // Limit to top 5
      categoryHighlights
    };
  }
}
