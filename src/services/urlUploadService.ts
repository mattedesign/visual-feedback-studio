
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const saveUrlUpload = async (url: string, type: 'url' | 'figma' | 'website', analysisId: string) => {
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
