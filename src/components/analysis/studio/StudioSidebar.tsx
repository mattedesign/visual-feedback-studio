import { Files, Menu, MessageCircle } from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface StudioSidebarProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const StudioSidebar = ({ workflow, collapsed, setCollapsed }: StudioSidebarProps) => {
  const getFileAnnotations = (fileUrl: string) => {
    const imageAnnotations = workflow.imageAnnotations.find(ia => ia.imageUrl === fileUrl);
    return imageAnnotations?.annotations || [];
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 transition-all duration-300`}>
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
            <Files className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-xl text-gray-900 dark:text-white">UXAnalyzer</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {!collapsed && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Files ({workflow.uploadedFiles.length})
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Step: {workflow.currentStep}
              </span>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {workflow.uploadedFiles.map((file: string, index: number) => {
                const isSelected = workflow.selectedImages.includes(file);
                const annotations = getFileAnnotations(file);
                
                return (
                  <div
                    key={index}
                    onClick={() => workflow.selectImage(file)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                        <img src={file} alt="Uploaded file" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          Design {index + 1}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Image file</p>
                        </div>
                        {annotations.length > 0 && (
                          <div className="flex items-center mt-1">
                            <MessageCircle className="w-3 h-3 text-blue-500 mr-1" />
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {annotations.length} annotations
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {workflow.uploadedFiles.length === 0 && (
              <div className="text-center py-6">
                <Files className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No files uploaded yet</p>
                <p className="text-xs text-gray-400">Upload your first design to get started</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};