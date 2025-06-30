
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { MessageSquare, Settings, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UploadCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadCanvasState = ({
  workflow
}: UploadCanvasStateProps) => {
  return (
    <div className="flex items-center justify-center h-full bg-transparent">
      <div className="w-full max-w-6xl px-8">
        {/* Three-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Example Prompt Column */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 mb-6">Example Prompt</h2>
            </div>
            
            <div className="space-y-3">
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Example prompt 1</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Example prompt 2</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Example prompt 3</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Example prompt 4</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Example prompt 5</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Capabilities Column */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Settings className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 mb-6">Capabilities</h2>
            </div>
            
            <div className="space-y-3">
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Insights backed by 272+ UX research studies</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Creates actionable and detailed insights</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Annotate on specific images</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Comparative results between designs</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Extracts information from UI and recommendati...</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Models Column */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 mb-6">Models</h2>
            </div>
            
            <div className="space-y-3">
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Open AI GPT 4o</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Claude Sonnet 3.5</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Claude Sonnet 4</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Claude Opus</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-50 border-0">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">Google Vision</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
