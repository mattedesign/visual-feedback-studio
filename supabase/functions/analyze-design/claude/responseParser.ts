
import { AnnotationData } from '../types.ts';

export function parseClaudeResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    console.log('=== Parsing Claude Response ===');
    console.log('Raw response length:', content.length);
    console.log('Response preview:', content.substring(0, 200));
    console.log('Contains research keywords:', {
      hasResearch: content.includes('research') || content.includes('best practice') || content.includes('methodology'),
      hasCitations: content.includes('**') || content.includes('according to') || content.includes('studies show')
    });
    
    // Try to extract JSON array with multiple patterns
    let jsonMatch = content.match(/\[[\s\S]*?\]/);
    
    if (!jsonMatch) {
      // Try alternative patterns
      jsonMatch = content.match(/```json\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }
    
    if (!jsonMatch) {
      // Try another pattern without code blocks
      jsonMatch = content.match(/(\[[\s\S]*?\])/);
    }
    
    if (jsonMatch) {
      let annotations;
      try {
        annotations = JSON.parse(jsonMatch[0]);
        console.log('Successfully parsed JSON with', annotations.length, 'annotations');
        
        // ✅ CRITICAL FIX: Properly map the AI response to annotation properties
        const validAnnotations = annotations.filter((ann: any) => {
          return typeof ann.x === 'number' && 
                 typeof ann.y === 'number' && 
                 ann.category && 
                 ann.severity;
        }).map((ann: any) => {
          // ✅ FIXED: Extract actual feedback content from the AI response
          const feedbackContent = 
            ann.description ||     // Primary detailed feedback
            ann.title ||           // Fallback to title
            ann.feedback ||        // Direct feedback property
            ann.content ||         // Alternative content property
            ann.text ||            // Text property
            ann.message ||         // Message property
            ann.quickFix ||        // Quick fix suggestions
            ann.businessImpact ||  // Business impact description
            'UX improvement needed'; // Final fallback
          
          console.log(`✅ Extracted feedback for annotation: "${feedbackContent.substring(0, 100)}..."`);
          
          // ✅ ENHANCED: Build comprehensive feedback from multiple properties
          let enhancedFeedback = '';
          
          if (ann.title && ann.description) {
            enhancedFeedback = `${ann.title}: ${ann.description}`;
          } else if (ann.description) {
            enhancedFeedback = ann.description;
          } else if (ann.title) {
            enhancedFeedback = ann.title;
          } else {
            enhancedFeedback = feedbackContent;
          }
          
          // Add business impact and quick fix if available
          if (ann.businessImpact && !enhancedFeedback.includes(ann.businessImpact)) {
            enhancedFeedback += ` Business Impact: ${ann.businessImpact}`;
          }
          
          if (ann.quickFix && !enhancedFeedback.includes(ann.quickFix)) {
            enhancedFeedback += ` Quick Fix: ${ann.quickFix}`;
          }
          
          console.log(`✅ Enhanced feedback created: "${enhancedFeedback.substring(0, 150)}..."`);
          
          return {
            x: ann.x,
            y: ann.y,
            category: ann.category,
            severity: ann.severity,
            feedback: enhancedFeedback, // ✅ FIXED: Use the actual content, not placeholder
            implementationEffort: ann.implementationEffort || 'medium',
            businessImpact: ann.businessImpact || 'medium',
            imageIndex: ann.imageIndex || 0
          };
        });
        
        if (validAnnotations.length === 0) {
          console.warn('No valid annotations found, parsing detailed response');
          return parseDetailedAnalysis(content);
        }
        
        console.log(`✅ Returning ${validAnnotations.length} valid annotations with real feedback`);
        console.log('Sample feedback preview:', validAnnotations.slice(0, 2).map((a, i) => ({
          index: i + 1,
          feedbackPreview: a.feedback.substring(0, 100) + '...',
          feedbackLength: a.feedback.length
        })));
        
        return validAnnotations;
        
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Failed to parse:', jsonMatch[0].substring(0, 300));
        return parseDetailedAnalysis(content);
      }
    } else {
      console.error('No JSON array found in AI response');
      return parseDetailedAnalysis(content);
    }
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    return parseDetailedAnalysis(content);
  }
}

function parseDetailedAnalysis(content: string): AnnotationData[] {
  console.log('✅ ENHANCED: Parsing detailed analysis into comprehensive UX annotations');
  
  const annotations: AnnotationData[] = [];
  
  // ✅ IMPROVED: Extract comprehensive insights from the detailed analysis
  const sections = content.split(/#{1,3}\s+/);
  let yPosition = 20;
  
  for (const section of sections) {
    if (section.length < 50) continue; // Skip short sections
    
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length === 0) continue;
    
    const title = lines[0].replace(/[*#]/g, '').trim();
    const sectionContent = lines.slice(1).join(' ').trim();
    
    if (sectionContent.length < 50) continue; // Skip sections without enough content
    
    // ✅ ENHANCED: Build detailed feedback from analysis content
    let comprehensiveFeedback = '';
    
    if (title && sectionContent) {
      comprehensiveFeedback = `${title}: ${sectionContent}`;
    } else if (sectionContent) {
      comprehensiveFeedback = sectionContent;
    } else if (title) {
      comprehensiveFeedback = `UX Issue: ${title}`;
    }
    
    // ✅ IMPROVED: Extract actionable insights from content
    const actionableInsights = [];
    
    // Look for recommendations, suggestions, improvements
    const recommendationPatterns = [
      /recommend[s]?\s+([^.]+)/gi,
      /suggest[s]?\s+([^.]+)/gi,
      /should\s+([^.]+)/gi,
      /consider\s+([^.]+)/gi,
      /improve\s+([^.]+)/gi,
      /enhance\s+([^.]+)/gi
    ];
    
    recommendationPatterns.forEach(pattern => {
      const matches = comprehensiveFeedback.match(pattern);
      if (matches) {
        matches.forEach(match => {
          actionableInsights.push(match.trim());
        });
      }
    });
    
    // If we found actionable insights, include them
    if (actionableInsights.length > 0) {
      comprehensiveFeedback += ` Key Recommendations: ${actionableInsights.slice(0, 2).join('; ')}`;
    }
    
    // Determine category and severity based on keywords
    let category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand' = 'ux';
    let severity: 'critical' | 'suggested' | 'enhancement' = 'suggested';
    let implementationEffort: 'low' | 'medium' | 'high' = 'medium';
    let businessImpact: 'low' | 'medium' | 'high' = 'medium';
    
    const titleLower = title.toLowerCase();
    const contentLower = comprehensiveFeedback.toLowerCase();
    
    // ✅ ENHANCED: Better categorization
    if (titleLower.includes('accessibility') || contentLower.includes('wcag') || contentLower.includes('contrast') || contentLower.includes('screen reader')) {
      category = 'accessibility';
      severity = 'critical';
      businessImpact = 'high';
    } else if (titleLower.includes('conversion') || contentLower.includes('cta') || contentLower.includes('button') || contentLower.includes('form')) {
      category = 'conversion';
      businessImpact = 'high';
    } else if (titleLower.includes('visual') || contentLower.includes('color') || contentLower.includes('typography') || contentLower.includes('layout')) {
      category = 'visual';
    } else if (titleLower.includes('brand') || contentLower.includes('branding')) {
      category = 'brand';
    }
    
    // ✅ ENHANCED: Better severity assessment
    if (contentLower.includes('critical') || contentLower.includes('must') || contentLower.includes('required') || contentLower.includes('broken')) {
      severity = 'critical';
    } else if (contentLower.includes('important') || contentLower.includes('should') || contentLower.includes('recommend')) {
      severity = 'suggested';
    } else if (contentLower.includes('enhance') || contentLower.includes('improve') || contentLower.includes('consider') || contentLower.includes('optional')) {
      severity = 'enhancement';
    }
    
    console.log(`✅ Created comprehensive annotation: "${title}" with ${comprehensiveFeedback.length} characters of feedback`);
    
    annotations.push({
      x: 30 + (annotations.length * 15) % 40, // Spread annotations horizontally
      y: yPosition,
      category,
      severity,
      feedback: comprehensiveFeedback, // ✅ FIXED: Real comprehensive feedback
      implementationEffort,
      businessImpact,
      imageIndex: 0
    });
    
    yPosition += 20;
    if (yPosition > 80) yPosition = 20; // Wrap around
    
    // Limit to 6 annotations to avoid clutter but ensure quality
    if (annotations.length >= 6) break;
  }
  
  // ✅ ENHANCED: If we couldn't extract any good annotations, create a comprehensive summary
  if (annotations.length === 0) {
    console.log('✅ Creating comprehensive UX summary annotation from analysis content');
    
    // Extract the most meaningful content
    const meaningfulContent = content
      .replace(/[#*]/g, '') // Remove markdown formatting
      .split('\n')
      .filter(line => line.trim().length > 20) // Keep substantial lines
      .slice(0, 10) // Take first 10 meaningful lines
      .join(' ')
      .substring(0, 500) + '...';
    
    const summaryFeedback = `Comprehensive UX Analysis Results: ${meaningfulContent}`;
    
    console.log(`✅ Created summary annotation with ${summaryFeedback.length} characters of comprehensive feedback`);
    
    annotations.push({
      x: 50,
      y: 30,
      category: 'ux',
      severity: 'suggested',
      feedback: summaryFeedback, // ✅ FIXED: Real comprehensive summary, not placeholder
      implementationEffort: 'medium',
      businessImpact: 'medium',
      imageIndex: 0
    });
  }
  
  console.log(`✅ Final result: Created ${annotations.length} annotations with comprehensive feedback`);
  console.log('Feedback quality check:', annotations.map((a, i) => ({
    index: i + 1,
    feedbackLength: a.feedback.length,
    isPlaceholder: a.feedback.includes('Feedback not provided') || a.feedback.includes('Analysis insight'),
    feedbackPreview: a.feedback.substring(0, 100) + '...'
  })));
  
  return annotations;
}
