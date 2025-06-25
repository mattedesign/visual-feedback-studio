
import { supabase } from '@/integrations/supabase/client';

export async function checkKnowledgeBaseStatus(): Promise<{
  hasData: boolean;
  totalEntries: number;
  entriesByCategory: Record<string, number>;
  sampleEntries: Array<{ id: string; title: string; category: string }>;
}> {
  try {
    // Count total entries
    const { count: totalEntries, error: countError } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting knowledge entries:', countError);
      throw countError;
    }

    // Get sample entries
    const { data: sampleEntries, error: sampleError } = await supabase
      .from('knowledge_entries')
      .select('id, title, category')
      .limit(10);

    if (sampleError) {
      console.error('Error fetching sample entries:', sampleError);
      throw sampleError;
    }

    // Get all entries to count by category
    const { data: allEntries, error: allError } = await supabase
      .from('knowledge_entries')
      .select('category');

    if (allError) {
      console.error('Error fetching all entries:', allError);
      throw allError;
    }

    // Count entries by category
    const entriesByCategory = (allEntries || []).reduce((acc: Record<string, number>, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {});

    return {
      hasData: (totalEntries || 0) > 0,
      totalEntries: totalEntries || 0,
      entriesByCategory,
      sampleEntries: sampleEntries || []
    };

  } catch (error) {
    console.error('Error checking knowledge base:', error);
    throw error;
  }
}

export async function populateBasicKnowledgeEntries(): Promise<void> {
  console.log('🔧 Populating basic knowledge entries...');
  
  const basicEntries = [
    {
      title: "Color Contrast Guidelines",
      content: "WCAG 2.1 requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text. This ensures accessibility for users with visual impairments. Colors should be tested across different devices and lighting conditions.",
      category: "accessibility",
      tags: ["wcag", "contrast", "accessibility", "color"]
    },
    {
      title: "F-Pattern Reading Behavior",
      content: "Users read web content in an F-pattern: horizontal movements across the top, a second horizontal movement covering a shorter area, and vertical scanning down the left side. Place important information along these areas.",
      category: "ux",
      tags: ["reading", "layout", "eye-tracking", "content"]
    },
    {
      title: "Call-to-Action Button Best Practices",
      content: "Effective CTAs use action-oriented language, contrasting colors, appropriate sizing, and strategic placement. They should stand out from other elements while maintaining visual hierarchy. Test different variations for optimal conversion.",
      category: "conversion",
      tags: ["cta", "buttons", "conversion", "design"]
    },
    {
      title: "Mobile-First Design Principles",
      content: "Design for the smallest screen first, then progressively enhance for larger screens. Focus on essential content, touch-friendly interfaces, and performance optimization. Consider thumb-reach zones and one-handed usage patterns.",
      category: "ux",
      tags: ["mobile", "responsive", "touch", "usability"]
    },
    {
      title: "Visual Hierarchy Fundamentals",
      content: "Use size, color, contrast, spacing, and typography to guide user attention. Establish clear information architecture with primary, secondary, and tertiary elements. Maintain consistency throughout the interface.",
      category: "visual",
      tags: ["hierarchy", "typography", "layout", "attention"]
    }
  ];

  try {
    for (const entry of basicEntries) {
      const { error } = await supabase
        .from('knowledge_entries')
        .insert(entry);
      
      if (error) {
        console.error(`Error inserting entry "${entry.title}":`, error);
      } else {
        console.log(`✅ Inserted: ${entry.title}`);
      }
    }
    
    console.log('🎉 Basic knowledge entries populated successfully');
  } catch (error) {
    console.error('❌ Error populating knowledge entries:', error);
    throw error;
  }
}
