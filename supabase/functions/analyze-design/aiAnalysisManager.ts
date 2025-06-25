
// Simple RAG function without debugging loops
async function getRAGContext(userPrompt: string) {
  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return null;
    }
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Simple direct query to knowledge entries
    const { data: knowledge, error } = await supabase
      .from('knowledge_entries')
      .select('id, title, content, category')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error || !knowledge || knowledge.length === 0) {
      return null;
    }
    
    // Build simple context from retrieved knowledge
    const context = knowledge.map(k => 
      `${k.title}: ${k.content.substring(0, 200)}...`
    ).join('\n\n');
    
    return {
      context,
      knowledgeCount: knowledge.length,
      categories: [...new Set(knowledge.map(k => k.category))],
      method: 'direct_query'
    };
    
  } catch (error) {
    return null;
  }
}

// Export for use in other modules
export { getRAGContext };
