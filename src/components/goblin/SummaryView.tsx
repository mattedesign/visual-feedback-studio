import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SummaryViewProps {
  results: any;
  session: any;
  personaData: any;
  onExport: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

const SummaryView: React.FC<SummaryViewProps> = ({
  results,
  session,
  personaData,
  onExport,
  onCopyLink,
  copied
}) => {
  const getGripeEmoji = (level: string) => {
    switch(level) {
      case 'low': return '😤';
      case 'medium': return '🤬';
      case 'rage-cranked': return '🌋';
      default: return '👾';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{session?.title || 'Goblin Analysis'}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{session?.persona_type}</Badge>
            {results?.goblin_gripe_level && (
              <Badge variant="secondary">
                {getGripeEmoji(results.goblin_gripe_level)} {results.goblin_gripe_level}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCopyLink} variant="outline">
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button onClick={onExport}>
            Export Results
          </Button>
        </div>
      </div>

      {/* Analysis Summary */}
      {personaData?.analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{personaData.analysis}</p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {personaData?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{personaData.recommendations}</p>
          </CardContent>
        </Card>
      )}

      {/* Priority Matrix */}
      {results?.priority_matrix && (
        <Card>
          <CardHeader>
            <CardTitle>Priority Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(results.priority_matrix, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Synthesis Summary */}
      {results?.synthesis_summary && (
        <Card>
          <CardHeader>
            <CardTitle>Synthesis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{results.synthesis_summary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SummaryView;