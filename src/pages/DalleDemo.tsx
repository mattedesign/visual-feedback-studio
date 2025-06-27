
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function DALLEDemo() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('generate-dalle-image', {
        body: { prompt }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      if (data?.success) {
        setImageUrl(data.imageUrl);
      } else {
        setError(data?.error || 'Generation failed');
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎨 DALL-E 3 Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a design improvement (e.g., 'accessible button with good contrast')"
          style={{ 
            width: '500px', 
            padding: '12px', 
            fontSize: '16px',
            marginRight: '10px'
          }}
        />
        <button 
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {imageUrl && (
        <div>
          <h3>Generated Design:</h3>
          <img 
            src={imageUrl} 
            alt="Generated design" 
            style={{ maxWidth: '100%', border: '1px solid #ddd' }} 
          />
        </div>
      )}
    </div>
  );
}
