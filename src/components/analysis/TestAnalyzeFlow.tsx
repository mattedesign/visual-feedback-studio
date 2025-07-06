import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export function TestAnalyzeFlow() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const testAnalyzeFunction = async () => {
    setLoading(true)
    try {
      // Test the analyze-design function with minimal data
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: { 
          sessionId: 'test-session-' + Date.now(),
          imageUrls: ['https://via.placeholder.com/800x600/0066cc/ffffff?text=Test+Design'],
          analysisPrompt: 'Test the UX analysis functionality',
          useMultiModel: false,
          models: ['claude'],
          analysisType: 'strategic'
        }
      })

      if (error) {
        throw error
      }

      console.log('Test result:', data)
      toast({
        title: "Test Successful",
        description: "The analyze function is working correctly",
      })

    } catch (error: any) {
      console.error('Test failed:', error)
      toast({
        title: "Test Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Test Analyze Flow</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This will test the analyze-design edge function to ensure it's working correctly.
      </p>
      <Button 
        onClick={testAnalyzeFunction}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Testing...' : 'Test Analyze Function'}
      </Button>
    </Card>
  )
}