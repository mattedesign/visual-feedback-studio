
import { AnnotationData } from '../types.ts';

export function parseClaudeResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    console.log('=== Parsing Claude Response with Title/Description Separation ===');
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
        
        // ✅ ENHANCED: Process annotations with title/description separation
        const validAnnotations = annotations.filter((ann: any) => {
          return typeof ann.x === 'number' && 
                 typeof ann.y === 'number' && 
                 ann.category && 
                 ann.severity;
        }).map((ann: any) => {
          // ✅ NEW: Extract title and description separately
          let title = '';
          let description = '';
          
          // Try to get title and description from separate fields first
          if (ann.title && ann.description) {
            title = ann.title;
            description = ann.description;
          } else if (ann.title) {
            title = ann.title;
            description = ann.description || ann.feedback || ann.content || 'Improvement needed';
          } else if (ann.description) {
            // Extract title from description if no separate title
            const descLines = ann.description.split(/[:.]/);
            if (descLines.length > 1 && descLines[0].length < 60) {
              title = descLines[0].trim();
              description = descLines.slice(1).join('. ').trim();
            } else {
              title = ann.description.length > 50 ? 
                ann.description.substring(0, 50).trim() + '...' : 
                ann.description;
              description = ann.description;
            }
          } else {
            // Fallback: extract from feedback or other fields
            const feedbackContent = ann.feedback || ann.content || ann.text || ann.message || 'UX Issue';
            
            // Try to split feedback into title and description
            if (feedbackContent.includes(':')) {
              const parts = feedbackContent.split(':');
              title = parts[0].trim();
              description = parts.slice(1).join(':').trim();
            } else {
              // Split by sentences or length
              const sentences = feedbackContent.split(/[.!?]/);
              if (sentences.length > 1 && sentences[0].length < 80) {
                title = sentences[0].trim();
                description = sentences.slice(1).join('. ').trim();
              } else {
                title = feedbackContent.length > 50 ? 
                  feedbackContent.substring(0, 50).trim() + '...' : 
                  feedbackContent;
                description = feedbackContent;
              }
            }
          }
          
          // Ensure title is concise (3-8 words ideally)
          if (title.split(' ').length > 10) {
            title = title.split(' ').slice(0, 8).join(' ') + '...';
          }
          
          // Create combined feedback for backward compatibility
          const combinedFeedback = `${title}: ${description}`;
          
          console.log(`✅ Created annotation with title: "${title}" and description: "${description.substring(0, 100)}..."`);
          
          return {
            x: ann.x,
            y: ann.y,
            category: ann.category,
            severity: ann.severity,
            title: title,
            description: description,
            feedback: combinedFeedback, // Backward compatibility
            implementationEffort: ann.implementationEffort || 'medium',
            businessImpact: ann.businessImpact || 'medium',
            imageIndex: ann.imageIndex || 0
          };
        });
        
        if (validAnnotations.length === 0) {
          console.warn('No valid annotations found, parsing detailed response');
          return parseDetailedAnalysis(content);
        }
        
        console.log(`✅ Returning ${validAnnotations.length} valid annotations with separate title/description`);
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
  console.log('✅ ENHANCED: Parsing detailed analysis with title/description separation');
  
  const annotations: AnnotationData[] = [];
  
  // ✅ IMPROVED: Extract comprehensive insights with title/description separation
  const sections = content.split(/#{1,3}\s+/);
  let yPosition = 20;
  
  for (const section of sections) {
    if (section.length < 50) continue; // Skip short sections
    
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length === 0) continue;
    
    const potentialTitle = lines[0].replace(/[*#]/g, '').trim();
    const sectionContent = lines.slice(1).join(' ').trim();
    
    if (sectionContent.length < 30) continue; // Skip sections without enough content
    
    // ✅ NEW: Create proper title and description
    let title = '';
    let description = '';
    
    // Clean and process title
    if (potentialTitle.length > 0) {
      title = potentialTitle.length > 60 ? 
        potentialTitle.substring(0, 60).trim() + '...' : 
        potentialTitle;
      
      // Ensure title is concise
      if (title.split(' ').length > 8) {
        title = title.split(' ').slice(0, 8).join(' ') + '...';
      }
    } else {
      title = 'UX Improvement Needed';
    }
    
    // Create comprehensive description
    if (sectionContent.length > 0) {
      description = sectionContent;
    } else {
      description = 'This area requires attention to improve user experience and usability.';
    }
    
    // ✅ ENHANCED: Extract actionable insights for description
    const actionableInsights = [];
    const recommendationPatterns = [
      /recommend[s]?\s+([^.]+)/gi,
      /suggest[s]?\s+([^.]+)/gi,
      /should\s+([^.]+)/gi,
      /consider\s+([^.]+)/gi,
      /improve\s+([^.]+)/gi,
    ];
    
    recommendationPatterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        matches.forEach(match => {
          actionableInsights.push(match.trim());
        });
      }
    });
    
    // Enhance description with actionable insights
    if (actionableInsights.length > 0) {
      description += ` Key recommendations: ${actionableInsights.slice(0, 2).join('; ')}`;
    }
    
    // Create combined feedback for backward compatibility
    const combinedFeedback = `${title}: ${description}`;
    
    // Determine category and severity based on keywords
    let category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand' = 'ux';
    let severity: 'critical' | 'suggested' | 'enhancement' = 'suggested';
    
    const titleLower = title.toLowerCase();
    const contentLower = description.toLowerCase();
    
    // ✅ ENHANCED: Better categorization
    if (titleLower.includes('accessibility') || contentLower.includes('wcag') || contentLower.includes('contrast')) {
      category = 'accessibility';
      severity = 'critical';
    } else if (titleLower.includes('conversion') || contentLower.includes('cta') || contentLower.includes('button')) {
      category = 'conversion';
    } else if (titleLower.includes('visual') || contentLower.includes('color') || contentLower.includes('typography')) {
      category = 'visual';
    } else if (titleLower.includes('brand')) {
      category = 'brand';
    }
    
    console.log(`✅ Created detailed annotation: "${title}" with ${description.length} char description`);
    
    annotations.push({
      x: 30 + (annotations.length * 15) % 40,
      y: yPosition,
      category,
      severity,
      title: title,
      description: description,
      feedback: combinedFeedback, // Backward compatibility
      implementationEffort: 'medium',
      businessImpact: 'medium',
      imageIndex: 0
    });
    
    yPosition += 20;
    if (yPosition > 80) yPosition = 20;
    
    if (annotations.length >= 6) break;
  }
  
  // ✅ ENHANCED: Fallback summary annotation with proper title/description
  if (annotations.length === 0) {
    const meaningfulContent = content
      .replace(/[#*]/g, '')
      .split('\n')
      .filter(line => line.trim().length > 20)
      .slice(0, 5)
      .join(' ')
      .substring(0, 300) + '...';
    
    annotations.push({
      x: 50,
      y: 30,
      category: 'ux',
      severity: 'suggested',
      title: 'UX Analysis Summary',
      description: `Comprehensive analysis results: ${meaningfulContent}`,
      feedback: `UX Analysis Summary: Comprehensive analysis results: ${meaningfulContent}`,
      implementationEffort: 'medium',
      businessImpact: 'medium',
      imageIndex: 0
    });
  }
  
  console.log(`✅ Final result: Created ${annotations.length} annotations with proper title/description separation`);
  return annotations;
}
