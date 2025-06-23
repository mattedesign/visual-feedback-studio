
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Eye, X } from 'lucide-react';

interface Annotation {
  id: string;
  x: number;
  y: number;
  comment: string;
}

interface AnalysisSidebarProps {
  selectedImagesCount: number;
  totalAnnotations: number;
  currentImageAnnotations: Annotation[];
  currentImageIndex: number;
  analysisContext: string;
  isComparative: boolean;
  onAnalysisContextChange: (value: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

export const AnalysisSidebar = ({
  selectedImagesCount,
  totalAnnotations,
  currentImageAnnotations,
  currentImageIndex,
  analysisContext,
  isComparative,
  onAnalysisContextChange,
  onDeleteAnnotation,
}: AnalysisSidebarProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-3">
          Analysis Summary
        </h3>
        <div className="space-y-2">
          <div className="bg-slate-700 p-3 rounded">
            <div className="text-sm font-medium">Selected Images</div>
            <div className="text-2xl font-bold text-blue-500">{selectedImagesCount}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded">
            <div className="text-sm font-medium">Total Comments</div>
            <div className="text-2xl font-bold text-green-500">{totalAnnotations}</div>
          </div>
          <div className="bg-slate-700 p-3 rounded">
            <div className="text-sm font-medium">Current Image</div>
            <div className="text-lg font-bold text-purple-500">{currentImageAnnotations.length} comments</div>
          </div>
        </div>
      </div>

      {/* Current image comments */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Comments on Image {currentImageIndex + 1}
        </h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {currentImageAnnotations.length === 0 ? (
            <div className="text-xs text-slate-400 italic p-2 bg-slate-700/50 rounded">
              No comments yet. Click on the image to add feedback points.
            </div>
          ) : (
            currentImageAnnotations.map((annotation, index) => (
              <div key={annotation.id} className="bg-slate-700 p-2 rounded text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium">#{index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteAnnotation(annotation.id)}
                    className="h-4 w-4 p-0 text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-slate-300 text-xs line-clamp-2">{annotation.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Analysis context */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {isComparative ? 'Comparative Analysis Context' : 'General Analysis Context'}
        </label>
        <Textarea
          value={analysisContext}
          onChange={(e) => onAnalysisContextChange(e.target.value)}
          placeholder={
            isComparative 
              ? "Describe what you want to compare across these images (e.g., 'Compare the conversion flows', 'Analyze consistency in branding')"
              : "Add context for analyzing all images individually..."
          }
          className="bg-slate-700 border-slate-600"
          rows={4}
        />
      </div>
    </div>
  );
};
