
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const uploadFileToStorage = async (file: File, analysisId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to upload files');
      return null;
    }

    console.log('Starting file upload for user:', user.id, 'analysis:', analysisId);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${analysisId}/${Date.now()}.${fileExt}`;

    console.log('Uploading file to path:', fileName);

    // First, check if the bucket exists and create it if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.id === 'analysis-files');
    
    if (!bucketExists) {
      console.log('Creating analysis-files bucket...');
      const { error: bucketError } = await supabase.storage.createBucket('analysis-files', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 50 * 1024 * 1024 // 50MB
      });
      
      if (bucketError) {
        console.error('Error creating bucket:', bucketError);
        toast.error('Failed to create storage bucket');
        return null;
      }
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('analysis-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

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

    // Verify the file was uploaded by trying to access it
    try {
      const response = await fetch(urlData.publicUrl);
      if (!response.ok) {
        throw new Error(`File not accessible: ${response.status}`);
      }
      console.log('File verified as accessible');
    } catch (verifyError) {
      console.error('File verification failed:', verifyError);
      toast.error('File upload verification failed');
      return null;
    }

    // Save file metadata to database
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
      console.error('Error saving file metadata:', dbError);
      toast.error('Failed to save file information');
      return null;
    }

    console.log('File metadata saved:', fileRecord);
    return urlData.publicUrl;

  } catch (error) {
    console.error('Unexpected error in file upload:', error);
    toast.error('An unexpected error occurred during upload');
    return null;
  }
};
