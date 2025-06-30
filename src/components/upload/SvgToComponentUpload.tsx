
import { useState, useRef } from 'react';
import { Upload, Code, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const SvgToComponentUpload = () => {
  const [svgContent, setSvgContent] = useState('');
  const [componentName, setComponentName] = useState('');
  const [generatedComponent, setGeneratedComponent] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSvgContent(content);
        
        // Auto-generate component name from filename
        const fileName = file.name.replace('.svg', '');
        const camelCaseName = fileName
          .split(/[-_\s]/)
          .map((word, index) => 
            index === 0 
              ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join('');
        setComponentName(camelCaseName + 'Icon');
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  };

  const convertSvgToComponent = () => {
    if (!svgContent || !componentName) return;

    // Parse SVG and convert to React component
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    
    if (!svgElement) return;

    // Get SVG attributes
    const width = svgElement.getAttribute('width') || '24';
    const height = svgElement.getAttribute('height') || '24';
    const viewBox = svgElement.getAttribute('viewBox') || `0 0 ${width} ${height}`;
    
    // Get inner SVG content
    const innerContent = svgElement.innerHTML;
    
    // Convert attributes to camelCase and handle React-specific attributes
    const convertedContent = innerContent
      .replace(/fill-rule/g, 'fillRule')
      .replace(/clip-rule/g, 'clipRule')
      .replace(/stroke-width/g, 'strokeWidth')
      .replace(/stroke-linecap/g, 'strokeLinecap')
      .replace(/stroke-linejoin/g, 'strokeLinejoin')
      .replace(/stroke-dasharray/g, 'strokeDasharray')
      .replace(/stroke-dashoffset/g, 'strokeDashoffset')
      .replace(/fill-opacity/g, 'fillOpacity')
      .replace(/stroke-opacity/g, 'strokeOpacity');

    const componentCode = `import React from 'react';

interface ${componentName}Props {
  size?: number | string;
  className?: string;
  color?: string;
}

export const ${componentName} = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}: ${componentName}Props) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="${viewBox}"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
    >
      ${convertedContent}
    </svg>
  );
};`;

    setGeneratedComponent(componentCode);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedComponent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadComponent = () => {
    const blob = new Blob([generatedComponent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            SVG to React Component Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="svg-upload">Upload SVG File</Label>
            <input
              ref={fileInputRef}
              id="svg-upload"
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full mt-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose SVG File
            </Button>
          </div>

          {/* Component Name Input */}
          {svgContent && (
            <div>
              <Label htmlFor="component-name">Component Name</Label>
              <Input
                id="component-name"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="e.g., MyIcon"
                className="mt-2"
              />
            </div>
          )}

          {/* SVG Preview */}
          {svgContent && (
            <div>
              <Label>SVG Preview</Label>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
              </div>
            </div>
          )}

          {/* Generate Button */}
          {svgContent && componentName && (
            <Button onClick={convertSvgToComponent} className="w-full">
              <Code className="w-4 h-4 mr-2" />
              Generate React Component
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Generated Component */}
      {generatedComponent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Component</span>
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  onClick={downloadComponent}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedComponent}
              readOnly
              className="font-mono text-sm h-96 resize-none"
            />
            
            {/* Usage Example */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Usage Example:</h4>
              <code className="text-sm">
                {`import { ${componentName} } from './components/icons/${componentName}';

// Basic usage
<${componentName} />

// With custom size and color
<${componentName} size={32} color="red" />

// With Tailwind classes
<${componentName} className="text-blue-500 hover:text-blue-700" />`}
              </code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
