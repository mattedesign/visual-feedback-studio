
import { Clock, FileImage, Globe, Figma } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisWithFiles } from '@/services/analysisDataService';

interface PreviousAnalysesProps {
  analyses: AnalysisWithFiles[];
  onLoadAnalysis: (analysisId: string) => void;
  isLoading: boolean;
}

export const PreviousAnalyses = ({ analyses, onLoadAnalysis, isLoading }: PreviousAnalysesProps) => {
  const getUploadTypeIcon = (uploadType: string) => {
    switch (uploadType) {
      case 'file':
        return <FileImage className="w-4 h-4" />;
      case 'figma':
        return <Figma className="w-4 h-4" />;
      case 'website':
      case 'url':
        return <Globe className="w-4 h-4" />;
      default:
        return <FileImage className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Previous Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg">Previous Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-8">
            No previous analyses found. Upload your first design to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg">Previous Analyses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-1">
                {analysis.files.map((file, index) => (
                  <div key={file.id} className="text-slate-400">
                    {getUploadTypeIcon(file.upload_type)}
                  </div>
                ))}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-200 truncate">{analysis.title}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(analysis.created_at)}</span>
                  <span>•</span>
                  <span>{analysis.files.length} file{analysis.files.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => onLoadAnalysis(analysis.id)}
              variant="outline"
              size="sm"
              className="border-slate-600 hover:bg-slate-600 text-slate-200"
            >
              Load
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
