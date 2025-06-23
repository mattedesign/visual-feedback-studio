
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface TestResultsProps {
  testResult: 'success' | 'error' | 'warning' | null;
  testMessage: string;
}

export const TestResults = ({ testResult, testMessage }: TestResultsProps) => {
  if (!testResult || !testMessage) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        {testResult === 'success' ? (
          <>
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-medium">System Working!</span>
          </>
        ) : testResult === 'warning' ? (
          <>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-600 font-medium">Partial Success</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-600 font-medium">System Issue</span>
          </>
        )}
      </div>

      <div className={`p-4 rounded-lg text-sm whitespace-pre-line ${
        testResult === 'success' 
          ? 'bg-green-900/20 text-green-300 border border-green-700/50'
          : testResult === 'warning'
          ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-700/50'
          : 'bg-red-900/20 text-red-300 border border-red-700/50'
      }`}>
        {testMessage}
      </div>
    </>
  );
};
