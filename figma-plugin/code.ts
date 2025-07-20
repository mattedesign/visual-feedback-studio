/// <reference types="@figma/plugin-typings" />

// This file runs in the main Figma environment

// Define types directly in this file since imports can be problematic in Figma
interface PluginMessage {
  type: 'selection-change' | 'export-frames' | 'export-complete' | 'export-error' | 'close' | 'analysis-progress' | 'analysis-complete' | 'analysis-partial' | 'auth-status';
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
}

interface UIMessage {
  type: 'export' | 'cancel' | 'resize' | 'analyze-selection' | 'login' | 'logout' | 'check-auth';
  data?: any;
  email?: string;
  password?: string;
  sessionTitle?: string;
  context?: string;
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

// Show UI
figma.showUI(__html__, {
  width: 420,
  height: 600,
  title: 'Figmant Analysis'
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
          
          const analysisResponse = await fetch(`${SUPABASE_URL}/functions/v1/figmant-analyze-design`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${settings.sessionToken}`,
              'apikey': SUPABASE_ANON_KEY  // ✅ THIS IS THE KEY FIX - ADDED APIKEY HEADER
            },
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
            message: 'Analysis completed successfully!'
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
            message: 'Images uploaded successfully, but analysis failed. You can retry the analysis from the web app.'
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