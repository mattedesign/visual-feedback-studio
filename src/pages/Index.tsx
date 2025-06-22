
import { useState } from 'react';
import { Search, Zap, User, Plus, Play, Maximize2, HelpCircle, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Index = () => {
  const [activeTab, setActiveTab] = useState('Analysis');

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
              <div className="aspect-square bg-gray-100 rounded-lg p-2">
                <div className="w-full h-full bg-white rounded border flex flex-col">
                  <div className="h-2 bg-gray-200 rounded-t"></div>
                  <div className="flex-1 p-1 space-y-1">
                    <div className="h-1 bg-gray-200 rounded"></div>
                    <div className="h-1 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex gap-1 mt-2">
                      <div className="w-6 h-4 bg-green-400 rounded-sm"></div>
                      <div className="w-6 h-4 bg-blue-400 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg p-2">
                <div className="w-full h-full bg-white rounded border flex flex-col">
                  <div className="h-2 bg-gray-200 rounded-t"></div>
                  <div className="flex-1 p-1 space-y-1">
                    <div className="h-1 bg-gray-200 rounded"></div>
                    <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg p-2">
                <div className="w-full h-full bg-green-500 rounded"></div>
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg p-2">
                <div className="w-full h-full bg-white rounded border"></div>
              </div>
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
          <div className="grid grid-cols-12 gap-6">
            {/* Profile Card */}
            <Card className="col-span-3 bg-gray-800 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png" />
                    <AvatarFallback>PL</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Paityn Levin</h3>
                    <p className="text-sm text-orange-400">UX UI DESIGNER</p>
                  </div>
                  <Settings className="w-4 h-4 ml-auto" />
                </div>
              </CardContent>
            </Card>

            {/* Meeting Card */}
            <Card className="col-span-5">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-orange-400 to-pink-500 rounded-t-lg relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png" 
                    alt="Meeting" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Avatar className="w-8 h-8 border-2 border-white">
                      <AvatarFallback>G</AvatarFallback>
                    </Avatar>
                    <Avatar className="w-8 h-8 border-2 border-white">
                      <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <Play className="absolute top-4 right-4 w-8 h-8 text-white" />
                  <Maximize2 className="absolute top-4 left-4 w-6 h-6 text-white" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Meeting with Gilbert</h3>
                    <span className="text-sm text-gray-500">09:00 am - 09:30 am</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Design system updates & development</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">Copy the link</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling Card */}
            <Card className="col-span-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Scheduling</h3>
                  <span className="text-2xl font-bold">Mar 28</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">You have one scheduled event today - Don't miss them!</p>
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src="/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png" 
                    alt="Event" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Expo world press photo Montreal</p>
                  <p className="text-sm text-gray-600">📍 Just live as is Comment it 👥 9:30am</p>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Mark this event
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* To do list */}
            <Card className="col-span-3">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">To do list</h3>
                  <Plus className="w-4 h-4" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-sm mt-0.5"></div>
                    <div>
                      <p className="text-sm">Update button styles to match guidelines</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">Mar 24th</span>
                        <Badge variant="secondary" className="text-xs">Blocking</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-sm mt-0.5"></div>
                    <div>
                      <p className="text-sm">Sync with UX team to refine user flows</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">Mar 25th</span>
                        <Badge variant="secondary" className="text-xs">Essential</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Design low-fidelity wireframes for the new landing page, ensuring a user friendly layout and clear content hierarchy.
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">KS</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600">Kaitynn Siphron (Assigned)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Overview */}
            <Card className="col-span-5 bg-green-700 text-white">
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-2">Project overview</h3>
                <p className="text-green-100 mb-6">Design low-fidelity wireframes for the new landing page, ensuring a user-friendly layout and clear content hierarchy.</p>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-green-200 text-sm">IMPORTED</p>
                    <div className="mt-2">
                      <div className="w-8 h-2 bg-green-400 rounded"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-green-200 text-sm">IN PLANNING</p>
                  </div>
                  <div>
                    <p className="text-green-200 text-sm">IN DEVELOPMENT</p>
                  </div>
                  <div>
                    <p className="text-green-200 text-sm">TESTING</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Feb 21st</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm">Feb 26th</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm">SCALE</p>
                    <p className="text-xl font-bold">5/10</p>
                    <p className="text-green-200 text-sm">Apr 28th</p>
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>SB</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            {/* File & Media Library */}
            <Card className="col-span-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">File & media library</h3>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="ghost" size="sm">&lt;</Button>
                  <span className="text-sm text-gray-600">392 files</span>
                  <Button variant="ghost" size="sm">&gt;</Button>
                </div>

                <div className="aspect-video bg-gradient-to-br from-orange-200 to-blue-200 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src="/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png" 
                    alt="Visual Vault" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Visual Vault</h4>
                  <p className="text-sm text-gray-600 mb-3">A curated collection of all creative essentials - images, photos, icons, and design elements. Everything needed from here.</p>
                  <Button className="w-full bg-green-700 hover:bg-green-800">Open the folder</Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="col-span-3">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Notifications</h3>
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>CH</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">Charlie Herrara</span>
                      <Settings className="w-3 h-3" />
                    </div>
                    <p className="text-xs text-orange-500">PRODUCT DIRECTOR</p>
                    <p className="text-sm text-gray-600 mt-2">Would you like them formatted for a specific use case, like a project management tool?</p>
                    <p className="text-xs text-gray-500 mt-2">5 mins • Read</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Manage your dashboard
                </Button>
              </CardContent>
            </Card>
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
