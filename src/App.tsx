import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import GoblinDashboard from "./pages/GoblinDashboard";
import EnhancedDashboardPage from "./pages/EnhancedDashboardPage";
import AnalysisStudioPage from "./pages/AnalysisStudioPage";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import Archive from "./pages/Archive";
import Analysis from "./pages/Analysis";
import AnalysisResults from "./pages/AnalysisResults";
import Analyze from "./pages/Analyze";
import AnalyzeResults from "./pages/AnalyzeResults";
import Auth from "./pages/Auth";
import UpgradeSuccess from "./pages/UpgradeSuccess";
import VectorTest from "./pages/VectorTest";
import HybridEngineTest from "./pages/HybridEngineTest";
import GoblinHistory from "./pages/GoblinHistory";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import { AdminPanel } from "./pages/AdminPanel";
import Subscription from "./pages/Subscription";
import Mentor from "./pages/Mentor";
import GoblinStudio from "./pages/goblin/GoblinStudio";
import GoblinStudioPage from "./pages/goblin/GoblinStudioPage";
import GoblinResults from "./pages/goblin/GoblinResults";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DatabaseSeeder } from "@/components/admin/DatabaseSeeder";
import { PublicAchievement } from "@/pages/public/Achievement";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { FigmantLayout } from "@/components/layout/FigmantLayout";

const queryClient = new QueryClient();

const App = () => {
  const { user, signOut } = useAuth();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - no layout */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/achievement/:shareToken" element={<PublicAchievement />} />
            
            {/* Protected routes with exact SVG container styling */}
            <Route path="/*" element={
              <AuthGuard>
                <SubscriptionProvider>
                  <div 
                    className="min-h-screen"
                    style={{ 
                      background: '#1C6D73',
                      padding: '2px'
                    }}
                  >
                    <div 
                      style={{
                        width: '1436px',
                        height: '896px',
                        maxWidth: '100vw',
                        maxHeight: '100vh',
                        borderRadius: '30px',
                        background: '#1C6D73',
                        border: '4px solid #1C6D73',
                        margin: '0 auto'
                      }}
                    >
                      <div 
                        style={{
                          width: '1408px',
                          height: '868px',
                          borderRadius: '20px',
                          background: '#F1F1F1',
                          margin: '16px'
                        }}
                      >
                        <FigmantLayout>
                          <Routes>
                            <Route path="/" element={<EnhancedDashboardPage />} />
                            <Route path="/dashboard" element={<EnhancedDashboardPage />} />
                            <Route path="/analysis-studio" element={<AnalysisStudioPage />} />
                            <Route path="archive" element={<Archive />} />
                            <Route path="analysis" element={<Analysis />} />
                            <Route path="analysis/:id" element={<AnalysisResults />} />
                            <Route path="analysis-results" element={<AnalysisResults />} />
                            <Route path="analysis-results/:id" element={<AnalysisResults />} />
                            <Route path="analyze" element={<Analyze />} />
                            <Route path="analyze-results/:id" element={<AnalyzeResults />} />
                            <Route path="goblin" element={<GoblinStudioPage />} />
                            <Route path="goblin/results/:sessionId" element={<GoblinResults />} />
                            <Route path="history" element={<GoblinHistory />} />
                            <Route path="mentor" element={<Mentor />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="subscription" element={<Subscription />} />
                            <Route path="help" element={<Help />} />
                            <Route path="admin" element={<AdminPanel />} />
                            <Route path="upgrade-success" element={<UpgradeSuccess />} />
                            <Route path="vector-test" element={<VectorTest />} />
                            <Route path="hybrid-engine-test" element={<HybridEngineTest />} />
                            <Route path="database-seeder" element={<DatabaseSeeder />} />
                            <Route path="reports" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Reports Coming Soon</h1><p className="text-muted-foreground">Advanced reporting features will be available soon.</p></div>} />
                            <Route path="insights" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Design Insights Coming Soon</h1><p className="text-muted-foreground">AI-powered design insights will be available soon.</p></div>} />
                            <Route path="trends" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Trends Coming Soon</h1><p className="text-muted-foreground">UX trend analysis will be available soon.</p></div>} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </FigmantLayout>
                      </div>
                    </div>
                  </div>
                </SubscriptionProvider>
              </AuthGuard>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;