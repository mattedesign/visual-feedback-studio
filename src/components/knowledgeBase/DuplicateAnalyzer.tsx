
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  tags: string[];
  created_at: string;
}

interface DuplicateGroup {
  title: string;
  entries: KnowledgeEntry[];
  duplicateType: 'exact_title' | 'similar_content';
}

export const DuplicateAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [totalDuplicates, setTotalDuplicates] = useState(0);

  const analyzeDuplicates = async () => {
    setIsAnalyzing(true);
    try {
      console.log('🔍 Starting duplicate analysis...');
      
      // Fetch all knowledge entries
      const { data: entries, error } = await supabase
        .from('knowledge_entries')
        .select('id, title, content, category, source, tags, created_at')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching knowledge entries:', error);
        toast.error('Failed to fetch knowledge entries');
        return;
      }

      if (!entries || entries.length === 0) {
        toast.info('No knowledge entries found');
        return;
      }

      console.log(`📊 Analyzing ${entries.length} knowledge entries for duplicates...`);
      setTotalEntries(entries.length);

      // Group by exact title matches
      const titleGroups: { [key: string]: KnowledgeEntry[] } = {};
      
      entries.forEach((entry) => {
        const normalizedTitle = entry.title.trim().toLowerCase();
        if (!titleGroups[normalizedTitle]) {
          titleGroups[normalizedTitle] = [];
        }
        titleGroups[normalizedTitle].push(entry);
      });

      // Find duplicate groups (groups with more than 1 entry)
      const duplicates: DuplicateGroup[] = [];
      let duplicateCount = 0;

      Object.entries(titleGroups).forEach(([title, groupEntries]) => {
        if (groupEntries.length > 1) {
          duplicates.push({
            title: groupEntries[0].title, // Use original case
            entries: groupEntries,
            duplicateType: 'exact_title'
          });
          duplicateCount += groupEntries.length - 1; // Count extras as duplicates
        }
      });

      // Additional analysis for similar content (simplified version)
      const contentSimilarityGroups: { [key: string]: KnowledgeEntry[] } = {};
      entries.forEach((entry) => {
        // Create a simple content fingerprint (first 100 chars, normalized)
        const contentFingerprint = entry.content
          .substring(0, 100)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' ');
        
        if (contentFingerprint.length > 50) { // Only check substantial content
          if (!contentSimilarityGroups[contentFingerprint]) {
            contentSimilarityGroups[contentFingerprint] = [];
          }
          contentSimilarityGroups[contentFingerprint].push(entry);
        }
      });

      // Find content-based duplicates that aren't already caught by title
      Object.entries(contentSimilarityGroups).forEach(([fingerprint, groupEntries]) => {
        if (groupEntries.length > 1) {
          // Check if this group is already covered by title duplicates
          const titleSet = new Set(groupEntries.map(e => e.title.trim().toLowerCase()));
          if (titleSet.size === groupEntries.length) {
            // These are different titles but similar content
            duplicates.push({
              title: `Similar content: ${groupEntries[0].title}`,
              entries: groupEntries,
              duplicateType: 'similar_content'
            });
            duplicateCount += groupEntries.length - 1;
          }
        }
      });

      setDuplicateGroups(duplicates);
      setTotalDuplicates(duplicateCount);

      console.log(`✅ Duplicate analysis complete:`, {
        totalEntries: entries.length,
        duplicateGroups: duplicates.length,
        totalDuplicates: duplicateCount
      });

      if (duplicates.length === 0) {
        toast.success('No duplicates found in the knowledge base!');
      } else {
        toast.info(`Found ${duplicates.length} duplicate groups containing ${duplicateCount} duplicate entries`);
      }

    } catch (error) {
      console.error('Error analyzing duplicates:', error);
      toast.error('Failed to analyze duplicates');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeDuplicate = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error('Error removing duplicate:', error);
        toast.error('Failed to remove duplicate entry');
        return;
      }

      toast.success('Duplicate entry removed');
      // Refresh the analysis
      await analyzeDuplicates();
    } catch (error) {
      console.error('Error removing duplicate:', error);
      toast.error('Failed to remove duplicate entry');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base Duplicate Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {totalEntries > 0 && (
                <span>Total entries: {totalEntries}</span>
              )}
            </div>
            <Button onClick={analyzeDuplicates} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Duplicates'}
            </Button>
          </div>

          {totalDuplicates > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="font-medium text-yellow-800">
                Found {duplicateGroups.length} duplicate groups containing {totalDuplicates} duplicate entries
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                This means {totalDuplicates} entries could potentially be removed to clean up the knowledge base.
              </div>
            </div>
          )}

          {duplicateGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Duplicate Groups</h3>
              {duplicateGroups.map((group, groupIndex) => (
                <Card key={groupIndex} className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{group.title}</CardTitle>
                      <Badge variant={group.duplicateType === 'exact_title' ? 'destructive' : 'secondary'}>
                        {group.duplicateType === 'exact_title' ? 'Exact Title' : 'Similar Content'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.entries.map((entry, entryIndex) => (
                        <div key={entry.id} className="flex items-start justify-between p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{entry.title}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Category: {entry.category} | 
                              Source: {entry.source || 'N/A'} | 
                              Created: {new Date(entry.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Content: {entry.content.substring(0, 100)}...
                            </div>
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {entry.tags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {entryIndex > 0 && ( // Don't allow removing the first (oldest) entry
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeDuplicate(entry.id)}
                              className="ml-2"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isAnalyzing && duplicateGroups.length === 0 && totalEntries > 0 && (
            <div className="text-center py-8">
              <div className="text-green-600 font-medium">✅ No duplicates found!</div>
              <div className="text-sm text-gray-600 mt-1">
                Your knowledge base appears to be clean with no duplicate entries.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
