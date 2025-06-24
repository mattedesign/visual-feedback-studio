
export async function validateAndTestApiKey(apiKey: string): Promise<string> {
  console.log('=== Simplified API Key Validation ===');
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  // Basic API key cleaning and validation
  const cleanApiKey = apiKey.trim().replace(/[\r\n\t]/g, '');
  console.log('Basic API key validation:', {
    exists: !!cleanApiKey,
    length: cleanApiKey.length,
    startsWithPrefix: cleanApiKey.startsWith('sk-ant-')
  });
  
  if (!cleanApiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid Anthropic API key format. API key should start with sk-ant-');
  }
  
  if (cleanApiKey.length < 50) {
    throw new Error('Anthropic API key appears to be too short');
  }

  console.log('API key format validation successful - proceeding without connection test');
  return cleanApiKey;
}
