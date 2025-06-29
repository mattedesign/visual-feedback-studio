
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InitialProgress {
  currentEntry: number;
  totalEntries: number;
  currentTitle: string;
  stage: 'preparing' | 'populating' | 'verifying' | 'completed' | 'error';
}

export interface InitialResults {
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

export const useInitialKnowledgePopulation = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState<InitialProgress | null>(null);
  const [results, setResults] = useState<InitialResults | null>(null);

  const populateKnowledgeBase = useCallback(async () => {
    if (isPopulating) return;

    setIsPopulating(true);
    setProgress({
      currentEntry: 0,
      totalEntries: 12, // Approximate number of entries
      currentTitle: '',
      stage: 'preparing'
    });
    setResults(null);

    try {
      setProgress(prev => prev ? { ...prev, stage: 'populating' } : null);
      
      // Call the Supabase edge function to populate knowledge
      const { data, error } = await supabase.functions.invoke('populate-knowledge-simple');
      
      if (error) {
        throw error;
      }

      // Run verification
      setProgress(prev => prev ? { ...prev, stage: 'verifying' } : null);
      
      // Get verification data
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

      // Process category breakdown
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
      
      toast.success(`Successfully populated knowledge base with ${data?.added || 0} entries!`, {
        duration: 5000,
      });

    } catch (error) {
      console.error('Knowledge base population failed:', error);
      setProgress(prev => prev ? { ...prev, stage: 'error' } : null);
      toast.error('Failed to populate knowledge base. Please check the console for details.');
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
    populateKnowledgeBase,
    clearResults,
    batchSize: 12
  };
};
