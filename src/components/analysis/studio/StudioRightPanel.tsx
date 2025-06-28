
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface StudioRightPanelProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  collapsed: boolean;
}

export const StudioRightPanel = ({ workflow, collapsed }: StudioRightPanelProps) => {
  if (collapsed) {
    return <div className="w-0" />;
  }

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 p-4">
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-700">
          <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
          <TabsTrigger value="annotations" className="text-xs">Annotations</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Analysis Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Status</label>
                <div className="mt-1">
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-300">
                    {workflow.currentStep}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-slate-400">Images</label>
                <p className="text-sm text-slate-300 mt-1">
                  {workflow.selectedImages.length} selected
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400">Annotations</label>
                <p className="text-sm text-slate-300 mt-1">
                  {workflow.getTotalAnnotationsCount()} total
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="annotations" className="space-y-4">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">User Annotations</CardTitle>
            </CardHeader>
            <CardContent>
              {workflow.getTotalAnnotationsCount() === 0 ? (
                <p className="text-xs text-slate-400">No annotations yet</p>
              ) : (
                <div className="space-y-2">
                  {workflow.imageAnnotations.map((imageAnnotation, imageIndex) => (
                    <div key={imageIndex}>
                      <p className="text-xs text-slate-400 mb-1">
                        Image {imageIndex + 1}: {imageAnnotation.annotations.length} annotations
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {workflow.aiAnnotations.length === 0 ? (
                <p className="text-xs text-slate-400">Run analysis to get insights</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">
                    {workflow.aiAnnotations.length} AI recommendations
                  </p>
                  <div className="space-y-1">
                    {['critical', 'suggested', 'enhancement'].map(severity => {
                      const count = workflow.aiAnnotations.filter(a => a.severity === severity).length;
                      if (count === 0) return null;
                      return (
                        <div key={severity} className="flex justify-between text-xs">
                          <span className="text-slate-400 capitalize">{severity}:</span>
                          <span className="text-slate-300">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
