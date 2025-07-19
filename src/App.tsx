
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { FigmantLayout } from "@/components/layout/FigmantLayout";
import { FigmantDashboard } from "@/pages/FigmantDashboard";
import FigmantAnalysisPage from "@/pages/FigmantAnalysisPage";
import FigmantResultsPage from "@/pages/FigmantResultsPage";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import { PublicAchievement } from "@/pages/public/Achievement";

const queryClient = new QueryClient();

const App = () => {
  const { user } = useAuth();
  
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
            
            {/* Protected routes with Figmant container styling */}
            <Route path="/*" element={
              <AuthGuard>
                <SubscriptionProvider>
                  <div className="min-h-screen w-full overflow-hidden bg-[#1C6D73] p-1">
                    <div className="h-[calc(100vh-8px)] w-full max-w-full rounded-[30px] bg-[#1C6D73] border-4 border-[#1C6D73] overflow-hidden">
                      <div className="h-full w-full rounded-[20px] bg-[#F1F1F1] m-4 overflow-hidden" style={{ height: 'calc(100% - 32px)', width: 'calc(100% - 32px)' }}>
                        <FigmantLayout>
                          <Routes>
                            {/* Core Figmant Routes */}
                            <Route path="/" element={<FigmantDashboard />} />
                            <Route path="/dashboard" element={<FigmantDashboard />} />
                            <Route path="/analyze" element={<FigmantAnalysisPage />} />
                            <Route path="/analysis/:sessionId" element={<FigmantResultsPage />} />
                            <Route path="/analysis-results/:sessionId" element={<FigmantResultsPage />} />
                            
                            {/* Settings & Account */}
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/subscription" element={<Subscription />} />
                            
                            {/* Redirect old routes to new ones */}
                            <Route path="/create-new" element={<Navigate to="/analyze" replace />} />
                            <Route path="/analysis-studio" element={<Navigate to="/analyze" replace />} />
                            <Route path="/mentor" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/history" element={<Navigate to="/dashboard" replace />} />
                            
                            {/* Catch all */}
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
