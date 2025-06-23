
import { Button } from '@/components/ui/button';
import { RotateCcw, Download, Share } from 'lucide-react';

interface ResultsActionsProps {
  onStartNew: () => void;
}

export const ResultsActions = ({ onStartNew }: ResultsActionsProps) => {
  return (
    <div className="flex justify-between pt-6">
      <Button
        onClick={onStartNew}
        variant="outline"
        className="border-2 border-gray-400 hover:bg-gray-100 text-base font-semibold px-6 py-3"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Start New Analysis
      </Button>
      
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="border-2 border-gray-400 hover:bg-gray-100 text-base font-semibold px-6 py-3"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Results
        </Button>
        <Button
          variant="outline"
          className="border-2 border-gray-400 hover:bg-gray-100 text-base font-semibold px-6 py-3"
        >
          <Share className="w-5 h-5 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};
