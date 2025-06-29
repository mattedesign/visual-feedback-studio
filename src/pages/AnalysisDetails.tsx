
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AnalysisDetails = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Analysis ID: {id}
            </p>
            <p className="text-gray-500 mt-2">
              This page shows detailed results for a specific analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisDetails;
