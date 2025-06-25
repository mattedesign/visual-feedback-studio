
import { AnnotationData } from '../types.ts';

export function parseClaudeResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    console.log('=== Parsing Claude Response ===');
    console.log('Raw response length:', content.length);
    console.log('Response preview:', content.substring(0, 200));
    
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
        
        // Validate and clean annotations
        const validAnnotations = annotations.filter((ann: any) => {
          return typeof ann.x === 'number' && 
                 typeof ann.y === 'number' && 
                 ann.category && 
                 ann.severity && 
                 ann.feedback;
        });
        
        if (validAnnotations.length === 0) {
          console.warn('No valid annotations found, parsing detailed response');
          return parseDetailedAnalysis(content);
        }
        
        console.log(`Returning ${validAnnotations.length} valid annotations`);
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
  console.log('Parsing detailed markdown analysis into annotations');
  
  const annotations: AnnotationData[] = [];
  
  // Extract key insights from the detailed analysis
  const sections = content.split(/#{1,3}\s+/);
  let yPosition = 20;
  
  for (const section of sections) {
    if (section.length < 50) continue; // Skip short sections
    
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length === 0) continue;
    
    const title = lines[0].replace(/[*#]/g, '').trim();
    const sectionContent = lines.slice(1).join(' ').trim();
    
    if (sectionContent.length < 100) continue; // Skip sections without enough content
    
    // Determine category and severity based on keywords
    let category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand' = 'ux';
    let severity: 'critical' | 'suggested' | 'enhancement' = 'suggested';
    let implementationEffort: 'low' | 'medium' | 'high' = 'medium';
    let businessImpact: 'low' | 'medium' | 'high' = 'medium';
    
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
    
    // Determine severity based on keywords
    if (contentLower.includes('critical') || contentLower.includes('must') || contentLower.includes('required')) {
      severity = 'critical';
    } else if (contentLower.includes('enhance') || contentLower.includes('improve') || contentLower.includes('consider')) {
      severity = 'enhancement';
    }
    
    // Create annotation with extracted insights
    const feedback = `${title}: ${sectionContent.substring(0, 200)}${sectionContent.length > 200 ? '...' : ''}`;
    
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
  
  // If we couldn't extract any good annotations, create a summary annotation
  if (annotations.length === 0) {
    console.log('Creating summary annotation from detailed analysis');
    
    const summaryText = content.length > 300 
      ? content.substring(0, 300) + '...'
      : content;
    
    annotations.push({
      x: 50,
      y: 30,
      category: 'ux',
      severity: 'suggested', 
      feedback: `Comprehensive UX analysis completed. Key insights: ${summaryText}`,
      implementationEffort: 'medium',
      businessImpact: 'medium',
      imageIndex: 0
    });
  }
  
  console.log(`Created ${annotations.length} annotations from detailed analysis`);
  return annotations;
}
