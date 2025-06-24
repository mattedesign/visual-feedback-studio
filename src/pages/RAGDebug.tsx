
import { RAGDebugTest } from '@/components/admin/RAGDebugTest';

const RAGDebug = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RAG Debug Test</h1>
          <p className="text-gray-600">
            Test and debug the build-rag-context function to verify knowledge retrieval and prompt enhancement.
          </p>
        </div>
        <RAGDebugTest />
      </div>
    </div>
  );
};

export default RAGDebug;
