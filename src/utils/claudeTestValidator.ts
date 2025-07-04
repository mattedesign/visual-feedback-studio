// 🧪 CLAUDE IMAGE ANALYSIS TEST VALIDATOR
export interface TestResult {
  success: boolean;
  annotationCount: number;
  uniqueFeedbackCount: number;
  hasGenericFeedback: boolean;
  averageFeedbackLength: number;
  issues: string[];
  recommendations: string[];
}

export function validateClaudeResponse(annotations: any[]): TestResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check annotation count
  if (annotations.length < 12) {
    issues.push(`Only ${annotations.length} annotations (expected 12-16)`);
  }
  
  // Check for generic feedback
  const genericPatterns = [
    'Design improvement opportunity identified',
    'Analysis insight',
    'Consider improving',
    'This element could be enhanced'
  ];
  
  const genericFeedback = annotations.filter(a => 
    genericPatterns.some(pattern => a.feedback?.includes(pattern))
  );
  
  if (genericFeedback.length > 0) {
    issues.push(`${genericFeedback.length} annotations contain generic feedback`);
  }
  
  // Check for unique feedback
  const feedbackTexts = annotations.map(a => a.feedback);
  const uniqueFeedback = new Set(feedbackTexts);
  
  if (uniqueFeedback.size !== feedbackTexts.length) {
    issues.push(`Duplicate feedback found (${uniqueFeedback.size} unique out of ${feedbackTexts.length})`);
  }
  
  // Check feedback length
  const averageLength = feedbackTexts.reduce((sum, text) => sum + (text?.length || 0), 0) / feedbackTexts.length;
  
  if (averageLength < 30) {
    issues.push(`Average feedback too short (${averageLength.toFixed(1)} chars)`);
  }
  
  // Generate recommendations
  if (issues.length > 0) {
    recommendations.push('Review system prompt for specificity');
    recommendations.push('Check image data quality and encoding');
    recommendations.push('Verify Claude model is receiving image correctly');
  }
  
  return {
    success: issues.length === 0,
    annotationCount: annotations.length,
    uniqueFeedbackCount: uniqueFeedback.size,
    hasGenericFeedback: genericFeedback.length > 0,
    averageFeedbackLength: averageLength,
    issues,
    recommendations
  };
}

// 🔍 ENHANCED LOGGING SYSTEM
export function logAnalysisAttempt(analysisId: string, inputData: {
  imageSize: number;
  mimeType: string;
  model: string;
  promptLength: number;
}) {
  console.log(`🚀 Starting Claude analysis [${analysisId}]`);
  console.log('📊 Input validation:');
  console.log(`   Image size: ${inputData.imageSize} chars`);
  console.log(`   MIME type: ${inputData.mimeType}`);
  console.log(`   Model: ${inputData.model}`);
  console.log(`   Prompt length: ${inputData.promptLength} chars`);
}

export function logAnalysisResult(analysisId: string, result: {
  success: boolean;
  processingTime: number;
  annotationCount: number;
  validation?: TestResult;
}) {
  if (result.success) {
    console.log(`✅ Claude API success [${analysisId}]`);
    console.log(`   Processing time: ${result.processingTime}ms`);
    console.log(`   Annotations generated: ${result.annotationCount}`);
    
    if (result.validation && !result.validation.success) {
      console.warn(`⚠️ Quality issues detected [${analysisId}]:`);
      result.validation.issues.forEach(issue => console.warn(`   - ${issue}`));
    }
  } else {
    console.error(`❌ Claude API failed [${analysisId}]`);
  }
}