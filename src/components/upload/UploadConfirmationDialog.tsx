
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AnalysisWithFiles } from '@/services/analysisDataService';

interface UploadConfirmationDialogProps {
  open: boolean;
  uploadedAnalysis: AnalysisWithFiles | null;
  onViewAnalysis: () => void;
  onUploadAnother: () => void;
  onDismiss: () => void;
}

export const UploadConfirmationDialog = ({
  open,
  uploadedAnalysis,
  onViewAnalysis,
  onUploadAnother,
  onDismiss,
}: UploadConfirmationDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <AlertDialogContent className="bg-slate-800 border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Upload Successful!</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            Your design "{uploadedAnalysis?.title}" has been uploaded successfully. 
            What would you like to do next?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onClick={onUploadAnother}
            className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
          >
            Upload Another
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onViewAnalysis}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            View Analysis
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
