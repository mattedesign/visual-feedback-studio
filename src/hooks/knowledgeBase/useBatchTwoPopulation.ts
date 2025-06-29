
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchTwoProgress {
  currentEntry: number;
  totalEntries: number;
  currentTitle: string;
  stage: 'preparing' | 'populating' | 'verifying' | 'completed' | 'error';
}

export interface BatchTwoResults {
  totalEntries: number;
  categoryBreakdown: Array<{ category: string; count: number }>;
  sampleEntries: Array<{
    id: string;
    title: string;
    category: string;
    industry: string | null;
    source: string | null;
    tags: string[] | null;
    content: string;
  }>;
}

export const useBatchTwoPopulation = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState<BatchTwoProgress | null>(null);
  const [results, setResults] = useState<BatchTwoResults | null>(null);

  const populateBatchTwo = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({
      currentEntry: 0,
      totalEntries: 15,
      currentTitle: 'Batch 2 Population',
      stage: 'preparing'
    });
    setResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      
      // Call the new Batch 2 edge function
      const { data, error } = await supabase.functions.invoke('populate-batch-two');
      
      if (error) {
        throw error;
      }

      setProgress(prev => prev ? { ...prev, stage: 'verifying' } : null);
      
      // Get current knowledge base stats
      const { data: totalData } = await supabase
        .from('knowledge_entries')
        .select('id', { count: 'exact' });

      const { data: categoryData } = await supabase
        .from('knowledge_entries')
        .select('category')
        .order('category');

      const { data: sampleData } = await supabase
        .from('knowledge_entries')
        .select('id, title, category, industry, source, tags, content')
        .limit(5);

      const categoryBreakdown = categoryData?.reduce((acc: any[], item) => {
        const existing = acc.find(c => c.category === item.category);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ category: item.category, count: 1 });
        }
        return acc;
      }, []) || [];

      setResults({
        totalEntries: totalData?.length || 0,
        categoryBreakdown,
        sampleEntries: sampleData || []
      });

      setProgress(prev => prev ? { ...prev, stage: 'completed' } : null);
      
      toast.success(`Batch 2 population completed! Added ${data?.added || 0} new entries.`, {
        duration: 5000,
      });

    } catch (error) {
      console.error('Batch 2 population failed:', error);
      setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
      toast.error('Failed to populate Batch 2. Please check the console for details.');
    } finally {
      setIsPopulating(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setProgress(null);
    setResults(null);
  }, []);

  return {
    isPopulating,
    progress,
    results,
    populateBatchTwo,
    clearResults,
    batchSize: 15
  };
};
