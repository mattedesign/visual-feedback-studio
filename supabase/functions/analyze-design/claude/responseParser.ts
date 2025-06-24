
import { AnnotationData } from '../types.ts';

export function parseClaudeResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    console.log('=== Parsing Claude Response ===');
    console.log('Raw response length:', content.length);
    console.log('Response preview:', content.substring(0, 200));
    
    // Look for JSON array in the response with multiple patterns
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
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Failed to parse:', jsonMatch[0].substring(0, 300));
        
        // Create fallback annotation instead of failing
        console.log('Creating fallback annotation due to parse error');
        return createFallbackAnnotations(`JSON parsing failed: ${parseError.message}`);
      }
      
      // Basic validation with fallback
      const validAnnotations = annotations.filter((ann: any) => {
        return typeof ann.x === 'number' && 
               typeof ann.y === 'number' && 
               ann.category && 
               ann.severity && 
               ann.feedback;
      });
      
      if (validAnnotations.length === 0) {
        console.warn('No valid annotations found, creating fallback');
        return createFallbackAnnotations('No valid annotations found in AI response');
      }
      
      console.log(`Returning ${validAnnotations.length} valid annotations`);
      return validAnnotations;
    } else {
      console.error('No JSON array found in AI response');
      console.log('Full content sample:', content.substring(0, 500));
      
      // Create fallback annotation instead of failing
      return createFallbackAnnotations('No JSON array found in AI response');
    }
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    
    // Create fallback annotation for any parsing error
    return createFallbackAnnotations(`Response parsing failed: ${parseError.message}`);
  }
}

function createFallbackAnnotations(errorMessage: string): AnnotationData[] {
  console.log('Creating fallback annotations due to error:', errorMessage);
  
  return [
    {
      x: 50,
      y: 30,
      category: 'ux',
      severity: 'medium', 
      feedback: `Analysis completed but encountered a parsing issue: ${errorMessage}. The AI analysis ran successfully, but the response format needs attention. Please try the analysis again.`,
      implementationEffort: 'low',
      businessImpact: 'medium'
    }
  ];
}
