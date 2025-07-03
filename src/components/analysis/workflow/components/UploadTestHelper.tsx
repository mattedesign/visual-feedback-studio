import React from 'react';
import { Button } from '@/components/ui/button';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

// Simple test helper to verify upload functionality
export const UploadTestHelper: React.FC = () => {
  const workflow = useAnalysisWorkflow();

  const addTestImage = () => {
    // Add a test image URL
    const testImageUrl = 'https://via.placeholder.com/800x600/0066cc/ffffff?text=Test+Design';
    workflow.addUploadedFile(testImageUrl);
  };

  const addMultipleTestImages = () => {
    const testImages = [
      'https://via.placeholder.com/800x600/0066cc/ffffff?text=Design+1',
      'https://via.placeholder.com/800x600/cc6600/ffffff?text=Design+2',
      'https://via.placeholder.com/800x600/009900/ffffff?text=Design+3'
    ];
    
    testImages.forEach((url, index) => {
      setTimeout(() => {
        workflow.addUploadedFile(url);
      }, index * 100);
    });
  };

  const setTestContext = () => {
    workflow.setAnalysisContext('Testing the UX analysis workflow with sample designs. Please analyze the layout, color scheme, and user interface elements.');
  };

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/50">
      <h4 className="font-medium mb-3 text-sm">Test Upload Functionality</h4>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={addTestImage}>
          Add Test Image
        </Button>
        <Button variant="outline" size="sm" onClick={addMultipleTestImages}>
          Add Multiple
        </Button>
        <Button variant="outline" size="sm" onClick={setTestContext}>
          Set Test Context
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => workflow.resetWorkflow()}
          className="text-destructive hover:text-destructive"
        >
          Reset
        </Button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Current: {workflow.selectedImages.length} images, Step: {workflow.currentStep}
      </div>
    </div>
  );
};