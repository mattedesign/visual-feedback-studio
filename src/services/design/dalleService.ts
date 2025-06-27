
interface SimpleDesignSuggestion {
  id: string;
  issueDescription: string;
  imageUrl: string;
  prompt: string;
  timestamp: Date;
}

class DALLEService {
  private apiKey: string;
  
  constructor() {
    // For frontend-only testing, we'll need to get the API key from environment
    // In production, this should be handled by an edge function for security
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  async generateDesignSuggestion(issueDescription: string): Promise<SimpleDesignSuggestion> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your environment.');
    }

    // Build a design-focused prompt
    const prompt = this.buildDesignPrompt(issueDescription);
    
    // Call DALL-E 3 API
    const imageUrl = await this.callDALLE(prompt);
    
    return {
      id: crypto.randomUUID(),
      issueDescription,
      imageUrl,
      prompt,
      timestamp: new Date()
    };
  }

  private buildDesignPrompt(issue: string): string {
    return `Professional UI/UX design solution for: ${issue}. Modern, clean, accessible design with proper contrast and visual hierarchy. Clean interface mockup, professional design, user-friendly layout.`;
  }

  private async callDALLE(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`DALL-E API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error('Invalid response from DALL-E API');
    }
    
    return data.data[0].url;
  }
}

export const dalleService = new DALLEService();
export default dalleService;
