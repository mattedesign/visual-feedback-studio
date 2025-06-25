
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
        
        // Validate and enhance annotations with research context indicators
        const validAnnotations = annotations.filter((ann: any) => {
          return typeof ann.x === 'number' && 
                 typeof ann.y === 'number' && 
                 ann.category && 
                 ann.severity && 
                 ann.feedback;
        }).map((ann: any) => {
          // Check if feedback contains research-backed content
          const hasResearchContent = ann.feedback && (
            ann.feedback.includes('research') ||
            ann.feedback.includes('best practice') ||
            ann.feedback.includes('studies') ||
            ann.feedback.includes('methodology') ||
            ann.feedback.includes('according to') ||
            ann.feedback.includes('evidence')
          );
          
          if (hasResearchContent) {
            console.log(`✅ Annotation contains research-backed content: "${ann.feedback.substring(0, 100)}..."`);
          }
          
          return ann;
        });
        
        if (validAnnotations.length === 0) {
          console.warn('No valid annotations found, parsing detailed response');
          return parseDetailedAnalysis(content);
        }
        
        console.log(`Returning ${validAnnotations.length} valid annotations`);
        console.log('Research-enhanced annotations:', validAnnotations.filter(ann => 
          ann.feedback.includes('research') || ann.feedback.includes('best practice')
        ).length);
        
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
  console.log('Parsing detailed analysis into research-backed annotations');
  
  const annotations: AnnotationData[] = [];
  
  // Extract key insights from the detailed analysis with focus on research content
  const sections = content.split(/#{1,3}\s+/);
  let yPosition = 20;
  
  for (const section of sections) {
    if (section.length < 50) continue; // Skip short sections
    
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length === 0) continue;
    
    const title = lines[0].replace(/[*#]/g, '').trim();
    const sectionContent = lines.slice(1).join(' ').trim();
    
    if (sectionContent.length < 100) continue; // Skip sections without enough content
    
    // Prioritize research-backed content
    const hasResearchContent = sectionContent.toLowerCase().includes('research') ||
                              sectionContent.toLowerCase().includes('best practice') ||
                              sectionContent.toLowerCase().includes('studies') ||
                              sectionContent.toLowerCase().includes('methodology') ||
                              sectionContent.toLowerCase().includes('according to');
    
    // Determine category and severity based on keywords
    let category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand' = 'ux';
    let severity: 'critical' | 'suggested' | 'enhancement' = hasResearchContent ? 'suggested' : 'enhancement';
    let implementationEffort: 'low' | 'medium' | 'high' = 'medium';
    let businessImpact: 'low' | 'medium' | 'high' = hasResearchContent ? 'high' : 'medium';
    
    const titleLower = title.toLowerCase();
    const contentLower = sectionContent.toLowerCase();
    
    // Categorize based on keywords
    if (titleLower.includes('accessibility') || contentLower.includes('wcag') || contentLower.includes('contrast')) {
      category = 'accessibility';
      severity = 'critical';
      businessImpact = 'high';
    } else if (titleLower.includes('conversion') || contentLower.includes('cta') || contentLower.includes('button')) {
      category = 'conversion';
      businessImpact = 'high';
    } else if (titleLower.includes('visual') || contentLower.includes('color') || contentLower.includes('typography')) {
      category = 'visual';
    } else if (titleLower.includes('brand')) {
      category = 'brand';
    }
    
    // Determine severity based on keywords and research backing
    if (contentLower.includes('critical') || contentLower.includes('must') || contentLower.includes('required')) {
      severity = 'critical';
    } else if (hasResearchContent && (contentLower.includes('recommend') || contentLower.includes('should'))) {
      severity = 'suggested';
    } else if (contentLower.includes('enhance') || contentLower.includes('improve') || contentLower.includes('consider')) {
      severity = 'enhancement';
    }
    
    // Create annotation with research-enhanced feedback
    let feedback = `${title}: ${sectionContent.substring(0, 200)}${sectionContent.length > 200 ? '...' : ''}`;
    
    if (hasResearchContent) {
      feedback = `[Research-backed] ${feedback}`;
      console.log(`✅ Created research-backed annotation: "${title}"`);
    }
    
    annotations.push({
      x: 30 + (annotations.length * 15) % 40, // Spread annotations horizontally
      y: yPosition,
      category,
      severity,
      feedback,
      implementationEffort,
      businessImpact,
      imageIndex: 0
    });
    
    yPosition += 20;
    if (yPosition > 80) yPosition = 20; // Wrap around
    
    // Limit to 5 annotations to avoid clutter
    if (annotations.length >= 5) break;
  }
  
  // If we couldn't extract any good annotations, create a research-focused summary annotation
  if (annotations.length === 0) {
    console.log('Creating research-focused summary annotation from detailed analysis');
    
    const summaryText = content.length > 300 
      ? content.substring(0, 300) + '...'
      : content;
    
    const hasResearchInSummary = summaryText.toLowerCase().includes('research') ||
                                summaryText.toLowerCase().includes('best practice') ||
                                summaryText.toLowerCase().includes('methodology');
    
    annotations.push({
      x: 50,
      y: 30,
      category: 'ux',
      severity: hasResearchInSummary ? 'suggested' : 'enhancement', 
      feedback: hasResearchInSummary 
        ? `[Research-enhanced] Comprehensive UX analysis completed with evidence-based insights: ${summaryText}`
        : `Comprehensive UX analysis completed. Key insights: ${summaryText}`,
      implementationEffort: 'medium',
      businessImpact: hasResearchInSummary ? 'high' : 'medium',
      imageIndex: 0
    });
  }
  
  console.log(`Created ${annotations.length} annotations from detailed analysis`);
  console.log('Research-backed annotations:', annotations.filter(ann => 
    ann.feedback.includes('[Research-backed]') || ann.feedback.includes('[Research-enhanced]')
  ).length);
  
  return annotations;
}
