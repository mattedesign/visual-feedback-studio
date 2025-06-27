
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TestDALLE = () => {
  const [issue, setIssue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testDALLE = async () => {
    if (!issue.trim()) return;
    
    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      console.log('Calling test-dalle edge function...');
      
      const { data, error: functionError } = await supabase.functions.invoke('test-dalle', {
        body: { issue: issue.trim() }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        setError(`Function error: ${functionError.message}`);
        return;
      }

      if (data?.success) {
        console.log('Image generated successfully:', data.imageUrl);
        setImageUrl(data.imageUrl);
      } else {
        console.error('Generation failed:', data);
        setError(data?.error || 'Unknown error occurred');
      }
    } catch (err: any) {
      console.error('Network error:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎨 DALL-E 3 Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder="Describe a design issue (e.g., 'poor button contrast')"
          style={{ 
            width: '400px', 
            padding: '12px', 
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px'
          }}
        />
        <button 
          onClick={testDALLE}
          disabled={loading || !issue.trim()}
          style={{
            marginLeft: '10px',
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : 'Generate Solution'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffe6e6', 
          border: '1px solid #ff9999',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#cc0000'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {imageUrl && (
        <div>
          <h3>✨ Generated Design Solution:</h3>
          <img 
            src={imageUrl} 
            alt="AI Generated Design Solution" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '2px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }} 
          />
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            <strong>Original Issue:</strong> {issue}
          </p>
        </div>
      )}
    </div>
  );
};

export default TestDALLE;
