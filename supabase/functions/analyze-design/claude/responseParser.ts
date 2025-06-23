
import { AnnotationData } from '../types.ts';

export function parseClaudeResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    console.log('Raw AI response content preview:', content.substring(0, 300));
    
    // Look for JSON array in the response
    let jsonMatch = content.match(/\[[\s\S]*?\]/);
    
    if (!jsonMatch) {
      // Try alternative patterns
      jsonMatch = content.match(/```json\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }
    
    if (jsonMatch) {
      let annotations;
      try {
        annotations = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Attempted to parse:', jsonMatch[0].substring(0, 200));
        throw new Error('Invalid JSON format in AI response');
      }
      
      console.log('Successfully parsed annotations:', annotations.length);
      
      // Basic validation
      const validAnnotations = annotations.filter((ann: any) => {
        return typeof ann.x === 'number' && 
               typeof ann.y === 'number' && 
               ann.category && 
               ann.severity && 
               ann.feedback;
      });
      
      if (validAnnotations.length === 0) {
        throw new Error('No valid annotations found in response');
      }
      
      console.log(`Returning ${validAnnotations.length} valid annotations`);
      return validAnnotations;
    } else {
      console.error('No JSON array found in AI response');
      console.log('Full content for debugging:', content.substring(0, 500));
      throw new Error('No JSON array found in response');
    }
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    
    // Return a helpful error annotation
    return [
      {
        x: 50,
        y: 30,
        category: 'ux',
        severity: 'critical', 
        feedback: `AI analysis failed: ${parseError.message}. Please try again.`,
        implementationEffort: 'low',
        businessImpact: 'high'
      }
    ];
  }
}
