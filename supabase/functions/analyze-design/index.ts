import { corsHeaders, corsHandler } from './corsHandler.ts';
import { requestValidator } from './requestValidator.ts';
import { imageProcessingManager } from './imageProcessingManager.ts';
import { analyzeWithAIProvider, determineOptimalProvider } from './aiProviderRouter.ts';
import { databaseManager } from './databaseManager.ts';
import { responseFormatter } from './responseFormatter.ts';
import { enhancedResponseFormatter } from './enhancedResponseFormatter.ts';
import { errorHandler } from './errorHandler.ts';
import { environmentValidator, validateEnvironment } from './environmentValidator.ts';
import { buildAnalysisPrompt } from './promptBuilder.ts';
import { buildEnhancedAnalysisPrompt } from './enhancedPromptBuilder.ts';
import { buildCompetitiveIntelligence, checkCompetitivePatternsDatabase, CompetitiveIntelligence } from './competitiveIntelligence.ts';
import { EnhancedAnalysisIntegrator } from './enhancedAnalysisIntegrator.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

console.log('🚀 Design Analysis Function Starting with Enhanced Vision Integration - ENHANCED CONTEXT UPDATE v1');

// Enhanced RAG helper function with comprehensive logging and error handling
async function addKnowledgeContext(prompt: string, supabase: any, enableRAG = false): Promise<{
  enhancedPrompt: string;
  researchEnhanced: boolean;
  knowledgeSourcesUsed: number;
  researchCitations: string[];
}> {
  console.log('🔍 === RAG CONTEXT BUILDING START ===');
  console.log(`📋 RAG Configuration:`, {
    enableRAG,
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 100) + '...',
    timestamp: new Date().toISOString()
  });

  if (!enableRAG) {
    console.log('⚠️ RAG disabled by configuration, using standard prompt');
    return {
      enhancedPrompt: prompt,
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: []
    };
  }

  try {
    console.log('🧠 Starting embedding generation process...');
    
    // Check OpenAI API key availability
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.log('❌ CRITICAL: No OpenAI API key found for embedding generation');
      console.log('🔧 RAG requires OpenAI API key for semantic search');
      return {
        enhancedPrompt: prompt,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        researchCitations: []
      };
    }
    
    console.log('✅ OpenAI API key available for embedding generation');
    console.log(`🔑 API key preview: ${openaiApiKey.substring(0, 10)}...`);
    
    // Generate embedding with detailed logging
    console.log('📡 Calling OpenAI Embeddings API...');
    const embeddingStartTime = Date.now();
    
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: prompt,
        encoding_format: 'float'
      }),
    });
    
    const embeddingDuration = Date.now() - embeddingStartTime;
    console.log(`⏱️ Embedding API call completed in ${embeddingDuration}ms`);
    console.log(`📊 Embedding API response status: ${embeddingResponse.status}`);
    
    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.log('❌ EMBEDDING API ERROR:', {
        status: embeddingResponse.status,
        statusText: embeddingResponse.statusText,
        error: errorText.substring(0, 200),
        apiKeyPreview: openaiApiKey.substring(0, 10) + '...'
      });
      
      // Fallback handling
      console.log('🔄 Falling back to standard analysis due to embedding failure');
      return {
        enhancedPrompt: prompt,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        researchCitations: []
      };
    }
    
    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    console.log(`✅ Generated embedding successfully:`, {
      dimensions: embedding.length,
      model: embeddingData.model || 'text-embedding-3-small',
      usage: embeddingData.usage
    });
    
    // Query knowledge base with detailed logging
    console.log('🔍 Querying knowledge base with semantic search...');
    const dbQueryStartTime = Date.now();
    
    const { data: knowledge, error } = await supabase.rpc('match_knowledge', {
      query_embedding: `[${embedding.join(',')}]`,
      match_threshold: 0.3,
      match_count: 5,
      filter_category: null
    });
    
    const dbQueryDuration = Date.now() - dbQueryStartTime;
    console.log(`⏱️ Database query completed in ${dbQueryDuration}ms`);
    
    if (error) {
      console.log('❌ DATABASE QUERY ERROR:', {
        error: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
      
      // Fallback handling
      console.log('🔄 Falling back to standard analysis due to database error');
      return {
        enhancedPrompt: prompt,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0,
        researchCitations: []
      };
    }
    
    console.log(`📊 Knowledge base query results:`, {
      entriesFound: knowledge?.length || 0,
      queryThreshold: 0.3,
      maxResults: 5
    });
    
    if (knowledge && knowledge.length > 0) {
      console.log('✅ RAG KNOWLEDGE RETRIEVAL SUCCESSFUL');
      console.log('📚 Retrieved knowledge entries:');
      
      knowledge.forEach((k: any, index: number) => {
        console.log(`   ${index + 1}. "${k.title}" (${k.category}) - Similarity: ${k.similarity?.toFixed(3) || 'N/A'}`);
        console.log(`      Content preview: ${k.content.substring(0, 100)}...`);
      });
      
      // Build comprehensive research context
      const researchContext = knowledge.map((k: any, index: number) => 
        `**${index + 1}. ${k.title}** (Category: ${k.category}, Relevance: ${k.similarity?.toFixed(2) || 'N/A'})
${k.content.substring(0, 400)}${k.content.length > 400 ? '...' : ''}

---`
      ).join('\n\n');
      
      const citations = knowledge.map((k: any) => k.title);
      
      console.log('🎯 RAG CONTEXT BUILDING SUCCESS:', {
        knowledgeEntries: knowledge.length,
        totalContextLength: researchContext.length,
        citationsCount: citations.length,
        averageSimilarity: (knowledge.reduce((sum: number, k: any) => sum + (k.similarity || 0), 0) / knowledge.length).toFixed(3)
      });

      // CRITICAL: Log the actual research context being returned
      console.log('📋 === RESEARCH CONTEXT BEING RETURNED ===');
      console.log('🔍 Research Context Preview (first 500 chars):');
      console.log(researchContext.substring(0, 500) + (researchContext.length > 500 ? '...' : ''));
      console.log('📏 Research Context Metrics:', {
        fullLength: researchContext.length,
        numberOfEntries: knowledge.length,
        averageEntryLength: Math.round(researchContext.length / knowledge.length),
        containsFittsLaw: researchContext.toLowerCase().includes('fitts'),
        containsButtonGuidelines: researchContext.toLowerCase().includes('button'),
        containsMobileUsability: researchContext.toLowerCase().includes('mobile')
      });
      
      console.log('🔍 === RAG CONTEXT BUILDING COMPLETE ===');
      
      return {
        enhancedPrompt: researchContext,
        researchEnhanced: true,
        knowledgeSourcesUsed: knowledge.length,
        researchCitations: citations
      };
    }
    
    console.log('⚠️ No relevant knowledge found in database');
    console.log('💡 This might indicate:');
    console.log('   - Knowledge base is empty');
    console.log('   - Query threshold too high (0.3)');
    console.log('   - Semantic mismatch between query and knowledge');
    
    return {
      enhancedPrompt: prompt,
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: []
    };
    
  } catch (error) {
    console.log('❌ RAG CONTEXT BUILDING FAILED:', {
      error: error.message,
      stack: error.stack?.substring(0, 500),
      timestamp: new Date().toISOString()
    });
    
    console.log('🔄 Implementing fallback to standard analysis');
    
    return {
      enhancedPrompt: prompt,
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: []
    };
  }
}

// Function to check and report on knowledge base status
async function checkKnowledgeBase(supabase: any): Promise<void> {
  try {
    console.log('📊 Checking knowledge base status...');
    
    // Count total knowledge entries
    const { count: totalEntries, error: countError } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Error counting knowledge entries:', countError);
      return;
    }
    
    console.log(`📈 Total knowledge entries in database: ${totalEntries || 0}`);
    
    if (totalEntries === 0) {
      console.log('⚠️ WARNING: No knowledge entries found in database!');
      console.log('💡 Consider populating the knowledge base for RAG functionality');
      return;
    }
    
    // Get sample entries by category
    const { data: sampleEntries, error: sampleError } = await supabase
      .from('knowledge_entries')
      .select('id, title, category, created_at')
      .limit(10);
    
    if (sampleError) {
      console.log('❌ Error fetching sample entries:', sampleError);
      return;
    }
    
    if (sampleEntries && sampleEntries.length > 0) {
      console.log('📋 Sample knowledge entries:');
      sampleEntries.forEach((entry: any, index: number) => {
        console.log(`   ${index + 1}. [${entry.category}] ${entry.title}`);
      });
      
      // Count by category
      const { data: categoryStats, error: statsError } = await supabase
        .from('knowledge_entries')
        .select('category')
        .then(({ data, error }) => {
          if (error) return { data: null, error };
          const stats = data?.reduce((acc: any, entry: any) => {
            acc[entry.category] = (acc[entry.category] || 0) + 1;
            return acc;
          }, {});
          return { data: stats, error: null };
        });
      
      if (categoryStats) {
        console.log('📊 Knowledge entries by category:', categoryStats);
      }
    }
    
  } catch (error) {
    console.log('❌ Error checking knowledge base:', error);
  }
}

// NEW: Function to process vision context and build enhanced system prompt
function buildVisionEnhancedPrompt(originalPrompt: string, visionContext: any): string {
  console.log('👁️ === BUILDING VISION ENHANCED PROMPT ===');
  
  if (!visionContext || !visionContext.visionAnalysis) {
    console.log('⚠️ No vision context provided, using original prompt');
    return originalPrompt;
  }
  
  const vision = visionContext.visionAnalysis;
  console.log('🔍 Vision context received:', {
    uiElementsCount: vision.uiElements?.length || 0,
    layoutType: vision.layout?.type || 'unknown',
    industryDetected: vision.industry?.industry || 'unknown',
    deviceType: vision.deviceType?.type || 'unknown',
    accessibilityIssues: vision.accessibility?.length || 0,
    confidenceScore: visionContext.confidenceScore || 0
  });
  
  // Build comprehensive vision summary
  let visionSummary = `\n\n=== GOOGLE VISION ANALYSIS SUMMARY ===\n`;
  
  // Device and Layout Context
  if (vision.deviceType) {
    visionSummary += `🖥️ DEVICE TYPE: ${vision.deviceType.type} (${Math.round(vision.deviceType.confidence * 100)}% confidence)\n`;
    visionSummary += `   Dimensions: ${vision.deviceType.dimensions?.width || 'N/A'}x${vision.deviceType.dimensions?.height || 'N/A'}px\n`;
  }
  
  if (vision.layout) {
    visionSummary += `🏗️ LAYOUT: ${vision.layout.type} layout (${Math.round(vision.layout.confidence * 100)}% confidence)\n`;
    visionSummary += `   Description: ${vision.layout.description || 'Standard layout'}\n`;
  }
  
  // Industry Context
  if (vision.industry) {
    visionSummary += `🏢 INDUSTRY: ${vision.industry.industry} (${Math.round(vision.industry.confidence * 100)}% confidence)\n`;
    if (vision.industry.indicators && vision.industry.indicators.length > 0) {
      visionSummary += `   Key indicators: ${vision.industry.indicators.slice(0, 3).join(', ')}\n`;
    }
  }
  
  // UI Elements Analysis
  if (vision.uiElements && vision.uiElements.length > 0) {
    const elementCounts = vision.uiElements.reduce((counts: any, element: any) => {
      counts[element.type] = (counts[element.type] || 0) + 1;
      return counts;
    }, {});
    
    visionSummary += `🎯 UI ELEMENTS DETECTED (${vision.uiElements.length} total):\n`;
    Object.entries(elementCounts).forEach(([type, count]) => {
      visionSummary += `   - ${count} ${type}${count > 1 ? 's' : ''}\n`;
    });
    
    // Highlight specific elements with text
    const elementsWithText = vision.uiElements
      .filter((el: any) => el.text && el.text.length > 0)
      .slice(0, 5);
    
    if (elementsWithText.length > 0) {
      visionSummary += `   Key element texts: ${elementsWithText.map((el: any) => `"${el.text}"`).join(', ')}\n`;
    }
  }
  
  // Accessibility Issues
  if (vision.accessibility && vision.accessibility.length > 0) {
    const highPriorityIssues = vision.accessibility.filter((issue: any) => issue.severity === 'high');
    const mediumPriorityIssues = vision.accessibility.filter((issue: any) => issue.severity === 'medium');
    
    visionSummary += `⚠️ ACCESSIBILITY ISSUES FOUND (${vision.accessibility.length} total):\n`;
    if (highPriorityIssues.length > 0) {
      visionSummary += `   - ${highPriorityIssues.length} HIGH priority issues\n`;
    }
    if (mediumPriorityIssues.length > 0) {
      visionSummary += `   - ${mediumPriorityIssues.length} MEDIUM priority issues\n`;
    }
    
    // List top 3 issues
    vision.accessibility.slice(0, 3).forEach((issue: any, index: number) => {
      visionSummary += `   ${index + 1}. ${issue.type}: ${issue.description}\n`;
    });
  }
  
  // Color Analysis
  if (vision.colors) {
    visionSummary += `🎨 COLOR ANALYSIS:\n`;
    if (vision.colors.dominantColors && vision.colors.dominantColors.length > 0) {
      visionSummary += `   Dominant colors: ${vision.colors.dominantColors.slice(0, 3).join(', ')}\n`;
    }
    if (vision.colors.colorContrast) {
      visionSummary += `   Contrast ratio: ${vision.colors.colorContrast.textBackground}:1 (${vision.colors.colorContrast.accessibility})\n`;
    }
  }
  
  // Overall Confidence
  if (visionContext.confidenceScore) {
    visionSummary += `📊 OVERALL ANALYSIS CONFIDENCE: ${Math.round(visionContext.confidenceScore * 100)}%\n`;
  }
  
  visionSummary += `\n=== END VISION ANALYSIS ===\n\n`;
  
  // Enhanced system instructions
  const enhancedInstructions = `
IMPORTANT: Use the Google Vision analysis above to provide highly specific, actionable feedback. 

When analyzing the design:
1. Reference the specific UI elements detected (buttons, forms, navigation, etc.)
2. Consider the detected industry context for relevant best practices
3. Address the accessibility issues identified with priority on high-severity items
4. Provide layout-specific recommendations based on the detected layout type
5. Consider device-type optimization recommendations
6. Reference specific color and contrast issues found
7. Use research-backed recommendations when available

Your feedback should be precise, referencing actual detected elements rather than generic advice.
`;
  
  const finalPrompt = visionSummary + enhancedInstructions + originalPrompt;
  
  console.log('✅ Vision enhanced prompt built:', {
    originalLength: originalPrompt.length,
    visionSummaryLength: visionSummary.length,
    finalLength: finalPrompt.length,
    elementsReferenced: vision.uiElements?.length || 0,
    accessibilityIssuesIncluded: vision.accessibility?.length || 0
  });
  
  return finalPrompt;
}

// ✅ NEW: Enhanced function to build annotation instructions based on context
function buildAnnotationInstructions(imageCount: number, userAnnotations: any[], isEnhanced: boolean): string {
  console.log('🎯 Building annotation instructions:', {
    imageCount,
    userAnnotationsCount: userAnnotations?.length || 0,
    isEnhanced
  });

  const baseInstructions = `
ANNOTATION REQUIREMENTS:
- Provide 8-12 specific annotations per image
- Each annotation MUST include exact x,y coordinates (0-100 scale)
- Distribute annotations across ALL ${imageCount} image${imageCount > 1 ? 's' : ''}
- Include severity levels: critical, high, medium, low
- Categories: usability, accessibility, visual, conversion, mobile, content

${imageCount > 1 ? `
MULTI-IMAGE ANALYSIS:
- Analyze each image individually 
- Provide comparative insights between images
- Use imageIndex 0 to ${imageCount - 1} to specify which image each annotation targets
- Ensure annotations are distributed across all images, not just the first one
` : ''}

${isEnhanced ? `
RESEARCH-BACKED ANALYSIS INSTRUCTIONS:
- Reference specific UX research findings when applicable
- Cite accessibility guidelines (WCAG 2.1) for relevant issues
- Include conversion optimization insights from established research
- Mention industry best practices with authoritative sources
- Use phrases like "Research shows...", "Studies indicate...", "According to Nielsen..."
- Provide evidence-based recommendations, not just opinions
` : ''}

Provide your analysis as a JSON array of annotations with the following structure:
[
  {
    "id": "unique-id",
    "category": "usability|accessibility|visual-design|performance|conversion",
    "severity": "high|medium|low",
    "title": "Brief title",
    "description": "Detailed description with specific recommendations",
    "x": coordinate_number,
    "y": coordinate_number,
    "width": 50,
    "height": 50,
    "businessImpact": "How this affects business metrics",
    "quickFix": "Immediate action that can be taken"${imageCount > 1 ? ',\n    "imageIndex": 0' : ''}
  }
]

CRITICAL: Return ONLY the JSON array, no additional text or formatting.`;

  if (userAnnotations && userAnnotations.length > 0) {
    const userAnnotationsSection = `

USER ANNOTATIONS PROVIDED:
${userAnnotations.map((ua, i) => `${i + 1}. At (${ua.x}, ${ua.y}): "${ua.comment}"`).join('\n')}

Please acknowledge and build upon these user-identified areas in your analysis.`;
    
    console.log('✅ Added user annotations to instructions:', {
      userAnnotationsCount: userAnnotations.length
    });
    
    return baseInstructions + userAnnotationsSection;
  }

  console.log('✅ Built annotation instructions:', {
    totalLength: baseInstructions.length,
    includesMultiImage: imageCount > 1,
    includesResearchBacked: isEnhanced,
    includesUserAnnotations: false
  });

  return baseInstructions;
}

Deno.serve(async (req) => {
  console.log(`📥 ${req.method} ${req.url}`);
  
  try {
    // Handle CORS preflight
    const corsResponse = corsHandler.handle(req);
    if (corsResponse) {
      console.log('✅ CORS preflight handled');
      return corsResponse;
    }

    // Check if this is a test endpoint request
    const url = new URL(req.url);
    if (url.pathname.includes('/test') || url.searchParams.has('test')) {
      console.log('🧪 TEST ENDPOINT - Performing API key validation only');
      
      try {
        const envConfig = validateEnvironment();
        
        return new Response(JSON.stringify({
          success: true,
          message: 'API key validation test completed - check logs for details',
          environment: {
            supabaseConfigured: !!envConfig.supabaseUrl,
            openaiConfigured: envConfig.hasOpenAIKey,
            claudeConfigured: envConfig.hasClaudeKey,
            openaiValidation: envConfig.openaiKeyValidation,
            claudeValidation: envConfig.claudeKeyValidation
          },
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('❌ Test endpoint error:', error);
        return new Response(JSON.stringify({ 
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Validate environment before processing
    console.log('🔧 Validating environment configuration...');
    const envConfig = validateEnvironment();
    console.log('✅ Environment validation completed');

    // Validate request
    const validationResult = await requestValidator.validate(req);
    if (!validationResult.isValid) {
      console.error('❌ Request validation failed:', validationResult.error);
      return new Response(
        JSON.stringify({ error: validationResult.error }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const requestData = validationResult.data;
    console.log('✅ Request validated successfully');

    // ✅ CRITICAL FIX: Enhanced Request Body Parsing
    const { 
      imageUrls, 
      userAnnotations, 
      analysisPrompt, 
      deviceType,
      enhancedContext,     // ✅ ADD THIS
      ragEnhanced          // ✅ ADD THIS
    } = requestData;

    console.log('🚀 analyze-design: Starting analysis', {
      imageCount: imageUrls?.length || requestData.imagesToProcess?.length || 0,
      hasEnhancedContext: !!enhancedContext,     // ✅ ADD THIS
      ragEnhanced: !!ragEnhanced,                // ✅ ADD THIS
      promptLength: analysisPrompt?.length || 0,
      userAnnotationsCount: userAnnotations?.length || 0,
      visionElementsDetected: enhancedContext?.visionAnalysis?.uiElements?.length || 0,
      knowledgeSourcesUsed: enhancedContext?.knowledgeSourcesUsed || 0
    });

    // 🚨 CRITICAL: Calculate imageCount from validated request data
    const imageCount = requestData.imagesToProcess.length;
    
    console.log('🚨🚨🚨 URGENT MULTI-IMAGE DEBUG - Image Count Calculation:', {
      imageCount: imageCount,
      imagesToProcessLength: requestData.imagesToProcess.length,
      isMultiImage: imageCount > 1,
      requiresDistribution: imageCount > 1,
      criticalFix: 'ENSURING PROPER IMAGE COUNT PROPAGATION',
      timestamp: new Date().toISOString()
    });
    
    // Add validation that imageCount > 0
    if (imageCount === 0) {
      console.error('❌ No images provided for analysis');
      return new Response(
        JSON.stringify({ error: 'At least one image is required for analysis' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // NEW: Extract vision context from request
    const visionContext = requestData.enhancedContext || enhancedContext;
    console.log('👁️ === VISION CONTEXT PROCESSING ===');
    console.log('🔍 Vision context provided:', !!visionContext);
    if (visionContext) {
      console.log('📊 Vision context details:', {
        hasVisionAnalysis: !!visionContext.visionAnalysis,
        confidenceScore: visionContext.confidenceScore || 'N/A',
        knowledgeSourcesUsed: visionContext.knowledgeSourcesUsed || 0,
        citationsCount: visionContext.citations?.length || 0
      });
    }

    // Log analysis configuration with calculated imageCount
    console.log('🎯 Analysis Request Details:', {
      imageCount,
      isMultiImage: imageCount > 1,
      isComparative: requestData.isComparative || false,
      ragEnabled: requestData.ragEnabled || ragEnhanced || false,
      visionContextProvided: !!visionContext,
      analysisId: requestData.analysisId,
      imagesToProcess: requestData.imagesToProcess.length
    });

    // Process images
    console.log('🖼️ Processing images...');
    const imageProcessingResult = await imageProcessingManager.processImages(
      requestData.imagesToProcess,
      requestData.isComparative || false
    );

    if (!imageProcessingResult.success) {
      console.error('❌ Image processing failed:', imageProcessingResult.error);
      return new Response(
        JSON.stringify({ error: imageProcessingResult.error }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`✅ Images processed: ${imageProcessingResult.processedImages.length}`);

    // Initialize Supabase client for RAG integration and competitive intelligence
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check database status
    await checkKnowledgeBase(supabase);
    await checkCompetitivePatternsDatabase(supabase);

    // Determine AI provider configuration
    console.log('🤖 Determining AI provider...');
    const aiProviderConfig = determineOptimalProvider();
    
    // Process each image with AI provider
    const allAnnotations = [];
    let ragResults = {
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: [] as string[]
    };
    let competitiveResults: CompetitiveIntelligence = {
      relevantPatterns: [],
      industryBenchmarks: [],
      competitiveContext: '',
      totalPatterns: 0
    };
    
    // Enhanced RAG context building
    const enableRAG = requestData.ragEnabled === true || ragEnhanced === true;
    const enableCompetitive = requestData.competitiveEnabled !== false; // Enable by default
    const enableBusinessImpact = requestData.businessImpactEnabled !== false; // Enable by default
    const originalPrompt = requestData.analysisPrompt || analysisPrompt || 'Analyze this design for UX improvements';
    
    console.log(`🔧 === ENHANCED ANALYSIS WITH VISION INTEGRATION START ===`);
    console.log(`📋 Enhanced Analysis Configuration:`, {
      ragEnabled: enableRAG,
      competitiveEnabled: enableCompetitive,
      businessImpactEnabled: enableBusinessImpact,
      visionContextProvided: !!visionContext,
      originalPromptLength: originalPrompt.length,
      originalPromptPreview: originalPrompt.substring(0, 200) + '...',
      imageCount: imageCount,
      isComparative: requestData.isComparative || false,
      timestamp: new Date().toISOString()
    });
    
    // ✅ CRITICAL: Use enhanced prompt if available, with fallback
    const finalPrompt = enhancedContext?.enhancedPrompt || visionContext?.enhancedPrompt || originalPrompt;
    const isEnhanced = !!(enhancedContext || visionContext);

    console.log(`📝 Using ${isEnhanced ? 'ENHANCED (Vision + RAG)' : 'STANDARD'} prompt analysis`);
    console.log(`📏 Prompt length: ${finalPrompt.length} characters`);

    // NEW: Start with vision-enhanced prompt if available
    let currentPrompt = originalPrompt;
    if (visionContext) {
      console.log('👁️ === INTEGRATING VISION CONTEXT ===');
      currentPrompt = buildVisionEnhancedPrompt(originalPrompt, visionContext);
      console.log('✅ Vision context integrated into prompt');
    }
    
    // Build RAG context using the vision-enhanced prompt or enhanced context
    let ragContext;
    if (enhancedContext?.enhancedPrompt) {
      // Use pre-built enhanced context from request
      console.log('📋 Using pre-built enhanced context from request');
      ragContext = {
        enhancedPrompt: enhancedContext.enhancedPrompt,
        researchEnhanced: true,
        knowledgeSourcesUsed: enhancedContext.knowledgeSourcesUsed || 0,
        researchCitations: enhancedContext.citations || []
      };
    } else {
      // Build RAG context dynamically
      ragContext = await addKnowledgeContext(currentPrompt, supabase, enableRAG);
    }
    
    ragResults = {
      researchEnhanced: ragContext.researchEnhanced,
      knowledgeSourcesUsed: ragContext.knowledgeSourcesUsed,
      researchCitations: ragContext.researchCitations
    };
    
    console.log(`📚 === RAG CONTEXT RESULTS ===`, ragResults);
    
    // Build competitive intelligence context
    competitiveResults = await buildCompetitiveIntelligence(currentPrompt, supabase, enableCompetitive);
    
    console.log(`🏢 === COMPETITIVE INTELLIGENCE RESULTS ===`, {
      totalPatterns: competitiveResults.totalPatterns,
      competitiveContextLength: competitiveResults.competitiveContext.length,
      benchmarksCount: competitiveResults.industryBenchmarks.length,
      hasRelevantPatterns: competitiveResults.relevantPatterns.length > 0
    });
    
    // ✅ Build comprehensive annotation instructions using the new helper function
    const annotationInstructions = buildAnnotationInstructions(
      imageCount,
      userAnnotations || [],
      isEnhanced
    );

    console.log('🎯 Built annotation instructions:', {
      instructionsLength: annotationInstructions.length,
      imageCount,
      isEnhanced,
      hasUserAnnotations: (userAnnotations || []).length > 0
    });

    // ✅ Enhanced prompt includes research context and citations
    const fullAnalysisPrompt = `${finalPrompt}

${annotationInstructions}

${isEnhanced && (enhancedContext || visionContext) ? `
🔬 RESEARCH-ENHANCED ANALYSIS CONTEXT:
- Google Vision detected: ${(enhancedContext?.visionAnalysis || visionContext?.visionAnalysis)?.uiElements?.length || 0} UI elements
- Knowledge sources applied: ${ragResults.knowledgeSourcesUsed} research citations
- Industry context: ${(enhancedContext?.visionAnalysis || visionContext?.visionAnalysis)?.industry?.industry || 'general'}
- Analysis confidence: ${Math.round(((enhancedContext?.confidenceScore || visionContext?.confidenceScore) || 0) * 100)}%
- Search queries used: ${(enhancedContext?.searchQueries || visionContext?.searchQueries)?.length || 0}

IMPORTANT: Provide research-backed recommendations citing the applied knowledge sources when applicable.
Your analysis should reference specific UX research findings, accessibility guidelines, and industry best practices.
` : ''}

CRITICAL: Analyze thoroughly and provide specific, actionable feedback with precise image coordinates.`;

    console.log(`🔧 Final prompt ready - Type: ${isEnhanced ? 'RESEARCH-ENHANCED' : 'STANDARD'}`);
    
    // ===== MAIN CONSOLE LOG FOR USER VISIBILITY =====
    console.log("🎯🎯🎯 === COMPLETE ENHANCED PROMPT WITH VISION INTEGRATION === 🎯🎯🎯");
    console.log("📏 Total Enhanced Prompt Length:", fullAnalysisPrompt.length);
    console.log("👁️ Vision Context Status:", visionContext ? "ENABLED with Google Vision analysis" : "DISABLED");
    console.log("📝 RAG Status:", ragContext.researchEnhanced ? "ENABLED with research context" : "DISABLED");
    console.log("🏢 Competitive Intelligence Status:", competitiveResults.totalPatterns > 0 ? "ENABLED with competitive context" : "DISABLED");
    console.log("💼 Business Impact Quantification Status:", enableBusinessImpact ? "ENABLED" : "DISABLED");
    console.log("📊 Research Sources Used:", ragContext.knowledgeSourcesUsed);
    console.log("🏆 Competitive Patterns Used:", competitiveResults.totalPatterns);
    console.log("🚨🚨🚨 VISION INTEGRATION:", {
      visionContextIntegrated: !!visionContext,
      visionConfidenceScore: visionContext?.confidenceScore || 'N/A',
      visionElementsDetected: visionContext?.visionAnalysis?.uiElements?.length || 0,
      accessibilityIssuesFound: visionContext?.visionAnalysis?.accessibility?.length || 0
    });
    console.log("");
    
    for (const processedImage of imageProcessingResult.processedImages) {
      console.log(`🔍 Analyzing image with ${aiProviderConfig.provider} using enhanced prompt...`);
      
      try {
        // ✅ CRITICAL FIX: Pass the full enhanced prompt to the AI provider
        const annotations = await analyzeWithAIProvider(
          processedImage.base64Data,
          processedImage.mimeType,
          fullAnalysisPrompt, // ✅ Enhanced prompt with vision, RAG, and competitive context
          aiProviderConfig
        );
        
        allAnnotations.push(...annotations);
        console.log(`✅ Found ${annotations.length} annotations for image`);
      } catch (error) {
        console.error('❌ AI analysis failed for image:', error);
        return new Response(
          JSON.stringify({ 
            error: error.message,
            debugInfo: {
              environment: envConfig,
              ragStatus: ragResults,
              competitiveStatus: competitiveResults,
              visionStatus: visionContext ? 'integrated' : 'not_provided',
              imageCount: imageCount,
              timestamp: new Date().toISOString()
            }
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    console.log(`✅ AI analysis completed with ${allAnnotations.length} total annotations`);

    // NEW: Integrate business impact calculations
    if (enableBusinessImpact) {
      console.log('💼 === BUSINESS IMPACT INTEGRATION START ===');
      
      const enhancedResults = EnhancedAnalysisIntegrator.integrateBusinessImpact(
        allAnnotations,
        ragContext.researchEnhanced ? {
          researchCitations: ragContext.researchCitations,
          enhancedPrompt: ragContext.enhancedPrompt
        } : undefined,
        competitiveResults.totalPatterns > 0 ? competitiveResults : undefined
      );

      console.log('💼 === BUSINESS IMPACT INTEGRATION COMPLETE ===');
      console.log('📈 Business Impact Summary:', {
        totalRevenue: enhancedResults.businessSummary.totalPotentialRevenue,
        quickWins: enhancedResults.businessSummary.quickWinsCount,
        criticalIssues: enhancedResults.businessSummary.criticalIssuesCount,
        avgROI: enhancedResults.businessSummary.averageROIScore
      });

      // Save enhanced results to database
      console.log('💾 Saving enhanced results to database...');
      const dbResult = await databaseManager.saveAnalysisResults({
        analysisId: requestData.analysisId,
        annotations: enhancedResults.annotations,
        aiModelUsed: aiProviderConfig.provider + (aiProviderConfig.model ? `:${aiProviderConfig.model}` : ''),
        processingTime: Date.now()
      });

      if (!dbResult.success) {
        console.error('❌ Database save failed:', dbResult.error);
        return new Response(
          JSON.stringify({ error: dbResult.error }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('✅ Enhanced results saved to database');

      // ✅ FIND your response return and ADD enhanced context information:
      const response = enhancedResponseFormatter.formatEnhancedResponse(
        enhancedResults,
        {
          modelUsed: aiProviderConfig.provider + (aiProviderConfig.model ? `:${aiProviderConfig.model}` : ''),
          processingTime: Date.now(),
          ragEnhanced: ragResults.researchEnhanced,                     // ✅ ADD THIS
          knowledgeSourcesUsed: ragResults.knowledgeSourcesUsed,
          researchCitations: ragResults.researchCitations,
          competitiveEnhanced: competitiveResults.totalPatterns > 0,
          competitivePatternsUsed: competitiveResults.totalPatterns,
          industryBenchmarks: competitiveResults.industryBenchmarks,
          visionEnhanced: !!visionContext,
          visionConfidenceScore: visionContext?.confidenceScore,
          visionElementsDetected: visionContext?.visionAnalysis?.uiElements?.length || 0,
          enhancedContext: enhancedContext || visionContext || null,     // ✅ ADD THIS
          analysisType: isEnhanced ? 'research-enhanced' : 'standard'    // ✅ ADD THIS
        }
      );

      // Add CORS headers to successful response
      const responseWithCors = new Response(response.body, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

      const enhancementStatus = [
        visionContext ? 'Google Vision analysis' : null,
        ragResults.researchEnhanced ? 'RAG enhancement' : null,
        competitiveResults.totalPatterns > 0 ? 'competitive intelligence' : null,
        'business impact quantification'
      ].filter(Boolean).join(', ');

      console.log(`✅ Enhanced analysis completed successfully with ${enhancementStatus}`);
      return responseWithCors;

    } else {
      // Fallback to standard response format for backward compatibility
      console.log('📊 Using standard response format (business impact disabled)');
      
      // Save to database
      console.log('💾 Saving to database...');
      const dbResult = await databaseManager.saveAnalysisResults({
        analysisId: requestData.analysisId,
        annotations: allAnnotations,
        aiModelUsed: aiProviderConfig.provider + (aiProviderConfig.model ? `:${aiProviderConfig.model}` : ''),
        processingTime: Date.now()
      });

      if (!dbResult.success) {
        console.error('❌ Database save failed:', dbResult.error);
        return new Response(
          JSON.stringify({ error: dbResult.error }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('✅ Results saved to database');

      // ✅ FIND your response return and ADD enhanced context information:
      const response = responseFormatter.formatSuccessResponse({
        annotations: allAnnotations,
        totalAnnotations: allAnnotations.length,
        modelUsed: aiProviderConfig.provider + (aiProviderConfig.model ? `:${aiProviderConfig.model}` : ''),
        processingTime: Date.now(),
        ragEnhanced: ragResults.researchEnhanced,                       // ✅ ADD THIS
        knowledgeSourcesUsed: ragResults.knowledgeSourcesUsed,
        researchCitations: ragResults.researchCitations,
        competitiveEnhanced: competitiveResults.totalPatterns > 0,
        competitivePatternsUsed: competitiveResults.totalPatterns,
        industryBenchmarks: competitiveResults.industryBenchmarks,
        visionEnhanced: !!visionContext,
        visionConfidenceScore: visionContext?.confidenceScore,
        visionElementsDetected: visionContext?.visionAnalysis?.uiElements?.length || 0,
        enhancedContext: enhancedContext || visionContext || null,       // ✅ ADD THIS
        analysisType: isEnhanced ? 'research-enhanced' : 'standard'      // ✅ ADD THIS
      });

      // Add CORS headers to successful response
      const responseWithCors = new Response(response.body, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

      const enhancementStatus = [
        visionContext ? 'Google Vision analysis' : null,
        ragResults.researchEnhanced ? 'RAG enhancement' : null,
        competitiveResults.totalPatterns > 0 ? 'competitive intelligence' : null
      ].filter(Boolean).join(' and ') || 'standard analysis';

      console.log(`✅ Analysis completed successfully with ${enhancementStatus}`);
      return responseWithCors;
    }

  } catch (error) {
    console.error('❌ Unexpected error in enhanced analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
