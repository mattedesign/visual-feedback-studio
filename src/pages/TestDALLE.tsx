
import React, { useState } from 'react';

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
      const response = await fetch('/api/test-dalle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue })
      });

      const data = await response.json();
      
      if (data.success) {
        setImageUrl(data.imageUrl);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
    }
    
    setLoading(false);
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
