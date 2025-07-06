
import { WellDoneInsight, WellDoneData } from '../types.ts';

export class WellDoneService {
  static extractInsights(content: string): WellDoneInsight[] {
    console.log('🎉 Extracting Well Done insights from Claude response');
    console.log('📝 Content to analyze length:', content?.length || 0);
    
    if (!content || content.length < 50) {
      console.log('⚠️ Content too short for Well Done analysis, using fallback');
      return this.getFallbackInsights();
    }
    
    const insights: WellDoneInsight[] = [];
    const lines = content.split('\n');
    
    // Patterns to identify positive feedback
    const positivePatterns = [
      /(?:excellent|great|well[\s-]done|good|strong|effective|clear|impressive|solid)/i,
      /(?:properly|correctly|appropriately|successfully)/i,
      /(?:follows.*best.*practice|adheres.*to.*standard|implements.*well)/i,
      /(?:demonstrates|shows|exhibits|displays).*(?:good|strong|excellent)/i,
      /(?:nice|smart|clever|thoughtful|professional|clean)/i,
      /(?:well[\s-]structured|well[\s-]organized|well[\s-]designed)/i,
      /(?:intuitive|user[\s-]friendly|accessible|readable)/i
    ];
    
    // Categories to look for
    const categoryPatterns = {
      visual: /(?:color|typography|layout|design|aesthetic|visual|hierarchy|spacing|alignment|contrast)/i,
      ux: /(?:user.*experience|usability|navigation|flow|interaction|intuitive|user.*friendly)/i,
      accessibility: /(?:accessibility|contrast|wcag|inclusive|accessible|readable|screen.*reader)/i,
      conversion: /(?:conversion|cta|call.*to.*action|button|form|signup|purchase|revenue)/i,
      mobile: /(?:mobile|responsive|device|touch|tablet|phone|adaptive)/i
    };
    
    console.log('🔍 Analyzing', lines.length, 'lines for positive feedback');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.length < 20) continue; // Skip short lines
      
      // Check if this line contains positive feedback
      const isPositive = positivePatterns.some(pattern => pattern.test(line));
      
      if (isPositive) {
        console.log('✅ Found positive feedback:', line.substring(0, 60) + '...');
        
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
          
          console.log('➕ Added insight:', { title: title.substring(0, 40) + '...', category: currentCategory });
        }
      }
      
      // Stop if we have enough insights
      if (insights.length >= 5) break;
    }
    
    // If no specific insights found, generate generic positive feedback
    if (insights.length === 0) {
      console.log('🔄 No specific insights found, using smart fallback');
      return this.getSmartFallbackInsights(content);
    }
    
    // Limit to top 3-4 insights to avoid overwhelming
    const topInsights = insights.slice(0, 4);
    
    console.log(`🎉 Extracted ${topInsights.length} Well Done insights:`, 
      topInsights.map(i => ({ title: i.title.substring(0, 30) + '...', category: i.category }))
    );
    
    return topInsights;
  }

  static getFallbackInsights(): WellDoneInsight[] {
    return [{
      title: "Strong Design Foundation",
      description: "The design demonstrates solid UX principles and thoughtful consideration for user needs. The overall approach shows attention to detail and user-centered design thinking.",
      category: 'overall'
    }];
  }

  static getSmartFallbackInsights(content: string): WellDoneInsight[] {
    const insights: WellDoneInsight[] = [];
    
    // Analyze content for common design elements and create positive feedback
    if (content.toLowerCase().includes('navigation') || content.toLowerCase().includes('menu')) {
      insights.push({
        title: "Clear Navigation Structure",
        description: "The navigation design shows thoughtful organization that helps users find what they're looking for efficiently.",
        category: 'ux'
      });
    }
    
    if (content.toLowerCase().includes('color') || content.toLowerCase().includes('visual')) {
      insights.push({
        title: "Thoughtful Visual Design",
        description: "The visual elements demonstrate good design principles with attention to aesthetics and user experience.",
        category: 'visual'
      });
    }
    
    if (content.toLowerCase().includes('mobile') || content.toLowerCase().includes('responsive')) {
      insights.push({
        title: "Mobile-Conscious Design",
        description: "The design shows consideration for mobile users and responsive design principles.",
        category: 'mobile'
      });
    }
    
    // Always have at least one insight
    if (insights.length === 0) {
      insights.push({
        title: "Professional Design Approach",
        description: "The design demonstrates a professional approach with consideration for user experience and business goals.",
        category: 'overall'
      });
    }
    
    console.log('🧠 Generated smart fallback insights:', insights.length);
    return insights.slice(0, 3);
  }

  static processInsights(insights: WellDoneInsight[]): WellDoneData {
    console.log('🔄 Processing', insights.length, 'insights into Well Done data');
    
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
    
    const processedData = {
      insights,
      overallStrengths: overallStrengths.slice(0, 5), // Limit to top 5
      categoryHighlights
    };
    
    console.log('✅ Well Done data processed:', {
      insightsCount: processedData.insights.length,
      categoriesFound: Object.keys(processedData.categoryHighlights),
      strengthsCount: processedData.overallStrengths.length
    });
    
    return processedData;
  }
}
