
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BatchFiveProgress {
  currentEntry: number;
  totalEntries: number;
  currentTitle: string;
  stage: 'preparing' | 'populating' | 'verifying' | 'completed' | 'error';
}

export interface BatchFiveResults {
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

export const useBatchFivePopulation = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState<BatchFiveProgress | null>(null);
  const [results, setResults] = useState<BatchFiveResults | null>(null);

  const populateBatchFive = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({ currentEntry: 0, totalEntries: 30, currentTitle: 'Batch 5 Population', stage: 'preparing' });
    setResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setProgress(prev => prev ? { ...prev, stage: 'verifying' } : null);
      
      const { data: totalData } = await supabase.from('knowledge_entries').select('id', { count: 'exact' });
      const { data: categoryData } = await supabase.from('knowledge_entries').select('category').order('category');
      const { data: sampleData } = await supabase.from('knowledge_entries').select('id, title, category, industry, source, tags, content').limit(5);

      const categoryBreakdown = categoryData?.reduce((acc: any[], item) => {
        const existing = acc.find(c => c.category === item.category);
        if (existing) existing.count++;
        else acc.push({ category: item.category, count: 1 });
        return acc;
      }, []) || [];

      setResults({ totalEntries: totalData?.length || 0, categoryBreakdown, sampleEntries: sampleData || [] });
      setProgress(prev => prev ? { ...prev, stage: 'completed' } : null);
      toast.success('Batch 5 population completed! (Simulated)');
    } catch (error) {
      console.error('Batch 5 population failed:', error);
      setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
      toast.error('Failed to populate Batch 5.');
    } finally {
      setIsPopulating(false);
    }
  }, []);

  const clearResults = useCallback(() => { setProgress(null); setResults(null); }, []);
  return { isPopulating, progress, results, populateBatchFive, clearResults, batchSize: 30 };
};
