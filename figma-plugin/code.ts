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
figma.on('selectionchange', () => {
  figma.ui.postMessage({
    type: 'selection-change',
    data: { frames: getSelectedFrames() }
  } as PluginMessage);
});

// Handle messages from UI
figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === 'login') {
    try {
      // Login user with Supabase
      const response = await fetch('https://mxxtvtwcoplfajvazpav.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14eHR2dHdjb3BsZmFqdmF6cGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDU2NjgsImV4cCI6MjA2NjE4MTY2OH0.b9sNxeDALujnw2tQD-qnbs3YkZvvTkja8jG6clgpibA'
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

      figma.ui.postMessage({
        type: 'auth-status',
        isAuthenticated: true,
        userEmail: authData.user.email
      } as PluginMessage);

    } catch (error: any) {
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
        const response = await fetch('https://mxxtvtwcoplfajvazpav.supabase.co/functions/v1/figmant-check-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
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
    // For analyze-selection, build the settings from message data
    let settings: PluginExportSettings;
    
    if (msg.type === 'analyze-selection') {
      // Get session token from storage
      const sessionToken = await figma.clientStorage.getAsync('figmant_session_token');
      
      if (!sessionToken) {
        figma.ui.postMessage({
          type: 'export-error',
          data: { error: 'Authentication required. Please log in first.' }
        } as PluginMessage);
        return;
      }
      
      settings = {
        frames: getSelectedFrames(),
        context: msg.context || '',
        scale: 2,
        format: 'PNG',
        sessionToken: sessionToken
      };
    } else {
      settings = msg.data as PluginExportSettings;
    }
    
    try {
      const images = [];
      
      for (const frame of settings.frames) {
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
        }
      }
      
      // First, send the images to the upload API
      try {
        const uploadResponse = await fetch('https://mxxtvtwcoplfajvazpav.supabase.co/functions/v1/figmant-plugin-api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.sessionToken}`
          },
          body: JSON.stringify({
            images,
            context: settings.context,
            sessionTitle: `Figma Analysis - ${new Date().toLocaleString()}`
          })
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(errorData.error || `Upload failed: ${uploadResponse.status}`);
        }

        const result = await uploadResponse.json();

        figma.ui.postMessage({ 
          type: 'analysis-progress', 
          message: 'Starting UX analysis...',
          progress: 90
        });

        // Trigger the analysis using the main analysis function
        try {
          const analysisResponse = await fetch('https://mxxtvtwcoplfajvazpav.supabase.co/functions/v1/figmant-analyze-design', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${settings.sessionToken}`
            },
            body: JSON.stringify({
              sessionId: result.session_id
            })
          });

          if (!analysisResponse.ok) {
            const errorData = await analysisResponse.json().catch(() => ({ error: 'Analysis failed' }));
            throw new Error(errorData.error || `Analysis failed: ${analysisResponse.status}`);
          }

          const analysisResult = await analysisResponse.json();

          figma.ui.postMessage({
            type: 'analysis-complete',
            sessionId: result.session_id,
            analysisResult: analysisResult,
            imagesProcessed: result.images_processed,
            totalImages: result.total_images
          });

        } catch (analysisError: any) {
          console.error('Analysis error:', analysisError);
          // Still report upload success but note analysis failed
          figma.ui.postMessage({
            type: 'analysis-partial',
            sessionId: result.session_id,
            imagesProcessed: result.images_processed,
            totalImages: result.total_images,
            analysisError: analysisError.message,
            message: 'Images uploaded successfully, but analysis failed. You can retry the analysis from the web app.'
          });
        }
      } catch (uploadError: any) {
        figma.ui.postMessage({
          type: 'export-error',
          data: { error: uploadError.message || 'Upload failed' }
        } as PluginMessage);
      }
      
    } catch (error: any) {
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