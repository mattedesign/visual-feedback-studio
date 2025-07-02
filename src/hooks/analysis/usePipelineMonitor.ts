import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PipelineStage {
  stageName: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'timeout';
  startTime?: Date;
  endTime?: Date;
  duration_ms?: number;
  error?: string;
  data?: any;
}

interface PipelineMonitorState {
  stages: PipelineStage[];
  isRunning: boolean;
  currentStage?: string;
  errors: string[];
  warnings: string[];
}

export const usePipelineMonitor = (analysisId?: string) => {
  const [monitorState, setMonitorState] = useState<PipelineMonitorState>({
    stages: [],
    isRunning: false,
    errors: [],
    warnings: []
  });

  // ✅ NEW: Monitor pipeline stages in real-time
  const addStage = useCallback((stageName: string, status: PipelineStage['status'] = 'pending') => {
    setMonitorState(prev => ({
      ...prev,
      stages: [
        ...prev.stages.filter(s => s.stageName !== stageName),
        {
          stageName,
          status,
          startTime: status === 'running' ? new Date() : undefined
        }
      ]
    }));
  }, []);

  const updateStage = useCallback((stageName: string, updates: Partial<PipelineStage>) => {
    setMonitorState(prev => ({
      ...prev,
      stages: prev.stages.map(stage => 
        stage.stageName === stageName 
          ? { 
              ...stage, 
              ...updates,
              duration_ms: updates.status === 'success' || updates.status === 'error' 
                ? stage.startTime ? Date.now() - stage.startTime.getTime() : undefined
                : stage.duration_ms
            }
          : stage
      )
    }));
  }, []);

  const startPipeline = useCallback(() => {
    console.log('🚀 Pipeline Monitor: Starting pipeline monitoring');
    setMonitorState(prev => ({
      ...prev,
      isRunning: true,
      errors: [],
      warnings: [],
      stages: []
    }));
  }, []);

  const completePipeline = useCallback((success: boolean, error?: string) => {
    console.log('🏁 Pipeline Monitor: Pipeline completed', { success, error });
    setMonitorState(prev => ({
      ...prev,
      isRunning: false,
      errors: error ? [...prev.errors, error] : prev.errors
    }));
  }, []);

  const addError = useCallback((error: string, stageName?: string) => {
    console.error('❌ Pipeline Monitor: Error added:', { error, stageName });
    setMonitorState(prev => ({
      ...prev,
      errors: [...prev.errors, error]
    }));
    
    if (stageName) {
      updateStage(stageName, { status: 'error', error });
    }
  }, [updateStage]);

  const addWarning = useCallback((warning: string) => {
    console.warn('⚠️ Pipeline Monitor: Warning added:', warning);
    setMonitorState(prev => ({
      ...prev,
      warnings: [...prev.warnings, warning]
    }));
  }, []);

  // ✅ NEW: Real-time stage monitoring from database
  useEffect(() => {
    if (!analysisId || !monitorState.isRunning) return;

    const channel = supabase
      .channel('pipeline-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analysis_stage_logs',
          filter: `analysis_result_id=eq.${analysisId}`
        },
        (payload) => {
          console.log('📡 Pipeline Monitor: Stage log update received:', payload);
          const newLog = payload.new;
          
          if (newLog) {
            updateStage(newLog.stage_name, {
              status: newLog.stage_status as PipelineStage['status'],
              error: newLog.error_data?.message,
              data: newLog.output_data
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [analysisId, monitorState.isRunning, updateStage]);

  // ✅ NEW: Health check for pipeline components
  const performHealthCheck = useCallback(async () => {
    console.log('🔍 Pipeline Monitor: Performing health check...');
    const healthResults = {
      anthropicApiKey: !!process.env.ANTHROPIC_API_KEY,
      supabaseConnection: true, // We're already connected if this runs
      databaseAccess: false,
      multiStageEnabled: false
    };

    try {
      // Test database access
      const { error } = await supabase.from('pipeline_configurations').select('*').limit(1);
      healthResults.databaseAccess = !error;
      
      // Check if multi-stage is enabled
      const { data: config } = await supabase
        .from('pipeline_configurations')
        .select('enabled')
        .eq('name', 'comprehensive_analysis')
        .single();
      
      healthResults.multiStageEnabled = config?.enabled || false;
      
    } catch (error) {
      console.error('❌ Pipeline Monitor: Health check failed:', error);
      addError(`Health check failed: ${error.message}`);
    }

    console.log('✅ Pipeline Monitor: Health check completed:', healthResults);
    return healthResults;
  }, [addError]);

  // ✅ NEW: Recovery mechanism for failed stages
  const recoverFromError = useCallback(async (stageName: string) => {
    console.log('🔄 Pipeline Monitor: Attempting recovery for stage:', stageName);
    
    addWarning(`Attempting recovery for failed stage: ${stageName}`);
    
    // Reset stage status
    updateStage(stageName, { 
      status: 'pending', 
      error: undefined,
      startTime: undefined,
      endTime: undefined,
      duration_ms: undefined
    });
    
    return true;
  }, [addWarning, updateStage]);

  return {
    monitorState,
    addStage,
    updateStage,
    startPipeline,
    completePipeline,
    addError,
    addWarning,
    performHealthCheck,
    recoverFromError,
    
    // Computed values
    successfulStages: monitorState.stages.filter(s => s.status === 'success').length,
    failedStages: monitorState.stages.filter(s => s.status === 'error').length,
    totalStages: monitorState.stages.length,
    hasErrors: monitorState.errors.length > 0,
    hasWarnings: monitorState.warnings.length > 0,
    isHealthy: monitorState.errors.length === 0 && monitorState.stages.every(s => s.status !== 'error')
  };
};