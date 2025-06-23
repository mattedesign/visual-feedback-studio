
export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  hasOpenAIKey: boolean;
  hasClaudeKey: boolean;
}

export function validateEnvironment(): EnvironmentConfig {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const hasOpenAIKey = !!Deno.env.get('OPENAI_API_KEY');
  const hasClaudeKey = !!Deno.env.get('ANTHROPIC_API_KEY');
  
  console.log('Environment validation:', {
    supabaseUrlExists: !!supabaseUrl,
    supabaseServiceKeyExists: !!supabaseServiceKey,
    openaiKeyExists: hasOpenAIKey,
    claudeKeyExists: hasClaudeKey
  });

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('CRITICAL: Supabase configuration missing');
    throw new Error('Supabase configuration is missing');
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    hasOpenAIKey,
    hasClaudeKey
  };
}
