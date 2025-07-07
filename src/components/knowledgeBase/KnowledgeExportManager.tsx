import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVectorKnowledge } from '@/hooks/knowledgeBase/useVectorKnowledge';
import { KnowledgeEntry } from '@/types/vectorDatabase';
import { toast } from 'sonner';
import { Download, FileJson, BarChart3, Filter, CheckCircle } from 'lucide-react';

interface ExportFilters {
  primary_category?: string;
  complexity_level?: string;
  industry_tags?: string[];
  source?: string;
}

export const KnowledgeExportManager = () => {
  const [exportFilters, setExportFilters] = useState<ExportFilters>({});
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportStats, setLastExportStats] = useState<{
    totalEntries: number;
    timestamp: string;
  } | null>(null);

  const {
    isLoading,
    exportAllKnowledge,
    exportFilteredKnowledge,
    exportKnowledgeStats
  } = useVectorKnowledge();

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const simulateProgress = (duration: number) => {
    setExportProgress(0);
    const steps = 20;
    const interval = duration / steps;
    
    let currentStep = 0;
    const progressInterval = setInterval(() => {
      currentStep++;
      setExportProgress((currentStep / steps) * 100);
      
      if (currentStep >= steps) {
        clearInterval(progressInterval);
        setExportProgress(100);
      }
    }, interval);
    
    return progressInterval;
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    const progressInterval = simulateProgress(2000);
    
    try {
      console.log('🔄 Starting knowledge export...');
      const data = await exportAllKnowledge();
      clearInterval(progressInterval);
      setExportProgress(100);
      
      console.log('✅ Export successful, data:', data);
      
      if (!data || data.length === 0) {
        toast.error('No knowledge entries found to export');
        return;
      }
      
      const timestamp = new Date().toISOString().split('T')[0];
      downloadJSON(data, `knowledge-base-full-${timestamp}.json`);
      
      setLastExportStats({
        totalEntries: data.length,
        timestamp: new Date().toLocaleString()
      });
      
      toast.success(`Successfully exported ${data.length} knowledge entries`);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('❌ Export failed:', error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  const handleExportFiltered = async () => {
    if (Object.keys(exportFilters).length === 0) {
      toast.error('Please select at least one filter');
      return;
    }

    setIsExporting(true);
    const progressInterval = simulateProgress(1500);
    
    try {
      const data = await exportFilteredKnowledge(exportFilters);
      clearInterval(progressInterval);
      setExportProgress(100);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filterString = Object.entries(exportFilters)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}-${Array.isArray(value) ? value.join('-') : value}`)
        .join('_');
      
      downloadJSON(data, `knowledge-base-filtered-${filterString}-${timestamp}.json`);
      
      setLastExportStats({
        totalEntries: data.length,
        timestamp: new Date().toLocaleString()
      });
      
      toast.success(`Successfully exported ${data.length} filtered knowledge entries`);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Filtered export failed:', error);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  const handleExportStats = async () => {
    setIsExporting(true);
    const progressInterval = simulateProgress(1000);
    
    try {
      console.log('🔄 Starting stats export...');
      const stats = await exportKnowledgeStats();
      clearInterval(progressInterval);
      setExportProgress(100);
      
      console.log('✅ Stats export successful:', stats);
      
      const timestamp = new Date().toISOString().split('T')[0];
      downloadJSON(stats, `knowledge-base-stats-${timestamp}.json`);
      
      toast.success('Successfully exported knowledge base statistics');
    } catch (error) {
      clearInterval(progressInterval);
      console.error('❌ Stats export failed:', error);
      toast.error(`Stats export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  const addIndustryTag = (tag: string) => {
    if (tag && (!exportFilters.industry_tags || !exportFilters.industry_tags.includes(tag))) {
      setExportFilters({
        ...exportFilters,
        industry_tags: [...(exportFilters.industry_tags || []), tag]
      });
    }
  };

  const removeIndustryTag = (tagToRemove: string) => {
    setExportFilters({
      ...exportFilters,
      industry_tags: exportFilters.industry_tags?.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Knowledge Export Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Exporting knowledge...</div>
            </div>
            <Progress value={exportProgress} className="w-full" />
          </div>
        )}

        {/* Last Export Stats */}
        {lastExportStats && !isExporting && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Last export: {lastExportStats.totalEntries} entries at {lastExportStats.timestamp}
              </span>
            </div>
          </div>
        )}

        {/* Quick Export Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Quick Export</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={handleExportAll} 
              disabled={isLoading || isExporting}
              className="flex items-center gap-2"
            >
              <FileJson className="w-4 h-4" />
              Export All Knowledge
            </Button>
            
            <Button 
              onClick={handleExportStats} 
              disabled={isLoading || isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Export Statistics
            </Button>
            
            <Button 
              onClick={handleExportFiltered} 
              disabled={isLoading || isExporting || Object.keys(exportFilters).length === 0}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Export Filtered
            </Button>
          </div>
        </div>

        {/* Export Filters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Export Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              value={exportFilters.primary_category || 'all'} 
              onValueChange={(value: string) => setExportFilters({ ...exportFilters, primary_category: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Primary Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="patterns">Patterns</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="optimization">Optimization</SelectItem>
                <SelectItem value="design">Design</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={exportFilters.complexity_level || 'all'} 
              onValueChange={(value: string) => setExportFilters({ ...exportFilters, complexity_level: value === 'all' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add industry tag"
                className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addIndustryTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Button 
                type="button"
                size="sm"
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.querySelector('input');
                  if (input) {
                    addIndustryTag(input.value);
                    input.value = '';
                  }
                }}
              >
                Add Tag
              </Button>
            </div>
            
            {exportFilters.industry_tags && exportFilters.industry_tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exportFilters.industry_tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer" 
                    onClick={() => removeIndustryTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {Object.keys(exportFilters).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportFilters({})}
            >
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Export Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium mb-2">Export Information</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Full Export:</strong> Downloads all knowledge entries in JSON format</li>
            <li>• <strong>Filtered Export:</strong> Downloads entries matching your selected filters</li>
            <li>• <strong>Statistics Export:</strong> Downloads summary statistics and metadata</li>
            <li>• Files are saved with timestamps and contain complete entry data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};