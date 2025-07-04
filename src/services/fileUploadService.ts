
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

    // ✅ ENHANCED: Always save metadata to uploaded_files table with UUID validation and retry logic
    try {
      // Validate UUID format before database save
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(analysisId)) {
        console.error('❌ Invalid UUID format:', analysisId);
        toast.error('Invalid analysis ID format. Please try uploading again.');
        return null;
      }

      console.log('✅ UUID validation passed, saving to database...');

      // First, try to create analysis record if it doesn't exist
      const { data: existingAnalysis } = await supabase
        .from('analyses')
        .select('id')
        .eq('id', analysisId)
        .eq('user_id', user.id)
        .single();

      if (!existingAnalysis) {
        console.log('📝 Creating new analysis record...');
        const { error: analysisError } = await supabase
          .from('analyses')
          .insert({
            id: analysisId,
            user_id: user.id,
            title: `Analysis for ${file.name}`,
            status: 'pending',
            design_type: 'web'
          });

        if (analysisError) {
          console.error('❌ Failed to create analysis record:', analysisError);
          // Continue with file record creation even if analysis creation fails
        } else {
          console.log('✅ Analysis record created successfully');
        }
      }

      // Save file metadata with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let fileRecord = null;

      while (retryCount < maxRetries) {
        try {
          const { data, error: dbError } = await supabase
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
            throw dbError;
          }

          fileRecord = data;
          console.log('✅ File metadata saved to database:', fileRecord.id);
          break;

        } catch (dbError: any) {
          retryCount++;
          console.error(`❌ Database save attempt ${retryCount} failed:`, dbError);

          if (retryCount >= maxRetries) {
            console.warn('⚠️ Max retries reached - file uploaded successfully but metadata save failed');
            console.log('📁 File URL still valid:', urlData.publicUrl);
            
            // Don't fail the upload - file is still accessible
            break;
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

    } catch (dbSaveError) {
      console.error('❌ Database save exception:', dbSaveError);
      console.log('📁 File upload successful despite DB save issue:', urlData.publicUrl);
      
      // Don't fail the upload - file is still accessible
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
