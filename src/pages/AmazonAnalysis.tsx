
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AmazonHeader } from '@/components/ui/AmazonHeader';
import { AmazonCard, AmazonCardHeader, AmazonCardTitle, AmazonCardContent } from '@/components/ui/AmazonCard';
import { AmazonUploadCard } from '@/components/upload/AmazonUploadCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Clock, FileText, TrendingUp, Award } from 'lucide-react';

const AmazonAnalysis: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('🔄 Amazon Analysis Page Render:', {
    hasUser: !!user,
    loading,
    timestamp: new Date().toISOString()
  });

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    // TODO: Implement file upload logic
  };

  const handleUrlUpload = (url: string) => {
    console.log('URL uploaded:', url);
    // TODO: Implement URL upload logic
  };

  const handleDemoUpload = () => {
    console.log('Demo upload requested');
    // TODO: Implement demo upload logic
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AmazonHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthGuard />;
  }

  const analysisHistory = [
    {
      id: 1,
      title: "E-commerce Homepage",
      date: "2 hours ago",
      score: 92,
      status: "completed"
    },
    {
      id: 2,
      title: "Mobile App Landing",
      date: "1 day ago",
      score: 87,
      status: "completed"
    },
    {
      id: 3,
      title: "Dashboard Redesign",
      date: "3 days ago",
      score: 94,
      status: "completed"
    }
  ];

  const quickStats = [
    {
      icon: <FileText className="w-6 h-6" />,
      label: "Analyses This Month",
      value: "12",
      color: "text-blue-600"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Average Score",
      value: "91%",
      color: "text-green-600"
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: "Improvements Made",
      value: "47",
      color: "text-orange-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: "Time Saved",
      value: "23h",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AmazonHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <AmazonCard className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Design Analysis Workflow
              </h1>
              <p className="text-gray-600 text-lg">
                Upload your design and get professional UX insights powered by AI
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="amazon-badge amazon-badge-success">
                Welcome back, {user.email?.split('@')[0]}!
              </div>
            </div>
          </div>
        </AmazonCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <AmazonCard key={index} className="text-center p-4">
              <div className={`${stat.color} mb-2 flex justify-center`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </AmazonCard>
          ))}
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <AmazonUploadCard
              onFileUpload={handleFileUpload}
              onUrlUpload={handleUrlUpload}
              onDemoUpload={handleDemoUpload}
            />
          </div>
          
          {/* Analysis History Sidebar */}
          <div className="lg:col-span-1">
            <AmazonCard>
              <AmazonCardHeader>
                <AmazonCardTitle>Recent Analyses</AmazonCardTitle>
              </AmazonCardHeader>
              <AmazonCardContent>
                <div className="space-y-4">
                  {analysisHistory.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                      onClick={() => {
                        // TODO: Navigate to analysis results
                        console.log('Navigate to analysis:', analysis.id);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm text-slate-900">
                          {analysis.title}
                        </h4>
                        <div className={`amazon-badge ${
                          analysis.score >= 90 ? 'amazon-badge-success' : 
                          analysis.score >= 80 ? 'amazon-badge-warning' : 
                          'amazon-badge-error'
                        }`}>
                          {analysis.score}%
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{analysis.date}</p>
                    </div>
                  ))}
                  
                  {analysisHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No analyses yet</p>
                      <p className="text-sm">Start by uploading your first design</p>
                    </div>
                  )}
                </div>
                
                <hr className="amazon-divider" />
                
                <button
                  onClick={() => {
                    // TODO: Show all analyses
                    console.log('Show all analyses');
                  }}
                  className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm py-2"
                >
                  View All Analyses →
                </button>
              </AmazonCardContent>
            </AmazonCard>

            {/* Tips Card */}
            <AmazonCard className="mt-6">
              <AmazonCardHeader>
                <AmazonCardTitle className="text-lg">💡 Pro Tips</AmazonCardTitle>
              </AmazonCardHeader>
              <AmazonCardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Upload high-resolution images for better analysis accuracy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Include full page context, not just individual components</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>Test both desktop and mobile versions for comprehensive insights</span>
                  </div>
                </div>
              </AmazonCardContent>
            </AmazonCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AmazonAnalysis;
