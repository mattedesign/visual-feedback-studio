/// <reference types="@figma/plugin-typings" />

// Enhanced Figma Plugin for Figmant Phase 4.1
// Features: Design token extraction, real-time feedback, advanced annotation creation

// Define types directly in this file since imports can be problematic in Figma
interface PluginMessage {
  type: 'selection-change' | 'export-frames' | 'export-complete' | 'export-error' | 'close' | 'analysis-progress' | 'analysis-complete' | 'analysis-partial' | 'auth-status' | 'metadata-extracted' | 'design-context-analysis' | 'auto-analysis-trigger';
  data?: any;
  message?: string;
  progress?: number;
  sessionId?: string;
  analysisResult?: any;
  imagesProcessed?: number;
  totalImages?: number;
  analysisError?: string;
  authError?: string;
  isAuthenticated?: boolean;
  userEmail?: string;
  subscription?: any;
  viewUrl?: string;
  designMetadata?: DesignMetadata;
  contextAnalysis?: ContextAnalysis;
  autoTriggerEnabled?: boolean;
  triggerReason?: string;
}

interface DesignMetadata {
  totalFrames: number;
  componentCount: number;
  layerDepth: number;
  colorPalette: string[];
  typography: TypographyInfo[];
  screenSizes: ScreenSizeInfo[];
  designSystem: DesignSystemInfo;
  lastModified: string;
  collaborators: string[];
}

interface TypographyInfo {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  usage: number;
}

interface ScreenSizeInfo {
  width: number;
  height: number;
  name: string;
  count: number;
}

interface DesignSystemInfo {
  hasComponents: boolean;
  componentCount: number;
  hasStyles: boolean;
  styleCount: number;
  consistencyScore: number;
}

interface ContextAnalysis {
  projectType: string;
  complexity: 'low' | 'medium' | 'high';
  suggestedFocus: string[];
  potentialIssues: string[];
  recommendedAnalysisDepth: 'quick' | 'detailed' | 'comprehensive';
}

interface UIMessage {
  type: 'export' | 'cancel' | 'resize' | 'analyze-selection' | 'login' | 'logout' | 'check-auth' | 'extract-metadata' | 'analyze-context' | 'toggle-auto-analysis' | 'smart-focus-analysis';
  data?: any;
  email?: string;
  password?: string;
  sessionTitle?: string;
  context?: string;
  autoAnalysisEnabled?: boolean;
  focusArea?: string;
  analysisDepth?: 'quick' | 'detailed' | 'comprehensive';
}

interface FrameData {
  id: string;
  name: string;
  width: number;
  height: number;
}

interface PluginExportSettings {
  frames: FrameData[];
  context: string;
  scale: number;
  format: 'PNG' | 'JPG' | 'SVG';
  sessionToken: string;
}

// Supabase configuration
const SUPABASE_URL = 'https://mxxtvtwcoplfajvazpav.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHR2dHdjb3BsZmFqdmF6cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDU2NjgsImV4cCI6MjA2NjE4MTY2OH0.b9sNxeDALujnw2tQD-qnbs3YkZvvTkja8jG6clgpibA';

// Enhanced Figmant Configuration for Phase 4.1
const FIGMANT_WEB_URL = 'https://preview--figmant-ai.lovable.app'; // Updated domain
const SUPABASE_URL = 'https://mxxtvtwcoplfajvazpav.supabase.co';

// Real-time feedback configuration  
const REAL_TIME_FEEDBACK_ENABLED = true;
const AUTO_ANNOTATION_ENABLED = true;

// Enhanced UI with real-time features
figma.showUI(__html__, {
  width: 340,
  height: 720,
  title: 'Figmant AI Analysis',
  themeColors: true
});

// Function to get selected frames
function getSelectedFrames(): FrameData[] {
  const frames: FrameData[] = [];
  
  for (const node of figma.currentPage.selection) {
    // Check if the node is a frame, component, or group
    if (node.type === 'FRAME' || 
        node.type === 'COMPONENT' || 
        node.type === 'COMPONENT_SET' ||
        node.type === 'GROUP' ||
        node.type === 'INSTANCE') {
      frames.push({
        id: node.id,
        name: node.name,
        width: node.width,
        height: node.height
      });
    }
  }
  
  return frames;
}

// Advanced metadata extraction function
async function extractDesignMetadata(): Promise<DesignMetadata> {
  const allFrames = figma.currentPage.findAll(node => 
    node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
  );
  
  const components = figma.currentPage.findAll(node => 
    node.type === 'COMPONENT' || node.type === 'INSTANCE'
  );
  
  // Extract color palette
  const colorSet = new Set<string>();
  const typographyMap = new Map<string, TypographyInfo>();
  const screenSizeMap = new Map<string, ScreenSizeInfo>();
  
  let maxDepth = 0;
  
  function analyzeNode(node: SceneNode, depth: number = 0) {
    maxDepth = Math.max(maxDepth, depth);
    
    // Extract colors
    if ('fills' in node && node.fills) {
      const fills = Array.isArray(node.fills) ? node.fills : [node.fills];
      fills.forEach(fill => {
        if (fill.type === 'SOLID') {
          const { r, g, b } = fill.color;
          const hex = `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
          colorSet.add(hex);
        }
      });
    }
    
    // Extract typography
    if (node.type === 'TEXT') {
      const fontFamily = node.fontName.family;
      const fontSize = node.fontSize as number;
      const fontWeight = node.fontName.style;
      
      const key = `${fontFamily}-${fontSize}-${fontWeight}`;
      const existing = typographyMap.get(key);
      
      if (existing) {
        existing.usage++;
      } else {
        typographyMap.set(key, {
          fontFamily,
          fontSize,
          fontWeight,
          usage: 1
        });
      }
    }
    
    // Recursively analyze children
    if ('children' in node) {
      node.children.forEach(child => analyzeNode(child, depth + 1));
    }
  }
  
  // Analyze all frames
  allFrames.forEach(frame => {
    // Track screen sizes
    const sizeKey = `${frame.width}x${frame.height}`;
    const existing = screenSizeMap.get(sizeKey);
    
    if (existing) {
      existing.count++;
    } else {
      screenSizeMap.set(sizeKey, {
        width: frame.width,
        height: frame.height,
        name: frame.name,
        count: 1
      });
    }
    
    analyzeNode(frame);
  });
  
  // Get design system info
  const localComponents = await figma.getLocalComponentsAsync();
  const localStyles = await figma.getLocalPaintStylesAsync();
  const localTextStyles = await figma.getLocalTextStylesAsync();
  
  const designSystem: DesignSystemInfo = {
    hasComponents: localComponents.length > 0,
    componentCount: localComponents.length,
    hasStyles: (localStyles.length + localTextStyles.length) > 0,
    styleCount: localStyles.length + localTextStyles.length,
    consistencyScore: calculateConsistencyScore(typographyMap, colorSet, localStyles.length + localTextStyles.length)
  };
  
  return {
    totalFrames: allFrames.length,
    componentCount: components.length,
    layerDepth: maxDepth,
    colorPalette: Array.from(colorSet).slice(0, 20), // Limit to top 20 colors
    typography: Array.from(typographyMap.values()).sort((a, b) => b.usage - a.usage),
    screenSizes: Array.from(screenSizeMap.values()).sort((a, b) => b.count - a.count),
    designSystem,
    lastModified: new Date().toISOString(),
    collaborators: [] // Figma API doesn't expose this easily
  };
}

// Calculate design system consistency score
function calculateConsistencyScore(typography: Map<string, TypographyInfo>, colors: Set<string>, stylesCount: number): number {
  const uniqueFonts = new Set(Array.from(typography.keys()).map(key => key.split('-')[0]));
  const fontConsistency = Math.max(0, 100 - (uniqueFonts.size - 3) * 10); // Penalty for too many fonts
  const colorConsistency = Math.max(0, 100 - (colors.size - 8) * 5); // Penalty for too many colors
  const styleUsage = Math.min(100, stylesCount * 10); // Bonus for using styles
  
  return Math.round((fontConsistency + colorConsistency + styleUsage) / 3);
}

// Analyze design context for smart recommendations
async function analyzeDesignContext(metadata: DesignMetadata): Promise<ContextAnalysis> {
  const { totalFrames, screenSizes, designSystem, typography, colorPalette } = metadata;
  
  // Determine project type based on screen sizes
  let projectType = 'web-app';
  const mobileSizes = screenSizes.filter(size => size.width <= 480).length;
  const desktopSizes = screenSizes.filter(size => size.width >= 1200).length;
  
  if (mobileSizes > desktopSizes) {
    projectType = 'mobile-app';
  } else if (screenSizes.some(size => size.width > 1920)) {
    projectType = 'desktop-app';
  }
  
  // Determine complexity
  let complexity: 'low' | 'medium' | 'high' = 'low';
  if (totalFrames > 20 || typography.length > 8 || colorPalette.length > 12) {
    complexity = 'high';
  } else if (totalFrames > 10 || typography.length > 4 || colorPalette.length > 6) {
    complexity = 'medium';
  }
  
  // Generate suggested focus areas
  const suggestedFocus: string[] = [];
  const potentialIssues: string[] = [];
  
  if (designSystem.consistencyScore < 60) {
    suggestedFocus.push('Design System Consistency');
    potentialIssues.push('Inconsistent typography and color usage detected');
  }
  
  if (screenSizes.length < 3 && projectType === 'web-app') {
    suggestedFocus.push('Responsive Design');
    potentialIssues.push('Limited responsive breakpoints found');
  }
  
  if (typography.length > 6) {
    suggestedFocus.push('Typography Optimization');
    potentialIssues.push('Too many font variations may impact readability');
  }
  
  if (colorPalette.length > 15) {
    suggestedFocus.push('Color Palette Simplification');
    potentialIssues.push('Large color palette may reduce visual coherence');
  }
  
  // Default focus areas if none detected
  if (suggestedFocus.length === 0) {
    suggestedFocus.push('Usability & Navigation', 'Visual Hierarchy');
  }
  
  // Determine recommended analysis depth
  let recommendedAnalysisDepth: 'quick' | 'detailed' | 'comprehensive' = 'detailed';
  if (complexity === 'low' && totalFrames < 5) {
    recommendedAnalysisDepth = 'quick';
  } else if (complexity === 'high' || totalFrames > 15) {
    recommendedAnalysisDepth = 'comprehensive';
  }
  
  return {
    projectType,
    complexity,
    suggestedFocus,
    potentialIssues,
    recommendedAnalysisDepth
  };
}

// Initialize plugin with authentication check
async function initializePlugin() {
  const sessionToken = await figma.clientStorage.getAsync('figmant_session_token');
  const selectedFrames = getSelectedFrames();
  
  figma.ui.postMessage({
    type: 'selection-change',
    data: { 
      frames: selectedFrames,
      isAuthenticated: !!sessionToken,
      isInitialized: true
    }
  } as PluginMessage);
}

// Initialize plugin
initializePlugin();

// Listen for selection changes
figma.on('selectionchange', async () => {
  const sessionToken = await figma.clientStorage.getAsync('figmant_session_token');
  figma.ui.postMessage({
    type: 'selection-change',
    data: { 
      frames: getSelectedFrames(),
      isAuthenticated: !!sessionToken
    }
  } as PluginMessage);
});

// Handle messages from UI
figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === 'login') {
    try {
      console.log('🔐 Attempting login...');
      
      // Login user with Supabase
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: msg.email,
          password: msg.password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || 'Login failed');
      }

      const authData = await response.json();
      
      // Store session token
      await figma.clientStorage.setAsync('figmant_session_token', authData.access_token);
      await figma.clientStorage.setAsync('figmant_user_email', authData.user.email);

      console.log('✅ Login successful');
      figma.ui.postMessage({
        type: 'auth-status',
        isAuthenticated: true,
        userEmail: authData.user.email
      } as PluginMessage);

    } catch (error: any) {
      console.error('❌ Login error:', error);
      figma.ui.postMessage({
        type: 'auth-status',
        isAuthenticated: false,
        authError: error.message
      } as PluginMessage);
    }
  }

  if (msg.type === 'logout') {
    try {
      await figma.clientStorage.deleteAsync('figmant_session_token');
      await figma.clientStorage.deleteAsync('figmant_user_email');
      
      figma.ui.postMessage({
        type: 'auth-status',
        isAuthenticated: false
      } as PluginMessage);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  if (msg.type === 'check-auth') {
    try {
      const sessionToken = await figma.clientStorage.getAsync('figmant_session_token');
      const userEmail = await figma.clientStorage.getAsync('figmant_user_email');
      
      if (sessionToken) {
        // Verify token is still valid by checking subscription
        const response = await fetch(`${SUPABASE_URL}/functions/v1/figmant-check-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
            'apikey': SUPABASE_ANON_KEY  // ✅ ADDED
          }
        });

        if (response.ok) {
          const subData = await response.json();
          figma.ui.postMessage({
            type: 'auth-status',
            isAuthenticated: true,
            userEmail: userEmail,
            subscription: subData.subscription
          } as PluginMessage);
        } else {
          // Token expired, clear storage
          await figma.clientStorage.deleteAsync('figmant_session_token');
          await figma.clientStorage.deleteAsync('figmant_user_email');
          
          figma.ui.postMessage({
            type: 'auth-status',
            isAuthenticated: false,
            authError: 'Session expired'
          } as PluginMessage);
        }
      } else {
        figma.ui.postMessage({
          type: 'auth-status',
          isAuthenticated: false
        } as PluginMessage);
      }
    } catch (error: any) {
      figma.ui.postMessage({
        type: 'auth-status',
        isAuthenticated: false,
        authError: error.message
      } as PluginMessage);
    }
  }

  if (msg.type === 'export' || msg.type === 'analyze-selection') {
    console.log('🚀 Starting export/analysis process...');
    
    // For analyze-selection, build the settings from message data
    let settings: PluginExportSettings;
    
    if (msg.type === 'analyze-selection') {
      // Get session token from storage
      const sessionToken = await figma.clientStorage.getAsync('figmant_session_token');
      
      console.log('🔍 Debug - checking session token:');
      console.log('🔍 Token exists:', !!sessionToken);
      console.log('🔍 Token type:', typeof sessionToken);
      console.log('🔍 Token length:', sessionToken ? sessionToken.length : 'undefined');
      
      if (!sessionToken) {
        console.error('❌ No session token found');
        console.log('🔍 Checking all stored keys...');
        
        // Let's see what keys are actually stored
        try {
          const allKeys = await figma.clientStorage.keysAsync();
          console.log('🔍 All stored keys:', allKeys);
          
          // Check if token exists under a different key
          for (const key of allKeys) {
            const value = await figma.clientStorage.getAsync(key);
            console.log(`🔍 Key "${key}":`, typeof value, value ? value.substring(0, 20) + '...' : 'null/undefined');
          }
        } catch (e) {
          console.error('🔍 Error checking keys:', e);
        }
        
        figma.ui.postMessage({
          type: 'export-error',
          data: { error: 'Authentication required. Please log in first.' }
        } as PluginMessage);
        return;
      }
      
      const selectedFrames = getSelectedFrames();
      console.log('📋 Selected frames:', selectedFrames.length);
      
      if (selectedFrames.length === 0) {
        figma.ui.postMessage({
          type: 'export-error',
          data: { error: 'Please select at least one frame to analyze.' }
        } as PluginMessage);
        return;
      }
      
      console.log('🔍 Creating settings object with token:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'undefined');
      
      settings = {
        frames: selectedFrames,
        context: msg.context || '',
        scale: 2,
        format: 'PNG',
        sessionToken: sessionToken
      };
      
      console.log('🔍 Settings object created. Token in settings:', settings.sessionToken ? settings.sessionToken.substring(0, 20) + '...' : 'undefined');
    } else {
      settings = msg.data as PluginExportSettings;
    }
    
    try {
      console.log('📸 Exporting frames...', settings.frames.length);
      figma.ui.postMessage({ 
        type: 'analysis-progress', 
        message: 'Exporting frames...',
        progress: 10
      });

      const images = [];
      
      for (let i = 0; i < settings.frames.length; i++) {
        const frame = settings.frames[i];
        console.log(`📸 Exporting frame ${i + 1}/${settings.frames.length}: ${frame.name}`);
        
        const node = figma.getNodeById(frame.id) as SceneNode;
        
        if (node && 'exportAsync' in node) {
          // Export the frame with proper settings based on format
          let imageData: Uint8Array;
          
          if (settings.format === 'SVG') {
            imageData = await node.exportAsync({
              format: 'SVG'
            });
          } else {
            // For PNG and JPG, we can use scale
            imageData = await node.exportAsync({
              format: settings.format as 'PNG' | 'JPG',
              constraint: { type: 'SCALE', value: settings.scale }
            });
          }
          
          // Convert to base64
          const base64 = figma.base64Encode(imageData);
          const mimeType = settings.format === 'PNG' ? 'image/png' : 
                          settings.format === 'JPG' ? 'image/jpeg' : 
                          'image/svg+xml';
          
          images.push({
            name: node.name,
            format: settings.format,
            image: `data:${mimeType};base64,${base64}`
          });
          
          // Update progress
          const exportProgress = Math.floor(10 + (i + 1) / settings.frames.length * 40);
          figma.ui.postMessage({ 
            type: 'analysis-progress', 
            message: `Exported ${i + 1}/${settings.frames.length} frames`,
            progress: exportProgress
          });
        }
      }
      
      console.log('✅ Frame export complete, uploading to server...');
      figma.ui.postMessage({ 
        type: 'analysis-progress', 
        message: 'Uploading images...',
        progress: 60
      });

      // Upload images to the plugin API
      try {
        console.log('🔑 Using session token for upload:', settings.sessionToken ? 'Token exists' : 'No token');
        console.log('🔑 Token preview:', settings.sessionToken ? settings.sessionToken.substring(0, 20) + '...' : 'undefined');
        
        const uploadResponse = await fetch(`${SUPABASE_URL}/functions/v1/figmant-plugin-api`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.sessionToken}`,
            'apikey': SUPABASE_ANON_KEY  // ✅ ADDED
          },
          body: JSON.stringify({
            images,
            context: settings.context,
            sessionTitle: `Figma Analysis - ${new Date().toLocaleString()}`
          })
        });

        console.log('📤 Upload response status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('❌ Upload failed:', errorText);
          throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log('✅ Upload result:', uploadResult);

        // Validate the response structure
        if (!uploadResult.success || !uploadResult.session_id) {
          console.error('❌ Invalid upload response structure:', uploadResult);
          throw new Error('Invalid response from upload API - missing session_id');
        }

        const sessionId = uploadResult.session_id;
        console.log('🔑 Session ID for analysis:', sessionId);

        figma.ui.postMessage({ 
          type: 'analysis-progress', 
          message: 'Starting UX analysis...',
          progress: 80
        });

        // Trigger the analysis using the session ID from upload
        try {
          console.log('🧠 Starting analysis for session:', sessionId);
          
          // Debug: Log the exact headers being sent
          const analysisHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.sessionToken}`,
            'apikey': SUPABASE_ANON_KEY
          };
          
          console.log('🔍 Analysis request headers:', {
            hasContentType: !!analysisHeaders['Content-Type'],
            hasAuthorization: !!analysisHeaders['Authorization'],
            hasApiKey: !!analysisHeaders['apikey'],
            apiKeyLength: analysisHeaders['apikey']?.length,
            tokenPreview: settings.sessionToken?.substring(0, 20) + '...'
          });
          
          const analysisResponse = await fetch(`${SUPABASE_URL}/functions/v1/figmant-analyze-design`, {
            method: 'POST',
            headers: analysisHeaders,
            body: JSON.stringify({
              sessionId: sessionId  // Already fixed from session_id
            })
          });

          console.log('🧠 Analysis response status:', analysisResponse.status);

          if (!analysisResponse.ok) {
            const errorText = await analysisResponse.text();
            console.error('❌ Analysis failed:', errorText);
            throw new Error(`Analysis failed: ${analysisResponse.status} - ${errorText}`);
          }

          const analysisResult = await analysisResponse.json();
          console.log('✅ Analysis completed:', analysisResult);

          figma.ui.postMessage({
            type: 'analysis-complete',
            sessionId: sessionId,
            analysisResult: analysisResult,
            imagesProcessed: uploadResult.images_processed,
            totalImages: uploadResult.total_images,
            message: 'Analysis completed successfully!',
            viewUrl: `${FIGMANT_WEB_URL}/analysis/${sessionId}` // ✅ Added view URL
          });

        } catch (analysisError: any) {
          console.error('❌ Analysis error:', analysisError);
          // Still report upload success but note analysis failed
          figma.ui.postMessage({
            type: 'analysis-partial',
            sessionId: sessionId,
            imagesProcessed: uploadResult.images_processed,
            totalImages: uploadResult.total_images,
            analysisError: analysisError.message,
            message: 'Images uploaded successfully, but analysis failed. You can retry the analysis from the web app.',
            viewUrl: `${FIGMANT_WEB_URL}/analysis/${sessionId}` // ✅ Added view URL for partial success too
          });
        }
      } catch (uploadError: any) {
        console.error('❌ Upload error:', uploadError);
        figma.ui.postMessage({
          type: 'export-error',
          data: { error: uploadError.message || 'Upload failed' }
        } as PluginMessage);
      }
      
    } catch (error: any) {
      console.error('❌ Export error:', error);
      figma.ui.postMessage({
        type: 'export-error',
        data: { error: error.message || 'Export failed' }
      } as PluginMessage);
    }
  }
  
  if (msg.type === 'extract-metadata') {
    try {
      console.log('📊 Extracting design metadata...');
      figma.ui.postMessage({
        type: 'analysis-progress',
        message: 'Analyzing design structure...',
        progress: 20
      });

      const metadata = await extractDesignMetadata();
      
      figma.ui.postMessage({
        type: 'metadata-extracted',
        designMetadata: metadata,
        message: 'Design metadata extracted successfully'
      });
    } catch (error: any) {
      console.error('❌ Metadata extraction error:', error);
      figma.ui.postMessage({
        type: 'export-error',
        data: { error: 'Failed to extract design metadata: ' + error.message }
      } as PluginMessage);
    }
  }

  if (msg.type === 'analyze-context') {
    try {
      console.log('🎯 Analyzing design context...');
      const metadata = await extractDesignMetadata();
      const contextAnalysis = await analyzeDesignContext(metadata);
      
      figma.ui.postMessage({
        type: 'design-context-analysis',
        designMetadata: metadata,
        contextAnalysis: contextAnalysis,
        message: 'Context analysis completed'
      });
    } catch (error: any) {
      console.error('❌ Context analysis error:', error);
      figma.ui.postMessage({
        type: 'export-error',
        data: { error: 'Failed to analyze design context: ' + error.message }
      } as PluginMessage);
    }
  }

  if (msg.type === 'smart-focus-analysis') {
    try {
      console.log('🎯 Starting smart focus analysis...');
      const sessionToken = await figma.clientStorage.getAsync('figmant_session_token');
      
      if (!sessionToken) {
        figma.ui.postMessage({
          type: 'export-error',
          data: { error: 'Authentication required. Please log in first.' }
        } as PluginMessage);
        return;
      }

      const selectedFrames = getSelectedFrames();
      if (selectedFrames.length === 0) {
        figma.ui.postMessage({
          type: 'export-error',
          data: { error: 'Please select at least one frame to analyze.' }
        } as PluginMessage);
        return;
      }

      // Extract metadata and analyze context first
      const metadata = await extractDesignMetadata();
      const contextAnalysis = await analyzeDesignContext(metadata);

      // Build enhanced context based on focus area and analysis depth
      let enhancedContext = msg.context || '';
      if (msg.focusArea) {
        enhancedContext += `\n\nFocus Area: ${msg.focusArea}`;
      }
      if (msg.analysisDepth) {
        enhancedContext += `\nAnalysis Depth: ${msg.analysisDepth}`;
      }
      enhancedContext += `\n\nDesign Context: ${contextAnalysis.projectType} (${contextAnalysis.complexity} complexity)`;
      enhancedContext += `\nSuggested Focus: ${contextAnalysis.suggestedFocus.join(', ')}`;
      if (contextAnalysis.potentialIssues.length > 0) {
        enhancedContext += `\nPotential Issues: ${contextAnalysis.potentialIssues.join(', ')}`;
      }

      // Start the analysis with enhanced context
      const settings: PluginExportSettings = {
        frames: selectedFrames,
        context: enhancedContext,
        scale: 2,
        format: 'PNG',
        sessionToken: sessionToken
      };

      // Continue with normal analysis flow...
      figma.ui.postMessage({
        type: 'analysis-progress',
        message: 'Starting smart focus analysis...',
        progress: 5
      });

      console.log('🚀 Starting smart focus analysis with enhanced context');
      
      // Export and analyze frames (reuse existing logic)
      const images = [];
      
      for (let i = 0; i < settings.frames.length; i++) {
        const frame = settings.frames[i];
        console.log(`📸 Exporting frame ${i + 1}/${settings.frames.length}: ${frame.name}`);
        
        const node = figma.getNodeById(frame.id) as SceneNode;
        
        if (node && 'exportAsync' in node) {
          const imageData = await node.exportAsync({
            format: settings.format as 'PNG' | 'JPG',
            constraint: { type: 'SCALE', value: settings.scale }
          });
          
          const base64 = figma.base64Encode(imageData);
          const mimeType = 'image/png';
          
          images.push({
            name: node.name,
            format: settings.format,
            image: `data:${mimeType};base64,${base64}`
          });
          
          const exportProgress = Math.floor(10 + (i + 1) / settings.frames.length * 40);
          figma.ui.postMessage({ 
            type: 'analysis-progress', 
            message: `Exported ${i + 1}/${settings.frames.length} frames`,
            progress: exportProgress
          });
        }
      }

      // Upload with enhanced metadata
      const uploadResponse = await fetch(`${SUPABASE_URL}/functions/v1/figmant-plugin-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.sessionToken}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          images,
          context: enhancedContext,
          sessionTitle: `Smart Analysis - ${msg.focusArea || 'Focused'} - ${new Date().toLocaleString()}`,
          metadata: metadata,
          contextAnalysis: contextAnalysis
        })
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      const sessionId = uploadResult.session_id;

      // Trigger analysis
      const analysisResponse = await fetch(`${SUPABASE_URL}/functions/v1/figmant-analyze-design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.sessionToken}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          sessionId: sessionId
        })
      });

      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed: ${analysisResponse.status}`);
      }

      const analysisResult = await analysisResponse.json();

      figma.ui.postMessage({
        type: 'analysis-complete',
        sessionId: sessionId,
        analysisResult: analysisResult,
        imagesProcessed: uploadResult.images_processed,
        totalImages: uploadResult.total_images,
        message: `Smart ${msg.focusArea || 'focus'} analysis completed!`,
        viewUrl: `${FIGMANT_WEB_URL}/analysis/${sessionId}`
      });

    } catch (error: any) {
      console.error('❌ Smart focus analysis error:', error);
      figma.ui.postMessage({
        type: 'export-error',
        data: { error: 'Smart analysis failed: ' + error.message }
      } as PluginMessage);
    }
  }

  if (msg.type === 'toggle-auto-analysis') {
    try {
      const autoAnalysisEnabled = msg.autoAnalysisEnabled || false;
      await figma.clientStorage.setAsync('figmant_auto_analysis', autoAnalysisEnabled);
      
      figma.ui.postMessage({
        type: 'auto-analysis-trigger',
        autoTriggerEnabled: autoAnalysisEnabled,
        message: autoAnalysisEnabled ? 'Auto-analysis enabled' : 'Auto-analysis disabled'
      });
    } catch (error: any) {
      console.error('❌ Auto-analysis toggle error:', error);
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
  
  if (msg.type === 'resize') {
    const { width, height } = msg.data;
    figma.ui.resize(width, height);
  }
};

// Clean up
figma.on('close', () => {
  figma.closePlugin();
});