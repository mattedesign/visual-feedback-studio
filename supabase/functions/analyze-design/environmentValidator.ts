
export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  hasOpenAIKey: boolean;
  hasClaudeKey: boolean;
  openaiKeyValidation?: ApiKeyValidation;
  claudeKeyValidation?: ApiKeyValidation;
}

export interface ApiKeyValidation {
  exists: boolean;
  length: number;
  preview: string;
  startsCorrectly: boolean;
  hasWhitespace: boolean;
  hasSpecialChars: boolean;
  authHeaderFormat: string;
}

export function validateEnvironment(): EnvironmentConfig {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const claudeKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  console.log('🔍 DETAILED API KEY DEBUGGING');
  console.log('============================');
  
  // OpenAI Key Analysis
  const openaiValidation = analyzeApiKey(openaiKey, 'sk-', 'OpenAI');
  
  // Claude Key Analysis
  const claudeValidation = analyzeApiKey(claudeKey, 'sk-ant-', 'Claude');
  
  console.log('Environment summary:', {
    supabaseUrlExists: !!supabaseUrl,
    supabaseServiceKeyExists: !!supabaseServiceKey,
    openaiKeyExists: openaiValidation.exists,
    claudeKeyExists: claudeValidation.exists
  });

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('CRITICAL: Supabase configuration missing');
    throw new Error('Supabase configuration is missing');
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    hasOpenAIKey: openaiValidation.exists,
    hasClaudeKey: claudeValidation.exists,
    openaiKeyValidation: openaiValidation,
    claudeKeyValidation: claudeValidation
  };
}

function analyzeApiKey(apiKey: string | undefined, expectedPrefix: string, provider: string): ApiKeyValidation {
  console.log(`\n🔑 ${provider} API Key Analysis:`);
  
  if (!apiKey) {
    console.log(`❌ ${provider} API key not found in environment`);
    return {
      exists: false,
      length: 0,
      preview: 'N/A',
      startsCorrectly: false,
      hasWhitespace: false,
      hasSpecialChars: false,
      authHeaderFormat: 'N/A'
    };
  }
  
  const cleanKey = apiKey.trim();
  const hasWhitespace = apiKey !== cleanKey || /\s/.test(apiKey);
  const hasSpecialChars = /[\r\n\t\f\v]/.test(apiKey);
  const startsCorrectly = cleanKey.startsWith(expectedPrefix);
  const preview = cleanKey.substring(0, 10);
  const authHeader = `Bearer ${cleanKey}`;
  
  console.log(`   Exists: ✅ YES`);
  console.log(`   Length: ${apiKey.length} characters`);
  console.log(`   Preview: "${preview}..."`);
  console.log(`   Expected prefix: "${expectedPrefix}"`);
  console.log(`   Starts correctly: ${startsCorrectly ? '✅' : '❌'}`);
  console.log(`   Has whitespace: ${hasWhitespace ? '⚠️  YES' : '✅ NO'}`);
  console.log(`   Has special chars: ${hasSpecialChars ? '⚠️  YES' : '✅ NO'}`);
  console.log(`   Auth header format: "Bearer ${preview}..."`);
  
  if (hasWhitespace) {
    console.log(`   ⚠️  Original key contains whitespace - this may cause auth issues`);
    console.log(`   Original length: ${apiKey.length}, Clean length: ${cleanKey.length}`);
  }
  
  if (hasSpecialChars) {
    console.log(`   ⚠️  Key contains special characters (\\r, \\n, \\t, etc.)`);
  }
  
  if (!startsCorrectly) {
    console.log(`   ❌ Key does not start with expected prefix "${expectedPrefix}"`);
  }
  
  return {
    exists: true,
    length: apiKey.length,
    preview,
    startsCorrectly,
    hasWhitespace,
    hasSpecialChars,
    authHeaderFormat: `Bearer ${preview}...`
  };
}
