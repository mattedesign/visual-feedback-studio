import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClearPrototypesButtonProps {
  analysisId: string;
  onPrototypesCleared?: () => void;
}

export function ClearPrototypesButton({ analysisId, onPrototypesCleared }: ClearPrototypesButtonProps) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearPrototypes = async () => {
    try {
      setIsClearing(true);
      
      // Call the database function to clear prototypes
      const { data, error } = await supabase.rpc('clear_prototypes_for_analysis', {
        p_analysis_id: analysisId
      });

      if (error) {
        throw error;
      }

      toast.success(`Cleared ${data || 0} prototypes successfully!`);
      onPrototypesCleared?.();
      
    } catch (error) {
      console.error('Error clearing prototypes:', error);
      toast.error('Failed to clear prototypes');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearPrototypes}
      disabled={isClearing}
      className="gap-2"
    >
      {isClearing ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {isClearing ? 'Clearing...' : 'Clear Prototypes'}
    </Button>
  );
}