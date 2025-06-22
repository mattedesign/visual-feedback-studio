
import { Sparkles, Upload, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">DesignAI</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              History
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Settings
            </a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <History className="w-4 h-4 mr-2" />
              Recent
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Upload className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
