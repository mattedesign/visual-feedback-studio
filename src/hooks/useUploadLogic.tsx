
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUploadLogic = (onImageUpload: (imageUrl: string) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createAnalysis = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to upload files');
      return null;
    }

    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        title: 'New Design Analysis',
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating analysis:', error);
      toast.error('Failed to create analysis');
      return null;
    }

    return data.id;
  };

  const uploadFileToStorage = async (file: File, analysisId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${analysisId}/${Date.now()}.${fileExt}`;

    console.log('Uploading file to path:', fileName);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('analysis-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error(`Failed to upload file: ${uploadError.message}`);
      return null;
    }

    console.log('File uploaded successfully:', uploadData);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('analysis-files')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', urlData.publicUrl);

    // Save file metadata to database
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .insert({
        analysis_id: analysisId,
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: fileName,
        upload_type: 'file',
        public_url: urlData.publicUrl
      });

    if (dbError) {
      console.error('Error saving file metadata:', dbError);
      toast.error('Failed to save file information');
      return null;
    }

    return urlData.publicUrl;
  };

  const saveUrlUpload = async (url: string, type: 'url' | 'figma' | 'website', analysisId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const uploadData: any = {
      analysis_id: analysisId,
      user_id: user.id,
      file_name: `${type}-upload-${Date.now()}`,
      file_type: 'text/url',
      file_size: url.length,
      storage_path: '',
      upload_type: type,
      original_url: url
    };

    if (type === 'figma') {
      uploadData.figma_url = url;
    } else if (type === 'website') {
      uploadData.website_url = url;
    }

    const { error } = await supabase
      .from('uploaded_files')
      .insert(uploadData);

    if (error) {
      console.error('Error saving URL upload:', error);
      toast.error('Failed to save URL information');
      return null;
    }

    return url;
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting file upload process for:', file.name);
      
      // Create analysis first
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      console.log('Created analysis with ID:', analysisId);

      // Upload file to storage
      const publicUrl = await uploadFileToStorage(file, analysisId);
      if (!publicUrl) {
        setIsProcessing(false);
        return;
      }

      console.log('File upload completed, public URL:', publicUrl);

      // Use the actual uploaded file URL
      onImageUpload(publicUrl);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error during file upload:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlSubmit = async (url: string) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing website URL:', url);
      
      // Create analysis first
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      // Save URL upload
      const savedUrl = await saveUrlUpload(url, 'website', analysisId);
      if (!savedUrl) {
        setIsProcessing(false);
        return;
      }

      // For demo purposes, we'll use a placeholder image
      // In a real implementation, you'd capture a screenshot of the website
      onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
      toast.success('Website URL saved successfully!');
    } catch (error) {
      console.error('Error saving website URL:', error);
      toast.error('Failed to save website URL');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFigmaSubmit = async (figmaUrl: string) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing Figma URL:', figmaUrl);
      
      // Create analysis first
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      // Save Figma URL
      const savedUrl = await saveUrlUpload(figmaUrl, 'figma', analysisId);
      if (!savedUrl) {
        setIsProcessing(false);
        return;
      }

      // For demo purposes, we'll use a placeholder image
      // In a real implementation, you'd use Figma's API to get the design
      onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
      toast.success('Figma URL saved successfully!');
    } catch (error) {
      console.error('Error saving Figma URL:', error);
      toast.error('Failed to save Figma URL');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemoUpload = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Loading demo design');
      
      // Create analysis for demo
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      // Save as a demo URL upload
      await saveUrlUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71', 'url', analysisId);
      
      onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
      toast.success('Demo design loaded successfully!');
    } catch (error) {
      console.error('Error loading demo:', error);
      toast.error('Failed to load demo design');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleFileUpload,
    handleUrlSubmit,
    handleFigmaSubmit,
    handleDemoUpload,
  };
};
