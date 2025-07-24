import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log('Seeding trends data for user:', user_id);

    // Sample detailed issues
    const sampleIssues = [
      {
        analysis_id: null, // Will be populated from existing analysis
        user_id,
        issue_title: "Generic welcome text lacks personality and clear value proposition",
        issue_description: "The welcome message at coordinates (76, 258, 246, 313) uses generic language that doesn't communicate specific benefits or create emotional connection with users.",
        category: "Typography",
        severity: "low",
        impact_level: "low",
        coordinates: { x: 76, y: 258, width: 170, height: 55 },
        suggested_solution: "Replace with benefit-focused copy that addresses user pain points and includes social proof elements"
      },
      {
        analysis_id: null,
        user_id,
        issue_title: "Right panel has weak visual separation between sections",
        issue_description: "Panel at (1150, 0, 1360, 900) lacks clear visual hierarchy and separation between different content areas.",
        category: "Visual Effects",
        severity: "low",
        impact_level: "low",
        coordinates: { x: 1150, y: 0, width: 210, height: 900 },
        suggested_solution: "Add subtle background colors, borders, or increased spacing to improve visual separation"
      },
      {
        analysis_id: null,
        user_id,
        issue_title: "Simple 'Thinking...' text provides minimal feedback",
        issue_description: "Loading text at (68, 431, 128, 442) doesn't provide engaging feedback during wait times.",
        category: "Micro-interactions",
        severity: "low",
        impact_level: "low",
        coordinates: { x: 68, y: 431, width: 60, height: 11 },
        suggested_solution: "Implement animated loading indicators with contextual messaging"
      },
      {
        analysis_id: null,
        user_id,
        issue_title: "Basic question text with minimal visual cues",
        issue_description: "Question text at (39, 780, 257, 795) lacks visual emphasis and guidance cues.",
        category: "Information Architecture",
        severity: "low", 
        impact_level: "low",
        coordinates: { x: 39, y: 780, width: 218, height: 15 },
        suggested_solution: "Add visual emphasis, help text, and clear formatting to guide user input"
      },
      {
        analysis_id: null,
        user_id,
        issue_title: "Plain teal button lacks visual hierarchy and magnetism",
        issue_description: "Button at (54, 342, 289, 383) uses flat design that doesn't draw attention or communicate action clearly.",
        category: "Layout",
        severity: "low",
        impact_level: "low",
        coordinates: { x: 54, y: 342, width: 235, height: 41 },
        suggested_solution: "Add gradients, shadows, and hover states to create visual magnetism and clear call-to-action"
      }
    ];

    // Sample applied solutions
    const sampleSolutions = [
      {
        analysis_id: null,
        user_id,
        solution_name: "Compelling welcome message with clear benefits and social proof",
        solution_description: "Redesigned welcome section with benefit-focused copy, customer testimonials, and clear value propositions",
        complexity_level: "medium",
        impact_rating: 4,
        category: "Typography"
      },
      {
        analysis_id: null,
        user_id,
        solution_name: "Clear section divisions with improved typography and visual hierarchy",
        solution_description: "Added visual separators, improved typography, and clear content organization",
        complexity_level: "medium", 
        impact_rating: 3,
        category: "Visual Effects"
      },
      {
        analysis_id: null,
        user_id,
        solution_name: "Animated progress indicator with contextual messaging",
        solution_description: "Interactive loading states with engaging animations and helpful progress information",
        complexity_level: "medium",
        impact_rating: 3,
        category: "Micro-interactions"
      },
      {
        analysis_id: null,
        user_id,
        solution_name: "Interactive drag-and-drop zone with visual feedback",
        solution_description: "Enhanced file upload experience with drag-and-drop functionality and clear visual feedback",
        complexity_level: "high",
        impact_rating: 5,
        category: "Interaction Design"
      },
      {
        analysis_id: null,
        user_id,
        solution_name: "Vibrant gradient button with action-oriented copy",
        solution_description: "Eye-catching button design with gradients, micro-interactions, and compelling call-to-action text",
        complexity_level: "high",
        impact_rating: 4,
        category: "Layout"
      }
    ];

    // Sample trending improvements
    const sampleTrendingImprovements = [
      { user_id, category: "Typography", improvement_type: "Font hierarchy improvements", frequency_count: 14, trend_percentage: 10.0, trend_direction: "increasing", time_period: "30days" },
      { user_id, category: "Visual Effects", improvement_type: "Color and shadow enhancements", frequency_count: 9, trend_percentage: 6.0, trend_direction: "decreasing", time_period: "30days" },
      { user_id, category: "Information Architecture", improvement_type: "Navigation and content structure", frequency_count: 8, trend_percentage: 6.0, trend_direction: "stable", time_period: "30days" },
      { user_id, category: "Layout", improvement_type: "Spacing and alignment fixes", frequency_count: 8, trend_percentage: 6.0, trend_direction: "increasing", time_period: "30days" },
      { user_id, category: "Micro-interactions", improvement_type: "Hover states and animations", frequency_count: 8, trend_percentage: 6.0, trend_direction: "decreasing", time_period: "30days" }
    ];

    // Sample design patterns
    const samplePatterns = [
      { pattern_name: "Button Enhancements", category: "Interface Elements", description: "Gradient buttons with hover effects and clear CTAs", frequency_count: 21, trend_direction: "increasing" },
      { pattern_name: "Typography Changes", category: "Visual Design", description: "Improved font hierarchy and readability", frequency_count: 15, trend_direction: "stable" },
      { pattern_name: "Color Improvements", category: "Visual Design", description: "Enhanced color contrast and brand consistency", frequency_count: 11, trend_direction: "increasing" },
      { pattern_name: "Spacing Adjustments", category: "Layout", description: "Better whitespace and component spacing", frequency_count: 6, trend_direction: "stable" }
    ];

    // Get user's most recent analysis to link data
    const { data: recentAnalysis } = await supabase
      .from('figmant_analysis_results')
      .select('id')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const analysisId = recentAnalysis?.id;

    // Insert detailed issues
    if (analysisId) {
      const issuesWithAnalysis = sampleIssues.map(issue => ({
        ...issue,
        analysis_id: analysisId
      }));

      const { error: issuesError } = await supabase
        .from('figmant_detailed_issues')
        .insert(issuesWithAnalysis);

      if (issuesError) {
        console.error('Error inserting issues:', issuesError);
      }

      // Insert applied solutions  
      const solutionsWithAnalysis = sampleSolutions.map(solution => ({
        ...solution,
        analysis_id: analysisId
      }));

      const { error: solutionsError } = await supabase
        .from('figmant_applied_solutions')
        .insert(solutionsWithAnalysis);

      if (solutionsError) {
        console.error('Error inserting solutions:', solutionsError);
      }
    }

    // Insert trending improvements
    const { error: trendsError } = await supabase
      .from('figmant_trending_improvements')
      .upsert(sampleTrendingImprovements, { 
        onConflict: 'user_id,category,improvement_type,time_period',
        ignoreDuplicates: false 
      });

    if (trendsError) {
      console.error('Error inserting trends:', trendsError);
    }

    // Insert design patterns
    const { error: patternsError } = await supabase
      .from('figmant_design_patterns')
      .upsert(samplePatterns, {
        onConflict: 'pattern_name,category',
        ignoreDuplicates: false
      });

    if (patternsError) {
      console.error('Error inserting patterns:', patternsError);
    }

    console.log('Successfully seeded trends data');

    return new Response(
      JSON.stringify({ success: true, message: 'Trends data seeded successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding trends data:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});