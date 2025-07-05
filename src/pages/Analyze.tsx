import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Analyze() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [session, setSession] = useState<any>(null)
  const [images, setImages] = useState<File[]>([])
  const [userContext, setUserContext] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [useMultiModel, setUseMultiModel] = useState(true)
  const [selectedModels, setSelectedModels] = useState(['claude', 'gpt4', 'perplexity'])
  const [analysisType, setAnalysisType] = useState('strategic')

  // Initialize session on mount
  useEffect(() => {
    initializeSession()
  }, [])

  const initializeSession = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/auth')
      return
    }

    // Create a new analysis session
    const { data, error } = await supabase
      .from('analysis_sessions')
      .insert({ 
        user_id: user.id,
        images: [],
        user_context: '',
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      toast({
        title: "Error",
        description: "Failed to create analysis session",
        variant: "destructive",
      })
      return
    }

    if (data) {
      setSession(data)
      console.log('Session created:', data.id)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session || !e.target.files) return

    const files = Array.from(e.target.files)
    setImages(files)
    setIsUploading(true)

    try {
      // Upload to Supabase storage
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${session.user_id}/${session.id}/${Date.now()}_${index}.${fileExt}`
        
        console.log('Uploading:', fileName)
        
        const { data, error } = await supabase.storage
          .from('analysis-images')
          .upload(fileName, file)

        if (error) {
          console.error('Upload error:', error)
          throw error
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('analysis-images')
          .getPublicUrl(fileName)

        // Save image reference to database
        const { error: dbError } = await supabase
          .from('analysis_session_images')
          .insert({
            session_id: session.id,
            storage_url: urlData.publicUrl,
            filename: file.name,
            position: uploadedImages.length + index
          })

        if (dbError) {
          console.error('DB error:', dbError)
          throw dbError
        }

        return urlData.publicUrl
      })

      const urls = await Promise.all(uploadPromises)
      setUploadedImages(prev => [...prev, ...urls])

      // Update session with image URLs
      await supabase
        .from('analysis_sessions')
        .update({ 
          images: [...uploadedImages, ...urls],
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id)

      toast({
        title: "Success",
        description: `${files.length} image(s) uploaded successfully`,
      })

    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const startAnalysis = async () => {
    if (!session || uploadedImages.length === 0 || !userContext.trim()) {
      toast({
        title: "Missing Information",
        description: "Please upload images and describe what you'd like analyzed",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Update session with user context
      await supabase
        .from('analysis_sessions')
        .update({ 
          user_context: userContext,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id)

      // Trigger analysis
      console.log('Starting analysis for session:', session.id)
      
      const { data, error } = await supabase.functions.invoke('analysis-orchestrator', {
        body: { 
          sessionId: session.id,
          useMultiModel,
          models: selectedModels,
          analysisType
        }
      })

      if (error) {
        throw error
      }

      console.log('Analysis started:', data)

      // Redirect to results
      navigate(`/analyze-results/${session.id}`)

    } catch (error: any) {
      console.error('Analysis failed:', error)
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to start analysis. Please try again.",
        variant: "destructive",
      })
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Design Analysis</h1>
      <p className="text-muted-foreground mb-8">Upload your designs and get AI-powered UX feedback</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Image Upload */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Your Designs</h2>
          
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors cursor-pointer"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploading || !session}
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-foreground">Click to upload images</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
                </div>
              )}
            </div>

            {/* Image previews */}
            {uploadedImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {uploadedImages.length} image(s) uploaded
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Right: Context Input */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">What would you like analyzed?</h2>
          
          <div className="space-y-4">
            <Textarea
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder="Describe what you'd like me to analyze about these designs. For example:

• Check the visual hierarchy and readability
• Evaluate the checkout flow for conversion
• Review accessibility and mobile responsiveness
• Analyze the color scheme and branding consistency"
              className="min-h-[200px] resize-none"
              disabled={isAnalyzing}
            />

            <div className="text-sm text-muted-foreground">
              <p>Pro tip: Be specific about what aspects you want analyzed for better results.</p>
            </div>

            <Card className="p-4 mb-4">
              <h3 className="font-semibold mb-3">Analysis Options</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={useMultiModel}
                    onCheckedChange={setUseMultiModel}
                  />
                  <Label>Use Multi-Model Analysis (Recommended)</Label>
                </div>
                
                {useMultiModel && (
                  <>
                    <div className="pl-6 space-y-2">
                      <Label className="text-sm text-gray-600">AI Models:</Label>
                      <div className="space-y-1">
                        <label className="flex items-center space-x-2">
                          <Checkbox 
                            checked={selectedModels.includes('claude')}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedModels([...selectedModels, 'claude'])
                              } else {
                                setSelectedModels(selectedModels.filter(m => m !== 'claude'))
                              }
                            }}
                          />
                          <span className="text-sm">Claude (Strategic Analysis)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <Checkbox 
                            checked={selectedModels.includes('gpt4')}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedModels([...selectedModels, 'gpt4'])
                              } else {
                                setSelectedModels(selectedModels.filter(m => m !== 'gpt4'))
                              }
                            }}
                          />
                          <span className="text-sm">GPT-4 (Microcopy & UI)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <Checkbox 
                            checked={selectedModels.includes('perplexity')}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedModels([...selectedModels, 'perplexity'])
                              } else {
                                setSelectedModels(selectedModels.filter(m => m !== 'perplexity'))
                              }
                            }}
                          />
                          <span className="text-sm">Perplexity (Competitive Research)</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm">Analysis Focus:</Label>
                      <RadioGroup value={analysisType} onValueChange={setAnalysisType}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="strategic" id="strategic" />
                          <Label htmlFor="strategic" className="text-sm">Strategic (Business-focused)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="detailed" id="detailed" />
                          <Label htmlFor="detailed" className="text-sm">Detailed (UI/UX-focused)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="competitive" id="competitive" />
                          <Label htmlFor="competitive" className="text-sm">Competitive (Market-focused)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Button
              onClick={startAnalysis}
              disabled={!uploadedImages.length || !userContext.trim() || isAnalyzing || !session}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Analyze Designs
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Status info */}
      {session && (
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Session ID: {session.id}
        </div>
      )}
    </div>
  )
}