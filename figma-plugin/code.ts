
// Main plugin code that runs in the Figma environment
figma.showUI(__html__, { 
  width: 400, 
  height: 600,
  themeColors: true 
});

interface AnalysisMessage {
  type: 'analyze-selection';
  apiKey: string;
  sessionTitle?: string;
  context?: string;
}

interface SelectionUpdateMessage {
  type: 'selection-update';
  count: number;
  hasFrames: boolean;
}

interface ConfigMessage {
  type: 'get-config';
}

interface ConfigResponse {
  type: 'config-response';
  apiKey?: string;
}

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case 'get-config':
        // Get stored API key
        const apiKey = await figma.clientStorage.getAsync('figmant-api-key');
        figma.ui.postMessage({
          type: 'config-response',
          apiKey: apiKey || ''
        });
        break;

      case 'save-api-key':
        // Save API key to client storage
        await figma.clientStorage.setAsync('figmant-api-key', msg.apiKey);
        figma.ui.postMessage({
          type: 'api-key-saved'
        });
        break;

      case 'analyze-selection':
        await handleAnalyzeSelection(msg as AnalysisMessage);
        break;

      case 'get-selection':
        updateSelectionInfo();
        break;

      default:
        console.warn('Unknown message type:', msg.type);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

// Update selection info when selection changes
figma.on('selectionchange', () => {
  updateSelectionInfo();
});

function updateSelectionInfo() {
  const selection = figma.currentPage.selection;
  const frames = selection.filter(node => 
    node.type === 'FRAME' || 
    node.type === 'COMPONENT' || 
    node.type === 'INSTANCE' ||
    node.type === 'GROUP'
  );

  figma.ui.postMessage({
    type: 'selection-update',
    count: selection.length,
    hasFrames: frames.length > 0,
    frameCount: frames.length
  } as SelectionUpdateMessage);
}

async function handleAnalyzeSelection(msg: AnalysisMessage) {
  try {
    figma.ui.postMessage({ type: 'analysis-start' });

    const selection = figma.currentPage.selection;
    const exportableNodes = selection.filter(node => 
      node.type === 'FRAME' || 
      node.type === 'COMPONENT' || 
      node.type === 'INSTANCE' ||
      node.type === 'GROUP'
    );

    if (exportableNodes.length === 0) {
      throw new Error('Please select at least one frame, component, or group to analyze');
    }

    if (exportableNodes.length > 5) {
      throw new Error('Maximum 5 selections allowed per analysis');
    }

    figma.ui.postMessage({ 
      type: 'analysis-progress', 
      message: 'Exporting images...',
      progress: 0
    });

    // Export each selected node as PNG
    const images = [];
    for (let i = 0; i < exportableNodes.length; i++) {
      const node = exportableNodes[i];
      
      figma.ui.postMessage({ 
        type: 'analysis-progress', 
        message: `Exporting ${node.name}...`,
        progress: (i / exportableNodes.length) * 50
      });

      try {
        const bytes = await node.exportAsync({
          format: 'PNG',
          constraint: {
            type: 'SCALE',
            value: 2 // 2x resolution for better quality
          }
        });

        // Convert Uint8Array to base64
        const base64 = await arrayBufferToBase64(bytes);
        
        images.push({
          name: node.name || `Frame ${i + 1}`,
          format: 'PNG' as const,
          image: `data:image/png;base64,${base64}`
        });
      } catch (exportError) {
        console.error(`Failed to export ${node.name}:`, exportError);
        throw new Error(`Failed to export "${node.name}". Try selecting a different frame.`);
      }
    }

    figma.ui.postMessage({ 
      type: 'analysis-progress', 
      message: 'Sending to Figmant API...',
      progress: 75
    });

    // Send to Figmant API
    const response = await fetch('https://mxxtvtwcoplfajvazpav.supabase.co/functions/v1/figmant-plugin-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': msg.apiKey
      },
      body: JSON.stringify({
        images: images,
        sessionTitle: msg.sessionTitle || `Figma Analysis - ${new Date().toLocaleString()}`,
        context: msg.context || 'Figma plugin analysis'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const result = await response.json();

    figma.ui.postMessage({
      type: 'analysis-complete',
      sessionId: result.session_id,
      imagesProcessed: result.images_processed,
      totalImages: result.total_images
    });

  } catch (error) {
    console.error('Analysis error:', error);
    figma.ui.postMessage({
      type: 'analysis-error',
      message: error instanceof Error ? error.message : 'Analysis failed'
    });
  }
}

// Helper function to convert ArrayBuffer to base64
async function arrayBufferToBase64(buffer: Uint8Array): Promise<string> {
  // Convert Uint8Array to regular array for processing
  const bytes = Array.from(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  // Use btoa to encode to base64
  return btoa(binary);
}

// Initialize
updateSelectionInfo();
