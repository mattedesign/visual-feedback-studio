
import { useState, useEffect } from 'react';
import { ColorVariant } from '@/components/ui/AnimatedGradientBackground';

interface UserContext {
  source: 'search' | 'social' | 'direct' | 'referral' | 'email' | 'ads' | 'unknown';
  searchTerm?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  gradient: ColorVariant;
  intensity: 'subtle' | 'medium' | 'bold';
}

export const useUserContext = (): UserContext => {
  const [context, setContext] = useState<UserContext>({
    source: 'unknown',
    gradient: 'purple',
    intensity: 'medium'
  });

  useEffect(() => {
    const detectContext = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const referrer = document.referrer;
      
      // Get UTM parameters
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      const searchTerm = urlParams.get('q') || urlParams.get('query') || urlParams.get('search');

      let detectedContext: UserContext = {
        source: 'unknown',
        gradient: 'purple',
        intensity: 'medium',
        searchTerm: searchTerm || undefined,
        referrer: referrer || undefined,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined
      };

      // Detect source and set appropriate gradient
      if (utmSource) {
        // UTM-based detection
        if (utmSource.includes('google') || utmSource.includes('search')) {
          detectedContext = { ...detectedContext, source: 'search', gradient: 'blue', intensity: 'bold' };
        } else if (utmSource.includes('facebook') || utmSource.includes('twitter') || utmSource.includes('linkedin')) {
          detectedContext = { ...detectedContext, source: 'social', gradient: 'pink', intensity: 'medium' };
        } else if (utmSource.includes('email') || utmMedium === 'email') {
          detectedContext = { ...detectedContext, source: 'email', gradient: 'green', intensity: 'subtle' };
        } else if (utmMedium === 'cpc' || utmMedium === 'ppc') {
          detectedContext = { ...detectedContext, source: 'ads', gradient: 'orange', intensity: 'bold' };
        }
      } else if (referrer) {
        // Referrer-based detection
        if (referrer.includes('google.com') || referrer.includes('bing.com') || referrer.includes('yahoo.com')) {
          detectedContext = { ...detectedContext, source: 'search', gradient: 'blue', intensity: 'bold' };
        } else if (referrer.includes('facebook.com') || referrer.includes('twitter.com') || referrer.includes('t.co')) {
          detectedContext = { ...detectedContext, source: 'social', gradient: 'pink', intensity: 'medium' };
        } else if (referrer.includes('linkedin.com')) {
          detectedContext = { ...detectedContext, source: 'social', gradient: 'blue', intensity: 'medium' };
        } else if (referrer.includes('instagram.com')) {
          detectedContext = { ...detectedContext, source: 'social', gradient: 'peach', intensity: 'medium' };
        } else {
          detectedContext = { ...detectedContext, source: 'referral', gradient: 'purple', intensity: 'subtle' };
        }
      } else if (searchTerm) {
        // Direct search term detection
        detectedContext = { ...detectedContext, source: 'search', gradient: 'blue', intensity: 'bold' };
      } else {
        // Direct traffic
        detectedContext = { ...detectedContext, source: 'direct', gradient: 'purple', intensity: 'medium' };
      }

      // Special cases based on search terms or campaign names
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (term.includes('design') || term.includes('ui') || term.includes('ux')) {
          detectedContext.gradient = 'purple';
        } else if (term.includes('conversion') || term.includes('optimization')) {
          detectedContext.gradient = 'orange';
        } else if (term.includes('analysis') || term.includes('feedback')) {
          detectedContext.gradient = 'blue';
        }
      }

      if (utmCampaign) {
        const campaign = utmCampaign.toLowerCase();
        if (campaign.includes('christmas') || campaign.includes('holiday')) {
          detectedContext.gradient = 'red';
          detectedContext.intensity = 'bold';
        } else if (campaign.includes('summer') || campaign.includes('beach')) {
          detectedContext.gradient = 'peach';
          detectedContext.intensity = 'medium';
        }
      }

      console.log('User context detected:', detectedContext);
      setContext(detectedContext);
    };

    detectContext();
  }, []);

  return context;
};
