
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UpgradeDetails {
  upgradeName: string;
  upgradeType: string;
  additionalVisuals?: any[];
  sessionId: string;
}

const UpgradeSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const upgrade = searchParams.get('upgrade');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [upgradeDetails, setUpgradeDetails] = useState<UpgradeDetails | null>(null);

  useEffect(() => {
    if (sessionId && upgrade) {
      processUpgradeCompletion(sessionId, upgrade);
    } else {
      setStatus('error');
    }
  }, [sessionId, upgrade]);

  const processUpgradeCompletion = async (sessionId: string, upgradeType: string) => {
    try {
      console.log('Processing upgrade completion:', { sessionId, upgradeType });
      
      // Verify the Stripe session using your existing Supabase edge function
      const { data, error } = await supabase.functions.invoke('verify-upgrade-session', {
        body: { 
          sessionId, 
          upgradeType 
        }
      });

      if (error) {
        console.error('Verification error:', error);
        throw new Error('Failed to verify purchase');
      }

      console.log('Upgrade verification successful:', data);
      
      // Set the upgrade details from the response
      setUpgradeDetails({
        upgradeName: data.upgradeName || upgradeType.replace(/_/g, ' '),
        upgradeType: upgradeType,
        additionalVisuals: data.additionalVisuals || [],
        sessionId: sessionId
      });
      
      setStatus('success');

    } catch (error) {
      console.error('Upgrade processing failed:', error);
      setStatus('error');
    }
  };

  const getUpgradeDisplayName = (upgradeType: string) => {
    switch (upgradeType) {
      case 'style_variety_pack':
        return 'Style Variety Pack';
      case 'responsive_design_pack':
        return 'Responsive Design Pack';
      case 'ab_test_variants':
        return 'A/B Test Variants';
      case 'accessibility_focus':
        return 'Accessibility Enhancement Pack';
      default:
        return upgradeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Processing Your Upgrade</h2>
            <p className="text-slate-300">Verifying your purchase and generating additional visual suggestions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Something Went Wrong</h2>
            <p className="text-slate-300 mb-4">
              We couldn't process your upgrade. If you were charged, please contact support with session ID: {sessionId}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/analysis')} 
                variant="outline"
                className="w-full"
              >
                Return to Analysis
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                variant="ghost"
                className="w-full text-slate-400"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
            Upgrade Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-slate-300 mb-4">
              Your <strong>{getUpgradeDisplayName(upgradeDetails?.upgradeType || upgrade || '')}</strong> is now ready!
            </p>
            
            {upgradeDetails?.additionalVisuals && upgradeDetails.additionalVisuals.length > 0 && (
              <div className="bg-slate-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-300 mb-2">
                  ✨ <strong>{upgradeDetails.additionalVisuals.length}</strong> additional visual{upgradeDetails.additionalVisuals.length > 1 ? 's' : ''} generated
                </p>
                <p className="text-xs text-slate-400">
                  You can now see multiple design approaches and make better decisions
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/analysis')} 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                View Your New Visuals
              </Button>
              <Button 
                onClick={() => navigate('/analysis')} 
                variant="outline"
                className="w-full"
              >
                Start New Analysis
              </Button>
            </div>
            
            {sessionId && (
              <div className="mt-6 pt-4 border-t border-slate-600">
                <p className="text-xs text-slate-500">
                  Session ID: {sessionId.slice(0, 20)}...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradeSuccess;
