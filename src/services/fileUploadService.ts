
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced upload service that uses Supabase Storage for analysis images
export const uploadFileToStorage = async (file: File, analysisId: string): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to upload files');
      return null;
    }

    console.log('🔄 Starting Supabase Storage upload for:', file.name, 'Size:', file.size);

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported');
      return null;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('File size must be less than 50MB');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${analysisId}/${Date.now()}.${fileExt}`;

    // Upload to analysis-images bucket (for images sent to AI)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('analysis-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      toast.error(`Upload failed: ${uploadError.message}`);
      return null;
    }

    console.log('✅ File uploaded to storage:', uploadData.path);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('analysis-images')
      .getPublicUrl(fileName);

    console.log('🔗 Public URL generated:', urlData.publicUrl);

    // Verify the file is accessible
    try {
      const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`File not accessible: ${response.status}`);
      }
      console.log('✅ File verified as publicly accessible');
    } catch (verifyError) {
      console.error('❌ File verification failed:', verifyError);
      toast.error('File upload verification failed');
      return null;
    }

    // Save metadata to uploaded_files table
    if (!analysisId.startsWith('temp-')) {
      const { data: fileRecord, error: dbError } = await supabase
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
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database save error:', dbError);
        toast.error('Failed to save file information');
        return null;
      }

      console.log('✅ File metadata saved to database:', fileRecord.id);
    }

    toast.success('Image uploaded successfully!');
    return urlData.publicUrl;

  } catch (error) {
    console.error('💥 Unexpected upload error:', error);
    toast.error('An unexpected error occurred during upload');
    return null;
  }
};

// Enhanced function to upload blob data (from file inputs, drag & drop)
export const uploadBlobToStorage = async (blob: Blob, fileName: string, analysisId: string): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to upload images');
      return null;
    }

    console.log('🔄 Uploading blob to storage:', fileName, 'Size:', blob.size);

    const storagePath = `${user.id}/${analysisId}/${Date.now()}_${fileName}`;

    // Upload blob to analysis-images bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('analysis-images')
      .upload(storagePath, blob, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Blob upload error:', uploadError);
      toast.error(`Upload failed: ${uploadError.message}`);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('analysis-images')
      .getPublicUrl(storagePath);

    console.log('✅ Blob uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('💥 Blob upload error:', error);
    toast.error('Failed to upload image');
    return null;
  }
};
