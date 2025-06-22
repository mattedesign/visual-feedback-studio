
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Upload, Eye, BarChart3 } from 'lucide-react';

const Index = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/analysis');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-white text-2xl">DesignAI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-Powered Design Feedback
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload your designs and receive intelligent feedback on UX, accessibility, 
            and conversion optimization. Get actionable insights to improve your designs instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
            >
              {user ? 'Go to Analysis' : 'Get Started Free'}
            </Button>
            
            {!user && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/auth')}
                className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <Upload className="w-10 h-10 text-blue-400 mb-4" />
              <CardTitle className="text-white">Easy Upload</CardTitle>
              <CardDescription className="text-slate-400">
                Drag & drop your designs or paste Figma links for instant analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <Eye className="w-10 h-10 text-purple-400 mb-4" />
              <CardTitle className="text-white">Smart Analysis</CardTitle>
              <CardDescription className="text-slate-400">
                AI examines your designs for UX issues, accessibility problems, and optimization opportunities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-pink-400 mb-4" />
              <CardTitle className="text-white">Actionable Insights</CardTitle>
              <CardDescription className="text-slate-400">
                Get specific recommendations with effort estimates and business impact ratings
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to improve your designs?
              </h2>
              <p className="text-slate-300 mb-6">
                Join thousands of designers getting AI-powered feedback on their work.
              </p>
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3"
              >
                Start Analyzing Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
