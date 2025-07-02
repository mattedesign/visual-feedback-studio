
import { Files, MessageCircle, Target, Trash2, LogOut } from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { SidebarUpload } from './SidebarUpload';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface StudioSidebarProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const StudioSidebar = ({
  workflow,
  collapsed,
  setCollapsed
}: StudioSidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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

  const handleDeleteImage = (imageUrl: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the image click
    console.log('Deleting image:', imageUrl);
    
    // Remove the image from the uploaded files
    const updatedImages = workflow.uploadedFiles.filter(file => file !== imageUrl);
    workflow.selectImages(updatedImages);
    
    // If this was the active image, set a new active image or clear it
    if (workflow.activeImageUrl === imageUrl) {
      if (updatedImages.length > 0) {
        workflow.setActiveImage(updatedImages[0]);
      } else {
        workflow.setActiveImage(null);
      }
    }
  };

  const isImageActive = (imageUrl: string) => {
    return workflow.activeImageUrl === imageUrl || workflow.activeImageUrl === null && workflow.selectedImages[0] === imageUrl;
  };

  return (
    <div style={{
      borderRadius: '20px',
      background: 'var(--01-White-01, #FFF)',
      boxShadow: '0px 2px 0px 0px rgba(255, 255, 255, 0.80) inset, 0px 1px 3.2px -2px rgba(0, 0, 0, 0.99)',
      display: 'flex',
      width: collapsed ? '64px' : '240px',
      flexDirection: 'column',
      alignItems: 'center',
      flexShrink: 0,
      alignSelf: 'stretch',
      marginLeft: '12px',
      marginRight: '12px',
      marginTop: '12px',
      marginBottom: '12px',
      height: 'calc(100vh - 24px)',
      transition: 'width 0.3s ease'
    }}>
      <div className="flex flex-col h-full w-full">
        {/* Header */}
        <div className={`border-b border-gray-200 dark:border-slate-700 ${collapsed ? 'p-3' : 'p-6'}`}>
          <div className="flex items-center justify-center">
            {/* Logo - only show when not collapsed */}
            {!collapsed && (
              <img 
                src="/lovable-uploads/47930faa-a736-4a3b-a873-e704ca21395f.png" 
                alt="Figmant" 
                className="h-6 mr-3"
              />
            )}
            
            {/* Expand/Collapse Button - always visible */}
            <button 
              onClick={() => setCollapsed(!collapsed)} 
              className={`p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors ${collapsed ? 'mx-auto' : 'ml-auto'}`}
            >
              <img 
                src="/lovable-uploads/7d4bfbe9-e4ca-4e8d-9d33-77637e4dcdc6.png" 
                alt="Menu" 
                className="w-6 h-6 text-gray-500"
              />
            </button>
          </div>

          {/* Analysis Context Indicator - Hidden when collapsed */}
          {!collapsed && (
            <div className="mb-2 hidden">
              <div className="flex items-center space-x-2">
                <Target className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Analysis Context:</span>
              </div>
              <div className="mt-1">
                {workflow.analysisContext ? <Badge variant="secondary" className="text-xs max-w-full">
                    <span className="truncate">
                      {workflow.analysisContext.length > 30 ? workflow.analysisContext.substring(0, 30) + '...' : workflow.analysisContext}
                    </span>
                  </Badge> : <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400">
                    Not set
                  </Badge>}
              </div>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <SidebarUpload workflow={workflow} collapsed={collapsed} />

        {/* Images List */}
        <div className="flex-1 overflow-y-auto">
          {!collapsed && <div className="p-4">
              <div className="space-y-2 max-h-full">
                {workflow.uploadedFiles.map((file: string, index: number) => {
              const isSelected = workflow.selectedImages.includes(file);
              const isActive = isImageActive(file);
              const annotations = getFileAnnotations(file);
              return <div key={index} className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-200 dark:ring-blue-800' : isSelected ? 'border-blue-300 bg-blue-25 dark:bg-blue-900/10 shadow-sm' : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-sm'}`}>
                      <div className="flex items-center space-x-3" onClick={() => handleImageClick(file)}>
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
                          {annotations.length > 0 && <div className="flex items-center mt-2">
                              <MessageCircle className="w-3 h-3 text-blue-500 mr-1" />
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
                              </p>
                            </div>}
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteImage(file, e)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                        title="Delete image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>;
            })}
              </div>
              
              {workflow.uploadedFiles.length === 0 && <div className="text-center py-6" style={{
            display: 'none'
          }}>
                  <Files className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No files uploaded yet</p>
                  <p className="text-xs text-gray-400">Upload your first design to get started</p>
                </div>}

              {workflow.uploadedFiles.length > 1 && workflow.currentStep === 'annotate' && <div className="text-center py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-slate-600 mt-4 pt-4">
                  Click any image to annotate it
                </div>}
            </div>}

          {/* Collapsed state - show image thumbnails */}
          {collapsed && workflow.uploadedFiles.length > 0 && <div className="p-2 space-y-2">
              {/* Context indicator for collapsed state */}
              {workflow.analysisContext && <div className="w-10 h-2 bg-blue-500 rounded-full mb-2" title="Analysis context set" />}
              
              {workflow.uploadedFiles.slice(0, 6).map((file: string, index: number) => {
            const isActive = isImageActive(file);
            return <div key={index} className="group relative">
                    <div onClick={() => handleImageClick(file)} className={`w-10 h-10 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${isActive ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-300 dark:border-slate-600 hover:border-gray-400'}`}>
                      <img src={file} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Delete Button for collapsed state */}
                    <button
                      onClick={(e) => handleDeleteImage(file, e)}
                      className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                      title="Delete image"
                    >
                      <Trash2 className="w-2 h-2" />
                    </button>
                  </div>;
          })}
              {workflow.uploadedFiles.length > 6 && <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">+{workflow.uploadedFiles.length - 6}</span>
                </div>}
            </div>}
        </div>

        {/* Sign Out Section - Always at bottom */}
        <div className={`border-t border-gray-200 ${collapsed ? 'p-2' : 'p-4'}`}>
          {!collapsed ? (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
