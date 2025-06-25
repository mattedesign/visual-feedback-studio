// DEFINITIVE RAG function with COMPREHENSIVE DIAGNOSTICS
async function getRAGContext(userPrompt: string) {
  try {
    console.log('🔍 Building RAG context for:', userPrompt.substring(0, 100));
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔑 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      urlValue: supabaseUrl,
      keyPrefix: supabaseKey?.substring(0, 20) + '...',
      keyType: supabaseKey?.includes('service_role') ? 'SERVICE_ROLE' : 'OTHER_KEY_TYPE'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️ Missing Supabase credentials for RAG');
      return null;
    }
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Supabase client created successfully');
    
    // =================================
    // COMPREHENSIVE DATABASE DIAGNOSTICS
    // =================================
    
    console.log('🔍 === STARTING DATABASE DIAGNOSTICS ===');
    
    // Test 1: Basic connection test
    console.log('🔍 Test 1: Basic connection...');
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from('knowledge_entries')
        .select('count', { count: 'exact', head: true });
      
      console.log('📊 Connection test result:', { 
        error: connectionError?.message || 'No error', 
        count: connectionTest,
        success: !connectionError 
      });
    } catch (e) {
      console.error('❌ Connection test failed:', e);
    }

    // Test 2: Simple select test
    console.log('🔍 Test 2: Simple select...');
    try {
      const { data: simpleTest, error: simpleError } = await supabase
        .from('knowledge_entries')  
        .select('id, title, category')
        .limit(3);
      
      console.log('📋 Simple select test:', {
        found: simpleTest?.length || 0,
        error: simpleError?.message || 'No error',
        sampleTitles: simpleTest?.map(d => d.title) || [],
        sampleCategories: simpleTest?.map(d => d.category) || []
      });
    } catch (e) {
      console.error('❌ Simple select test failed:', e);
    }

    // Test 3: Count all entries
    console.log('🔍 Test 3: Count all entries...');
    try {
      const { count, error: countError } = await supabase
        .from('knowledge_entries')
        .select('*', { count: 'exact', head: true });
      
      console.log('🔢 Count test result:', {
        totalEntries: count,
        error: countError?.message || 'No error',
        success: !countError
      });
    } catch (e) {
      console.error('❌ Count test failed:', e);
    }

    // Test 4: RLS permission test with specific category
    console.log('🔍 Test 4: RLS permission test...');
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('knowledge_entries')
        .select('id, title, category')
        .eq('category', 'ux-patterns')
        .limit(2);
      
      console.log('🔒 RLS test result:', {
        found: rlsTest?.length || 0,
        error: rlsError?.message || 'No error',
        hasRlsBlock: rlsError?.message?.includes('policy') || rlsError?.message?.includes('security'),
        sampleData: rlsTest || []
      });
    } catch (e) {
      console.error('❌ RLS test failed:', e);
    }

    // Test 5: Alternative query approach
    console.log('🔍 Test 5: Alternative query approach...');
    try {
      const { data: altTest, error: altError } = await supabase
        .from('knowledge_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      console.log('🔄 Alternative query result:', {
        found: altTest?.length || 0,
        error: altError?.message || 'No error',
        entries: altTest?.map(entry => ({
          id: entry.id,
          title: entry.title,
          category: entry.category
        })) || []
      });
    } catch (e) {
      console.error('❌ Alternative query failed:', e);
    }

    console.log('🔍 === DATABASE DIAGNOSTICS COMPLETE ===');
    
    // =================================
    // MAIN RAG QUERY (ORIGINAL LOGIC)
    // =================================
    
    console.log('🔍 Starting main RAG query...');
    const { data: knowledge, error } = await supabase
      .from('knowledge_entries')
      .select('id, title, content, category, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('📊 Main RAG query results:', {
      hasError: !!error,
      errorMessage: error?.message || null,
      errorCode: error?.code || null,
      errorHint: error?.hint || null,
      dataLength: knowledge?.length || 0,
      foundTitles: knowledge?.map(k => k.title) || [],
      foundCategories: knowledge?.map(k => k.category) || []
    });

    if (error) {
      console.log('⚠️ Knowledge retrieval error details:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
      return null;
    }
    
    if (!knowledge || knowledge.length === 0) {
      console.log('⚠️ No knowledge entries found in database');
      console.log('🚨 This means RAG is not working - falling back to standard analysis');
      return null;
    }
    
    console.log('✅ Successfully retrieved', knowledge.length, 'knowledge entries:');
    knowledge.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.title} (${entry.category})`);
    });
    
    // Build research context from your actual UX research
    const context = knowledge.map(k => 
      `${k.title}: ${k.content.substring(0, 200)}...`
    ).join('\n\n');
    
    const result = {
      context,
      knowledgeCount: knowledge.length,
      categories: [...new Set(knowledge.map(k => k.category))]
    };
    
    console.log('🎉 RAG context built successfully:', {
      contextLength: context.length,
      knowledgeCount: result.knowledgeCount,
      categories: result.categories,
      researchIncluded: knowledge.map(k => k.title)
    });
    
    return result;
    
  } catch (error) {
    console.log('⚠️ RAG context failed with error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return null;
  }
}