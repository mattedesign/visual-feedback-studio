// Enhanced analysis functions for Phase 4.1 Figma Plugin
// These functions add sophisticated design pattern detection and analysis

// Analyze component patterns for design system consistency
function analyzeComponentPatterns(components: ComponentNode[]): any {
  const patterns = {
    buttonVariants: [],
    cardPatterns: [],
    navigationElements: [],
    formElements: [],
    inconsistencies: []
  };

  components.forEach(component => {
    const name = component.name.toLowerCase();
    
    if (name.includes('button')) {
      patterns.buttonVariants.push({
        name: component.name,
        id: component.id,
        variants: component.variantProperties || {},
        hasStates: checkForStates(component)
      });
    }
    
    if (name.includes('card')) {
      patterns.cardPatterns.push({
        name: component.name,
        id: component.id,
        structure: analyzeCardStructure(component)
      });
    }
    
    if (name.includes('nav') || name.includes('menu')) {
      patterns.navigationElements.push({
        name: component.name,
        id: component.id,
        hierarchy: analyzeNavigationHierarchy(component)
      });
    }
  });

  return patterns;
}

// Detect design system violations
function detectDesignSystemViolations(selection: readonly SceneNode[]): any[] {
  const violations = [];
  
  selection.forEach(node => {
    // Check for inconsistent spacing
    const spacingViolations = checkSpacingConsistency(node);
    if (spacingViolations.length > 0) {
      violations.push({
        type: 'spacing_inconsistency',
        nodeId: node.id,
        nodeName: node.name,
        violations: spacingViolations
      });
    }
    
    // Check for color inconsistencies
    const colorViolations = checkColorConsistency(node);
    if (colorViolations.length > 0) {
      violations.push({
        type: 'color_inconsistency',
        nodeId: node.id,
        nodeName: node.name,
        violations: colorViolations
      });
    }
    
    // Check for typography inconsistencies
    const typographyViolations = checkTypographyConsistency(node);
    if (typographyViolations.length > 0) {
      violations.push({
        type: 'typography_inconsistency',
        nodeId: node.id,
        nodeName: node.name,
        violations: typographyViolations
      });
    }
  });
  
  return violations;
}

// Detect responsive breakpoints from frame names and constraints
function detectResponsiveBreakpoints(): any {
  const frames = figma.currentPage.findAll(node => node.type === 'FRAME') as FrameNode[];
  const breakpoints = new Set<number>();
  
  frames.forEach(frame => {
    const name = frame.name.toLowerCase();
    
    // Common mobile breakpoints
    if (name.includes('mobile') || name.includes('phone')) {
      breakpoints.add(375);
    }
    
    // Tablet breakpoints
    if (name.includes('tablet') || name.includes('ipad')) {
      breakpoints.add(768);
    }
    
    // Desktop breakpoints
    if (name.includes('desktop') || name.includes('laptop')) {
      breakpoints.add(1024);
    }
    
    // Extract explicit sizes from frame dimensions
    if (frame.width) {
      breakpoints.add(Math.round(frame.width));
    }
  });
  
  return {
    detected: Array.from(breakpoints).sort((a, b) => a - b),
    frames: frames.map(frame => ({
      name: frame.name,
      width: frame.width,
      height: frame.height,
      id: frame.id
    }))
  };
}

// Extract accessibility-related design tokens
function extractAccessibilityTokens(selection: readonly SceneNode[]): any {
  const tokens = {
    contrastRatios: [],
    focusIndicators: [],
    semanticColors: [],
    textSizes: []
  };
  
  selection.forEach(node => {
    if (node.type === 'TEXT') {
      const textNode = node as TextNode;
      tokens.textSizes.push({
        nodeId: node.id,
        fontSize: textNode.fontSize,
        fontWeight: textNode.fontWeight,
        lineHeight: textNode.lineHeight,
        letterSpacing: textNode.letterSpacing
      });
    }
    
    // Check for proper focus indicators
    if (node.type === 'FRAME' || node.type === 'COMPONENT') {
      const focusStates = checkForFocusStates(node);
      if (focusStates.length > 0) {
        tokens.focusIndicators.push({
          nodeId: node.id,
          nodeName: node.name,
          focusStates
        });
      }
    }
  });
  
  return tokens;
}

// Analyze semantic structure of the selection
function analyzeSemanticStructure(selection: readonly SceneNode[]): any {
  const structure = {
    headingHierarchy: [],
    landmarkRegions: [],
    interactiveElements: [],
    informationArchitecture: []
  };
  
  selection.forEach(node => {
    if (node.type === 'TEXT') {
      const textNode = node as TextNode;
      const text = textNode.characters;
      
      // Detect heading patterns
      if (isHeadingText(text, textNode)) {
        structure.headingHierarchy.push({
          nodeId: node.id,
          text: text.substring(0, 50),
          level: detectHeadingLevel(textNode),
          fontSize: textNode.fontSize
        });
      }
    }
    
    // Detect landmark regions
    const landmarkType = detectLandmarkType(node);
    if (landmarkType) {
      structure.landmarkRegions.push({
        nodeId: node.id,
        nodeName: node.name,
        type: landmarkType
      });
    }
    
    // Detect interactive elements
    if (isInteractiveElement(node)) {
      structure.interactiveElements.push({
        nodeId: node.id,
        nodeName: node.name,
        type: getInteractiveType(node),
        hasStates: checkForStates(node)
      });
    }
  });
  
  return structure;
}

// Prepare annotation metadata for real-time feedback
async function prepareAnnotationMetadata(images: any[]): Promise<any> {
  const metadata = {
    annotations: [],
    coordinates: [],
    contextualInfo: []
  };
  
  for (const image of images) {
    const node = figma.getNodeById(image.id);
    if (node) {
      metadata.annotations.push({
        nodeId: image.id,
        nodeName: node.name,
        bounds: {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height
        },
        type: node.type,
        designTokens: await extractNodeSpecificTokens(node)
      });
    }
  }
  
  return metadata;
}

// Get current selection bounds for real-time positioning
function getSelectionBounds(): any {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) return null;
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  selection.forEach(node => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

// Analyze current page structure
function analyzePageStructure(): any {
  const allNodes = figma.currentPage.findAll();
  
  return {
    totalNodes: allNodes.length,
    frameCount: allNodes.filter(n => n.type === 'FRAME').length,
    componentCount: allNodes.filter(n => n.type === 'COMPONENT').length,
    textNodes: allNodes.filter(n => n.type === 'TEXT').length,
    depth: calculateMaxDepth(figma.currentPage),
    complexity: calculateComplexityScore(allNodes)
  };
}

// Helper functions
function checkForStates(node: SceneNode): boolean {
  return node.name.includes('hover') || node.name.includes('active') || 
         node.name.includes('focus') || node.name.includes('disabled');
}

function analyzeCardStructure(component: ComponentNode): any {
  const children = component.findAll();
  return {
    hasImage: children.some(child => child.type === 'RECTANGLE' && child.name.toLowerCase().includes('image')),
    hasTitle: children.some(child => child.type === 'TEXT' && child.name.toLowerCase().includes('title')),
    hasDescription: children.some(child => child.type === 'TEXT' && child.name.toLowerCase().includes('description')),
    hasAction: children.some(child => child.name.toLowerCase().includes('button')),
    childCount: children.length
  };
}

function analyzeNavigationHierarchy(component: ComponentNode): any {
  const textNodes = component.findAll(node => node.type === 'TEXT') as TextNode[];
  return {
    levels: textNodes.map(text => ({
      text: text.characters.substring(0, 20),
      fontSize: text.fontSize,
      weight: text.fontWeight
    })).sort((a, b) => (b.fontSize as number) - (a.fontSize as number))
  };
}

function checkSpacingConsistency(node: SceneNode): string[] {
  // Implementation for spacing consistency checks
  return [];
}

function checkColorConsistency(node: SceneNode): string[] {
  // Implementation for color consistency checks
  return [];
}

function checkTypographyConsistency(node: SceneNode): string[] {
  // Implementation for typography consistency checks
  return [];
}

function checkForFocusStates(node: SceneNode): any[] {
  // Implementation for focus state detection
  return [];
}

function isHeadingText(text: string, textNode: TextNode): boolean {
  const fontSize = textNode.fontSize as number;
  const weight = textNode.fontWeight;
  return fontSize > 16 && (weight === 600 || weight === 700 || weight === 800);
}

function detectHeadingLevel(textNode: TextNode): number {
  const fontSize = textNode.fontSize as number;
  if (fontSize >= 32) return 1;
  if (fontSize >= 24) return 2;
  if (fontSize >= 20) return 3;
  if (fontSize >= 18) return 4;
  return 5;
}

function detectLandmarkType(node: SceneNode): string | null {
  const name = node.name.toLowerCase();
  if (name.includes('header') || name.includes('nav')) return 'navigation';
  if (name.includes('main') || name.includes('content')) return 'main';
  if (name.includes('sidebar')) return 'complementary';
  if (name.includes('footer')) return 'contentinfo';
  return null;
}

function isInteractiveElement(node: SceneNode): boolean {
  const name = node.name.toLowerCase();
  return name.includes('button') || name.includes('link') || 
         name.includes('input') || name.includes('form') ||
         name.includes('select') || name.includes('checkbox');
}

function getInteractiveType(node: SceneNode): string {
  const name = node.name.toLowerCase();
  if (name.includes('button')) return 'button';
  if (name.includes('link')) return 'link';
  if (name.includes('input')) return 'input';
  if (name.includes('form')) return 'form';
  return 'interactive';
}

async function extractNodeSpecificTokens(node: SceneNode): Promise<any> {
  // Extract specific design tokens for this node
  return {
    position: { x: node.x, y: node.y },
    dimensions: { width: node.width, height: node.height },
    type: node.type,
    name: node.name
  };
}

function calculateMaxDepth(node: any, currentDepth: number = 0): number {
  if (!node.children || node.children.length === 0) {
    return currentDepth;
  }
  
  let maxChildDepth = currentDepth;
  for (const child of node.children) {
    const childDepth = calculateMaxDepth(child, currentDepth + 1);
    maxChildDepth = Math.max(maxChildDepth, childDepth);
  }
  
  return maxChildDepth;
}

function calculateComplexityScore(nodes: readonly SceneNode[]): number {
  // Simple complexity calculation based on node count and types
  const weights = {
    'FRAME': 1,
    'GROUP': 1,
    'TEXT': 0.5,
    'RECTANGLE': 0.3,
    'COMPONENT': 2,
    'INSTANCE': 1.5
  };
  
  return nodes.reduce((score, node) => {
    return score + (weights[node.type] || 1);
  }, 0);
}

// Export functions for use in main code
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeComponentPatterns,
    detectDesignSystemViolations,
    detectResponsiveBreakpoints,
    extractAccessibilityTokens,
    analyzeSemanticStructure,
    prepareAnnotationMetadata,
    getSelectionBounds,
    analyzePageStructure
  };
}