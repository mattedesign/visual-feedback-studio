import { useState } from 'react';
import { Search, Zap, User, Plus, Play, Maximize2, HelpCircle, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Index = () => {
  const [activeTab, setActiveTab] = useState('Analysis');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const files = [
    { id: 'file1', name: 'Design System', type: 'document', preview: '/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png' },
    { id: 'file2', name: 'Wireframes', type: 'document', preview: '/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png' },
    { id: 'file3', name: 'Brand Colors', type: 'color', preview: null },
    { id: 'file4', name: 'Empty File', type: 'empty', preview: null }
  ];

  const handleFileSelect = (fileId: string) => {
    setSelectedFile(fileId);
  };

  const renderFilePreview = () => {
    if (!selectedFile) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
            <p className="text-gray-500">Select a file from the sidebar to view it here</p>
          </div>
        </div>
      );
    }

    const file = files.find(f => f.id === selectedFile);
    if (!file) return null;

    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold">{file.name}</h2>
          <p className="text-gray-600 text-sm capitalize">{file.type} file</p>
        </div>
        <div className="flex-1 p-6 flex items-center justify-center">
          {file.preview ? (
            <div className="max-w-4xl w-full">
              <img 
                src={file.preview} 
                alt={file.name}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          ) : file.type === 'color' ? (
            <div className="grid grid-cols-4 gap-4">
              <div className="w-24 h-24 bg-green-500 rounded-lg"></div>
              <div className="w-24 h-24 bg-blue-500 rounded-lg"></div>
              <div className="w-24 h-24 bg-orange-500 rounded-lg"></div>
              <div className="w-24 h-24 bg-purple-500 rounded-lg"></div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
              <p className="text-gray-500">Empty file</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-semibold text-gray-900">figmant</span>
            </div>
            
            <nav className="flex items-center gap-6">
              <button className="text-gray-600 hover:text-gray-900">Dashboard</button>
              <button className="text-gray-600 hover:text-gray-900">History</button>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg">
                <button className="text-gray-900 font-medium">Analysis</button>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-500" />
            <Zap className="w-5 h-5 text-gray-500" />
            <Avatar className="w-8 h-8">
              <AvatarImage src="/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Files</h3>
              <Plus className="w-4 h-4 text-gray-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {files.map((file) => (
                <div 
                  key={file.id}
                  className={`aspect-square bg-gray-100 rounded-lg p-2 cursor-pointer hover:bg-gray-200 transition-colors ${
                    selectedFile === file.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleFileSelect(file.id)}
                >
                  <div className="w-full h-full bg-white rounded border flex flex-col">
                    {file.type === 'document' ? (
                      <>
                        <div className="h-2 bg-gray-200 rounded-t"></div>
                        <div className="flex-1 p-1 space-y-1">
                          <div className="h-1 bg-gray-200 rounded"></div>
                          <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                          <div className="flex gap-1 mt-2">
                            <div className="w-6 h-4 bg-green-400 rounded-sm"></div>
                            <div className="w-6 h-4 bg-blue-400 rounded-sm"></div>
                          </div>
                        </div>
                      </>
                    ) : file.type === 'color' ? (
                      <div className="w-full h-full bg-green-500 rounded"></div>
                    ) : (
                      <div className="w-full h-full bg-white rounded border"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            <p className="text-sm text-gray-600">Drag and drop files here or click to browse</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="h-full bg-white rounded-lg border border-gray-200">
            {renderFilePreview()}
          </div>
        </main>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-4 bg-white rounded-full shadow-lg px-6 py-3 border">
          <Play className="w-5 h-5 text-gray-600" />
          <Maximize2 className="w-5 h-5 text-gray-600" />
          <HelpCircle className="w-5 h-5 text-gray-600" />
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
            <span className="text-sm">UX Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">1 Credit</span>
            <ChevronDown className="w-4 h-4" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full">
            <span className="mr-2">🤖</span>
            Analyze →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
