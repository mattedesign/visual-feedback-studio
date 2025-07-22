import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pattern definitions with real company URLs
const VISUAL_PATTERNS = [
  // Dashboard Patterns
  {
    id: 'notion-dashboard',
    company: 'notion',
    name: 'Modular Dashboard',
    urls: {
      default: 'https://www.notion.so',
      hover: 'https://www.notion.so/product'
    }
  },
  {
    id: 'stripe-focus',
    company: 'stripe', 
    name: 'Single Metric Focus',
    urls: {
      default: 'https://dashboard.stripe.com',
      detail: 'https://stripe.com/docs/dashboard'
    }
  },
  {
    id: 'linear-activity',
    company: 'linear',
    name: 'Activity Stream', 
    urls: {
      default: 'https://linear.app',
      hover: 'https://linear.app/features'
    }
  },
  {
    id: 'mixpanel-dashboard',
    company: 'mixpanel',
    name: 'Analytics Dashboard',
    urls: {
      default: 'https://mixpanel.com/product',
      hover: 'https://mixpanel.com/product/insights'
    }
  },
  // CTA Patterns
  {
    id: 'stripe-cta',
    company: 'stripe',
    name: 'High Contrast CTA',
    urls: {
      default: 'https://stripe.com',
      hover: 'https://stripe.com/pricing'
    }
  },
  {
    id: 'airbnb-cta',
    company: 'airbnb',
    name: 'Trust-Building CTA',
    urls: {
      default: 'https://www.airbnb.com',
      hover: 'https://www.airbnb.com/host/homes'
    }
  },
  {
    id: 'spotify-cta',
    company: 'spotify',
    name: 'Music-Focused CTA',
    urls: {
      default: 'https://open.spotify.com',
      hover: 'https://www.spotify.com/premium'
    }
  },
  {
    id: 'apple-cta',
    company: 'apple',
    name: 'Minimal Premium CTA',
    urls: {
      default: 'https://www.apple.com',
      hover: 'https://www.apple.com/iphone'
    }
  },
  // Card Patterns
  {
    id: 'trello-card',
    company: 'trello',
    name: 'Project Cards',
    urls: {
      default: 'https://trello.com',
      hover: 'https://trello.com/tour'
    }
  },
  {
    id: 'figma-card', 
    company: 'figma',
    name: 'Design File Cards',
    urls: {
      default: 'https://www.figma.com',
      hover: 'https://www.figma.com/files'
    }
  },
  // Form Patterns
  {
    id: 'typeform-form',
    company: 'typeform',
    name: 'Conversational Forms',
    urls: {
      default: 'https://www.typeform.com',
      hover: 'https://www.typeform.com/examples'
    }
  },
  {
    id: 'google-form',
    company: 'google',
    name: 'Clean Simple Forms',
    urls: {
      default: 'https://docs.google.com/forms',
      hover: 'https://workspace.google.com/products/forms'
    }
  },
  // Navigation Patterns
  {
    id: 'vercel-nav',
    company: 'vercel',
    name: 'Developer Navigation',
    urls: {
      default: 'https://vercel.com',
      hover: 'https://vercel.com/dashboard'
    }
  },
  {
    id: 'arc-nav',
    company: 'arc',
    name: 'Browser Navigation',
    urls: {
      default: 'https://arc.net',
      hover: 'https://resources.arc.net'
    }
  }
];

console.log('🎨 Visual Pattern Screenshot Capture Service');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { patterns = 'all', format = 'webp' } = await req.json();
    
    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get Screenshot One API key
    const screenshotApiKey = Deno.env.get('SCREENSHOT_ONE_ACCESS_KEY');
    if (!screenshotApiKey) {
      throw new Error('Screenshot One API key not configured');
    }

    console.log('🔍 Starting visual pattern capture...');
    
    const results = [];
    const patternsToCapture = patterns === 'all' ? VISUAL_PATTERNS : 
      VISUAL_PATTERNS.filter(p => patterns.includes(p.id));
    
    for (const pattern of patternsToCapture) {
      console.log(`📸 Capturing pattern: ${pattern.name} (${pattern.company})`);
      
      try {
        // Capture each URL variant for the pattern
        for (const [variant, url] of Object.entries(pattern.urls)) {
          const filename = `${pattern.id.replace(`${pattern.company}-`, '')}-${variant}.${format}`;
          const storagePath = `patterns/${pattern.company}/${filename}`;
          
          console.log(`📷 Capturing ${variant} view: ${url}`);
          
          // Screenshot One API call
          const screenshotUrl = `https://api.screenshotone.com/take?` + new URLSearchParams({
            access_key: screenshotApiKey,
            url: url,
            viewport_width: '1200',
            viewport_height: '800',
            device_scale_factor: '2',
            format: format,
            image_width: '600', 
            image_height: '400',
            block_ads: 'true',
            block_cookie_banners: 'true',
            block_chats: 'true',
            delay: '3',
            timeout: '30'
          });
          
          const screenshotResponse = await fetch(screenshotUrl);
          
          if (!screenshotResponse.ok) {
            throw new Error(`Screenshot failed for ${url}: ${screenshotResponse.status}`);
          }
          
          const screenshotBlob = await screenshotResponse.blob();
          const screenshotBuffer = await screenshotBlob.arrayBuffer();
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('analysis-images')
            .upload(storagePath, screenshotBuffer, {
              contentType: `image/${format}`,
              upsert: true
            });
          
          if (uploadError) {
            console.error(`❌ Upload failed for ${storagePath}:`, uploadError);
            continue;
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('analysis-images')
            .getPublicUrl(storagePath);
          
          results.push({
            pattern_id: pattern.id,
            company: pattern.company,
            variant: variant,
            url: url,
            storage_path: storagePath,
            public_url: urlData.publicUrl,
            filename: filename
          });
          
          console.log(`✅ Captured and uploaded: ${filename}`);
          
          // Rate limiting - be respectful to the APIs
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`❌ Error capturing pattern ${pattern.id}:`, error);
        results.push({
          pattern_id: pattern.id,
          company: pattern.company,
          error: error.message
        });
      }
    }
    
    console.log(`✅ Capture complete! Processed ${results.length} screenshots`);
    
    return new Response(
      JSON.stringify({
        success: true,
        total_patterns: patternsToCapture.length,
        successful_captures: results.filter(r => !r.error).length,
        failed_captures: results.filter(r => r.error).length,
        results: results,
        message: `Captured visual patterns for ${patternsToCapture.length} patterns`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Visual pattern capture error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Visual pattern capture failed'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});