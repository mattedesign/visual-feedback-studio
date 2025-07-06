// ============= COMPREHENSIVE ANALYSIS FAILURE DIAGNOSTICS =============
// Designed to identify root causes of analysis failures

import { validateAndTestApiKey } from '../claude/apiKeyValidator.ts';

export interface DiagnosticResult {
  category: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  details: string;
  recommendation?: string;
  debugData?: any;
}

export interface ComprehensiveDiagnosticReport {
  overallStatus: 'HEALTHY' | 'ISSUES_DETECTED' | 'CRITICAL_FAILURE';
  diagnostics: DiagnosticResult[];
  summary: string;
  recommendedActions: string[];
  timestamp: string;
  requestMetadata: any;
}

export class ComprehensiveDiagnostics {
  
  static async runFullDiagnostics(requestData: any): Promise<ComprehensiveDiagnosticReport> {
    console.log('🔍 RUNNING COMPREHENSIVE DIAGNOSTICS');
    console.log('📊 Request Data Analysis:', {
      hasImageUrls: !!requestData.imageUrls,
      imageCount: requestData.imageUrls?.length || 0,
      hasAnalysisPrompt: !!requestData.analysisPrompt,
      promptLength: requestData.analysisPrompt?.length || 0,
      hasAnalysisId: !!requestData.analysisId
    });

    const diagnostics: DiagnosticResult[] = [];
    let criticalFailures = 0;
    let warnings = 0;

    // 1. CLAUDE API KEY VALIDATION
    console.log('🔑 DIAGNOSTIC 1: Claude API Key Validation');
    try {
      const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!apiKey) {
        diagnostics.push({
          category: 'API_AUTHENTICATION',
          status: 'FAIL',
          details: 'ANTHROPIC_API_KEY environment variable not found',
          recommendation: 'Add ANTHROPIC_API_KEY to Supabase secrets'
        });
        criticalFailures++;
      } else {
        try {
          const validatedKey = await validateAndTestApiKey(apiKey);
          diagnostics.push({
            category: 'API_AUTHENTICATION',
            status: 'PASS',
            details: `Claude API key validated successfully (length: ${validatedKey.length})`,
            debugData: { keyLength: validatedKey.length, keyPrefix: validatedKey.substring(0, 10) + '***' }
          });
        } catch (keyError) {
          diagnostics.push({
            category: 'API_AUTHENTICATION',
            status: 'FAIL',
            details: `Claude API key validation failed: ${keyError.message}`,
            recommendation: 'Regenerate Claude API key at console.anthropic.com and update Supabase secrets'
          });
          criticalFailures++;
        }
      }
    } catch (error) {
      diagnostics.push({
        category: 'API_AUTHENTICATION',
        status: 'FAIL',
        details: `Claude API key validation error: ${error.message}`,
        recommendation: 'Check Supabase secrets configuration'
      });
      criticalFailures++;
    }

    // 2. REQUEST PAYLOAD VALIDATION
    console.log('📋 DIAGNOSTIC 2: Request Payload Validation');
    try {
      // Image URLs validation
      if (!requestData.imageUrls || !Array.isArray(requestData.imageUrls)) {
        diagnostics.push({
          category: 'REQUEST_VALIDATION',
          status: 'FAIL',
          details: 'imageUrls is missing or not an array',
          recommendation: 'Ensure imageUrls is provided as an array'
        });
        criticalFailures++;
      } else if (requestData.imageUrls.length === 0) {
        diagnostics.push({
          category: 'REQUEST_VALIDATION',
          status: 'FAIL',
          details: 'No images provided for analysis',
          recommendation: 'At least one image URL is required'
        });
        criticalFailures++;
      } else if (requestData.imageUrls.length > 10) {
        diagnostics.push({
          category: 'REQUEST_VALIDATION',
          status: 'WARNING',
          details: `Too many images: ${requestData.imageUrls.length} (max 10)`,
          recommendation: 'Reduce number of images to 10 or fewer'
        });
        warnings++;
      } else {
        diagnostics.push({
          category: 'REQUEST_VALIDATION',
          status: 'PASS',
          details: `Valid image count: ${requestData.imageUrls.length}`,
          debugData: { imageCount: requestData.imageUrls.length }
        });
      }

      // Analysis prompt validation
      if (!requestData.analysisPrompt || typeof requestData.analysisPrompt !== 'string') {
        diagnostics.push({
          category: 'REQUEST_VALIDATION',
          status: 'FAIL',
          details: 'analysisPrompt is missing or not a string',
          recommendation: 'Provide a valid analysis prompt'
        });
        criticalFailures++;
      } else if (requestData.analysisPrompt.trim().length < 10) {
        diagnostics.push({
          category: 'REQUEST_VALIDATION',
          status: 'FAIL',
          details: `Analysis prompt too short: ${requestData.analysisPrompt.length} chars (min 10)`,
          recommendation: 'Provide a more detailed analysis prompt'
        });
        criticalFailures++;
      } else if (requestData.analysisPrompt.length > 2000) {
        diagnostics.push({
          category: 'REQUEST_VALIDATION',
          status: 'WARNING',
          details: `Analysis prompt very long: ${requestData.analysisPrompt.length} chars (max 2000)`,
          recommendation: 'Consider shortening the analysis prompt'
        });
        warnings++;
      } else {
        diagnostics.push({
          category: 'REQUEST_VALIDATION',
          status: 'PASS',
          details: `Valid analysis prompt: ${requestData.analysisPrompt.length} chars`,
          debugData: { promptLength: requestData.analysisPrompt.length }
        });
      }

      // Analysis ID validation
      if (!requestData.analysisId || typeof requestData.analysisId !== 'string') {
        diagnostics.push({
          category: 'REQUEST_VALIDATION',
          status: 'FAIL',
          details: 'analysisId is missing or not a string',
          recommendation: 'Provide a valid analysis ID'
        });
        criticalFailures++;
      } else {
        diagnostics.push({
          category: 'REQUEST_VALIDATION',
          status: 'PASS',
          details: `Valid analysis ID: ${requestData.analysisId}`,
          debugData: { analysisId: requestData.analysisId }
        });
      }

    } catch (error) {
      diagnostics.push({
        category: 'REQUEST_VALIDATION',
        status: 'FAIL',
        details: `Request validation error: ${error.message}`,
        recommendation: 'Check request format and structure'
      });
      criticalFailures++;
    }

    // 3. IMAGE DATA VALIDATION
    console.log('🖼️ DIAGNOSTIC 3: Image Data Validation');
    if (requestData.imageUrls && Array.isArray(requestData.imageUrls)) {
      let validImages = 0;
      let invalidImages = 0;
      const imageValidationDetails: any[] = [];

      for (let i = 0; i < requestData.imageUrls.length; i++) {
        const imageUrl = requestData.imageUrls[i];
        try {
          if (typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
            invalidImages++;
            imageValidationDetails.push({
              index: i,
              status: 'INVALID',
              reason: 'Not a string or empty'
            });
            continue;
          }

          // Check if it's a base64 data URL
          if (imageUrl.startsWith('data:')) {
            const dataUrlPattern = /^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/i;
            if (dataUrlPattern.test(imageUrl)) {
              validImages++;
              imageValidationDetails.push({
                index: i,
                status: 'VALID',
                type: 'base64',
                length: imageUrl.length
              });
            } else {
              invalidImages++;
              imageValidationDetails.push({
                index: i,
                status: 'INVALID',
                reason: 'Invalid base64 data URL format'
              });
            }
          }
          // Check if it's a regular HTTP URL
          else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            try {
              new URL(imageUrl);
              validImages++;
              imageValidationDetails.push({
                index: i,
                status: 'VALID',
                type: 'url',
                url: imageUrl.substring(0, 100) + '...'
              });
            } catch {
              invalidImages++;
              imageValidationDetails.push({
                index: i,
                status: 'INVALID',
                reason: 'Invalid URL format'
              });
            }
          } else {
            invalidImages++;
            imageValidationDetails.push({
              index: i,
              status: 'INVALID',
              reason: 'Must be HTTP URL or base64 data URL'
            });
          }
        } catch (error) {
          invalidImages++;
          imageValidationDetails.push({
            index: i,
            status: 'ERROR',
            reason: error.message
          });
        }
      }

      if (invalidImages > 0) {
        diagnostics.push({
          category: 'IMAGE_VALIDATION',
          status: invalidImages === requestData.imageUrls.length ? 'FAIL' : 'WARNING',
          details: `${invalidImages} invalid images out of ${requestData.imageUrls.length}`,
          recommendation: 'Fix invalid image URLs or base64 data',
          debugData: { validImages, invalidImages, details: imageValidationDetails }
        });
        if (invalidImages === requestData.imageUrls.length) {
          criticalFailures++;
        } else {
          warnings++;
        }
      } else {
        diagnostics.push({
          category: 'IMAGE_VALIDATION',
          status: 'PASS',
          details: `All ${validImages} images are valid`,
          debugData: { validImages, details: imageValidationDetails }
        });
      }
    }

    // 4. ENVIRONMENT CONFIGURATION
    console.log('⚙️ DIAGNOSTIC 4: Environment Configuration');
    const envDiagnostics: any = {};
    const requiredEnvVars = ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    let missingEnvVars = 0;

    for (const envVar of requiredEnvVars) {
      const value = Deno.env.get(envVar);
      if (!value) {
        envDiagnostics[envVar] = 'MISSING';
        missingEnvVars++;
      } else {
        envDiagnostics[envVar] = 'CONFIGURED';
      }
    }

    if (missingEnvVars > 0) {
      diagnostics.push({
        category: 'ENVIRONMENT_CONFIG',
        status: 'FAIL',
        details: `${missingEnvVars} required environment variables missing`,
        recommendation: 'Configure missing environment variables in Supabase secrets',
        debugData: envDiagnostics
      });
      criticalFailures++;
    } else {
      diagnostics.push({
        category: 'ENVIRONMENT_CONFIG',
        status: 'PASS',
        details: 'All required environment variables configured',
        debugData: envDiagnostics
      });
    }

    // 5. SYSTEM HEALTH CHECK
    console.log('🏥 DIAGNOSTIC 5: System Health Check');
    try {
      const memoryUsage = Deno.memoryUsage();
      const systemHealth = {
        memoryUsed: Math.round(memoryUsage.used / 1024 / 1024),
        memoryTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        timestamp: new Date().toISOString()
      };

      diagnostics.push({
        category: 'SYSTEM_HEALTH',
        status: 'PASS',
        details: `System healthy - Memory: ${systemHealth.memoryUsed}MB used`,
        debugData: systemHealth
      });
    } catch (error) {
      diagnostics.push({
        category: 'SYSTEM_HEALTH',
        status: 'WARNING',
        details: `Could not check system health: ${error.message}`,
        recommendation: 'Monitor system resources'
      });
      warnings++;
    }

    // GENERATE OVERALL STATUS AND RECOMMENDATIONS
    const overallStatus = criticalFailures > 0 ? 'CRITICAL_FAILURE' : 
                         warnings > 0 ? 'ISSUES_DETECTED' : 'HEALTHY';

    const recommendedActions: string[] = [];
    
    if (criticalFailures > 0) {
      recommendedActions.push('⚠️ CRITICAL: Address all FAIL diagnostics before proceeding');
    }
    if (warnings > 0) {
      recommendedActions.push('⚠️ WARNING: Review and fix warning issues for optimal performance');
    }
    
    diagnostics.forEach(d => {
      if (d.recommendation && d.status === 'FAIL') {
        recommendedActions.push(`🔧 ${d.category}: ${d.recommendation}`);
      }
    });

    if (recommendedActions.length === 0) {
      recommendedActions.push('✅ All diagnostics passed - system is ready for analysis');
    }

    const summary = `Diagnostics completed: ${diagnostics.filter(d => d.status === 'PASS').length} passed, ${warnings} warnings, ${criticalFailures} critical failures`;

    const report: ComprehensiveDiagnosticReport = {
      overallStatus,
      diagnostics,
      summary,
      recommendedActions,
      timestamp: new Date().toISOString(),
      requestMetadata: {
        imageCount: requestData.imageUrls?.length || 0,
        promptLength: requestData.analysisPrompt?.length || 0,
        hasAnalysisId: !!requestData.analysisId
      }
    };

    console.log('🔍 COMPREHENSIVE DIAGNOSTICS COMPLETED:', {
      overallStatus,
      totalDiagnostics: diagnostics.length,
      passed: diagnostics.filter(d => d.status === 'PASS').length,
      warnings,
      criticalFailures,
      canProceed: criticalFailures === 0
    });

    return report;
  }

  static shouldBlockAnalysis(report: ComprehensiveDiagnosticReport): boolean {
    return report.overallStatus === 'CRITICAL_FAILURE';
  }

  static formatDiagnosticResponse(report: ComprehensiveDiagnosticReport) {
    return {
      success: report.overallStatus !== 'CRITICAL_FAILURE',
      diagnostics: {
        status: report.overallStatus,
        summary: report.summary,
        details: report.diagnostics,
        recommendations: report.recommendedActions,
        canProceed: !this.shouldBlockAnalysis(report),
        timestamp: report.timestamp
      },
      error: report.overallStatus === 'CRITICAL_FAILURE' ? 
        'Critical diagnostic failures detected. Please address the issues before proceeding.' : undefined
    };
  }
}