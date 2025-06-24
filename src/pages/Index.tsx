
import { useAuth } from '@/hooks/useAuth';
import { AnalysisLayout } from '@/components/analysis/AnalysisLayout';
import { AnalysisWorkflow } from '@/components/analysis/AnalysisWorkflow';
import { WelcomeSection } from '@/components/analysis/WelcomeSection';
import { PreviousAnalyses } from '@/components/analysis/PreviousAnalyses';
import { DirectRAGTest } from '@/components/analysis/DirectRAGTest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const { user } = useAuth();

  return (
    <AnalysisLayout>
      <div className="space-y-8">
        <WelcomeSection />
        
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">UX Analysis</TabsTrigger>
            <TabsTrigger value="previous">Previous Analyses</TabsTrigger>
            <TabsTrigger value="rag-test">🧪 RAG Test</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="space-y-6">
            <AnalysisWorkflow />
          </TabsContent>
          
          <TabsContent value="previous" className="space-y-6">
            <PreviousAnalyses />
          </TabsContent>
          
          <TabsContent value="rag-test" className="space-y-6">
            <DirectRAGTest />
          </TabsContent>
        </Tabs>
      </div>
    </AnalysisLayout>
  );
};

export default Index;
