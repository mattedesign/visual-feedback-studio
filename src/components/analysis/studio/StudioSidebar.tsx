
import { Files, Menu, MessageCircle } from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { SidebarUpload } from './SidebarUpload';

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

  const handleImageClick = (imageUrl: string) => {
    console.log('Clicking image in sidebar:', imageUrl);
    if (workflow.currentStep === 'annotate' || workflow.currentStep === 'results') {
      workflow.setActiveImage(imageUrl);
    } else {
      workflow.selectImage(imageUrl);
    }
  };

  const isImageActive = (imageUrl: string) => {
    return workflow.activeImageUrl === imageUrl || 
           (workflow.activeImageUrl === null && workflow.selectedImages[0] === imageUrl);
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 transition-all duration-300`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center mb-4">
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
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Images ({workflow.uploadedFiles.length})
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Step: {workflow.currentStep}
              </span>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <SidebarUpload workflow={workflow} collapsed={collapsed} />

        {/* Images List */}
        <div className="flex-1 overflow-y-auto">
          {!collapsed && (
            <div className="p-4">
              <div className="space-y-2 max-h-full">
                {workflow.uploadedFiles.map((file: string, index: number) => {
                  const isSelected = workflow.selectedImages.includes(file);
                  const isActive = isImageActive(file);
                  const annotations = getFileAnnotations(file);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleImageClick(file)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-200 dark:ring-blue-800' 
                          : isSelected
                          ? 'border-blue-300 bg-blue-25 dark:bg-blue-900/10 shadow-sm'
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={file} alt="Uploaded file" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            Image {index + 1}
                            {isActive && <span className="ml-1 text-blue-600 dark:text-blue-400">• Active</span>}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Design file</p>
                          </div>
                          {annotations.length > 0 && (
                            <div className="flex items-center mt-2">
                              <MessageCircle className="w-3 h-3 text-blue-500 mr-1" />
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
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

              {workflow.uploadedFiles.length > 1 && workflow.currentStep === 'annotate' && (
                <div className="text-center py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-600 mt-4 pt-4">
                  Click any image to annotate it
                </div>
              )}
            </div>
          )}

          {/* Collapsed state - show image thumbnails */}
          {collapsed && workflow.uploadedFiles.length > 0 && (
            <div className="p-2 space-y-2">
              {workflow.uploadedFiles.slice(0, 6).map((file: string, index: number) => {
                const isActive = isImageActive(file);
                
                return (
                  <div
                    key={index}
                    onClick={() => handleImageClick(file)}
                    className={`w-10 h-10 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      isActive 
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                        : 'border-gray-300 dark:border-slate-600 hover:border-gray-400'
                    }`}
                  >
                    <img src={file} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                );
              })}
              {workflow.uploadedFiles.length > 6 && (
                <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">+{workflow.uploadedFiles.length - 6}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
