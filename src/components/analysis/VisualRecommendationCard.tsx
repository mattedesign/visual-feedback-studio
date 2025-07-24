import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Code, 
  Download, 
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Palette,
  Layout,
  MousePointer,
  Type,
  Smartphone,
  Monitor
} from 'lucide-react';

interface VisualRecommendationCardProps {
  annotation: {
    id: string;
    title: string;
    feedback: string;
    severity: string;
    category: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

export const VisualRecommendationCard: React.FC<VisualRecommendationCardProps> = ({
  annotation,
  isSelected,
  onClick
}) => {
  const [activeTab, setActiveTab] = useState('visual');

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'layout': return <Layout className="w-4 h-4" />;
      case 'typography': return <Type className="w-4 h-4" />;
      case 'color': return <Palette className="w-4 h-4" />;
      case 'interaction': return <MousePointer className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const generateVisualRecommendation = () => {
    const categoryLower = annotation.category.toLowerCase();
    
    // Generate different visual recommendations based on category
    switch (categoryLower) {
      case 'layout':
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Layout className="w-4 h-4 text-blue-600" />
                Improved Layout Structure
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Before</p>
                  <div className="bg-gray-200 rounded p-3 space-y-1">
                    <div className="bg-gray-400 h-3 rounded w-3/4"></div>
                    <div className="bg-gray-400 h-2 rounded w-1/2"></div>
                    <div className="bg-gray-400 h-2 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-700">After</p>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded p-3 space-y-2">
                    <div className="bg-blue-500 h-4 rounded w-3/4"></div>
                    <div className="bg-blue-300 h-2 rounded w-1/2"></div>
                    <div className="bg-blue-300 h-2 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" />
                Improved visual hierarchy and content organization
              </div>
            </div>
          </div>
        );
        
      case 'typography':
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Type className="w-4 h-4 text-purple-600" />
                Typography Enhancement
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-100 rounded">
                  <p className="text-sm text-gray-600 mb-1">Before:</p>
                  <div className="text-sm text-gray-500">Small, hard to read text</div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 mx-auto" />
                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <p className="text-sm text-purple-600 mb-1">After:</p>
                  <div className="text-lg font-semibold text-purple-800">Clear, readable typography</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                ✨ Improved readability and accessibility
              </div>
            </div>
          </div>
        );
        
      case 'color':
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4 text-green-600" />
                Color Scheme Optimization
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Colors</p>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                    <div className="w-6 h-6 bg-gray-500 rounded"></div>
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-green-600 mb-2">Recommended Colors</p>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <div className="w-6 h-6 bg-purple-500 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-green-700">
                🎨 Better contrast and brand alignment
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gradient-to-br from-orange-50 to-red-50">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-orange-600" />
                Interactive Prototype
              </h4>
              <div className="bg-white border rounded p-4 space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Current Implementation</span>
                  <Badge variant="outline" className="text-xs">Needs Improvement</Badge>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-600 mx-auto" />
                <div className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded">
                  <span className="text-sm font-medium">Enhanced Solution</span>
                  <Badge className="text-xs bg-green-600">Optimized</Badge>
                </div>
              </div>
              <div className="mt-3 text-xs text-orange-700">
                🚀 Improved user experience and engagement
              </div>
            </div>
          </div>
        );
    }
  };

  const generateCodeSnippet = () => {
    const categoryLower = annotation.category.toLowerCase();
    
    switch (categoryLower) {
      case 'layout':
        return `<!-- Improved Layout Structure -->
<div class="container max-w-4xl mx-auto px-6">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">
      Clear Hierarchy
    </h1>
    <p class="text-lg text-gray-600">
      Improved content organization
    </p>
  </header>
  
  <main class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <!-- Content blocks with proper spacing -->
  </main>
</div>`;
        
      case 'typography':
        return `/* Enhanced Typography */
.heading-primary {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2937;
  margin-bottom: 1rem;
}

.body-text {
  font-size: 1.125rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 1.5rem;
}

/* Improved readability */
@media (max-width: 768px) {
  .heading-primary {
    font-size: 1.875rem;
  }
}`;
        
      case 'color':
        return `/* Optimized Color Palette */
:root {
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --secondary: #10b981;
  --accent: #8b5cf6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --background: #ffffff;
  --surface: #f9fafb;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}`;
        
      default:
        return `// Enhanced Component Implementation
import React from 'react';

const EnhancedComponent = () => {
  return (
    <div className="improved-container">
      <div className="content-wrapper">
        <h2 className="enhanced-heading">
          Optimized User Experience
        </h2>
        <p className="improved-description">
          This implementation addresses the identified issues
          and provides better usability.
        </p>
        <button className="cta-button enhanced">
          Take Action
        </button>
      </div>
    </div>
  );
};

export default EnhancedComponent;`;
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            {getCategoryIcon(annotation.category)}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-medium leading-5 line-clamp-2">
                {annotation.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {annotation.category}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-xs shrink-0 ${getSeverityColor(annotation.severity)}`}
          >
            {annotation.severity}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="visual" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs">
              <Code className="w-3 h-3 mr-1" />
              Code
            </TabsTrigger>
            <TabsTrigger value="impact" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Impact
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="mt-0">
            {generateVisualRecommendation()}
          </TabsContent>
          
          <TabsContent value="code" className="mt-0">
            <div className="space-y-3">
              <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                <pre className="text-xs text-green-400 whitespace-pre-wrap">
                  {generateCodeSnippet()}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export Code
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="impact" className="mt-0">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-700">+25%</div>
                  <div className="text-xs text-green-600">User Engagement</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-700">+18%</div>
                  <div className="text-xs text-blue-600">Conversion Rate</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <h5 className="text-xs font-semibold mb-2">Implementation Benefits:</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Improved user experience
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Better accessibility
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Higher engagement metrics
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {annotation.feedback}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};