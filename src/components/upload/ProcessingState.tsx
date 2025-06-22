
import { Card, CardContent } from '@/components/ui/card';

export const ProcessingState = () => {
  return (
    <Card className="max-w-2xl mx-auto bg-slate-800/50 border-slate-700">
      <CardContent className="p-12 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
        <h3 className="text-xl font-semibold mb-2">Processing Your Upload</h3>
        <p className="text-slate-400">
          Uploading and preparing your design for analysis...
        </p>
        <div className="mt-6 bg-slate-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </CardContent>
    </Card>
  );
};
