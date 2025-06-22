
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const uploadFileToStorage = async (file: File, analysisId: string) => {
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
