import { vectorKnowledgeService } from '@/services/knowledgeBase/vectorService';
import { KnowledgeEntry } from '@/types/vectorDatabase';

export interface KnowledgeSource {
  name: string;
  url: string;
  type: 'rss' | 'api' | 'scrape';
  category: KnowledgeEntry['category'];
  extractionRules?: {
    titleSelector?: string;
    contentSelector?: string;
    linkSelector?: string;
    dateSelector?: string;
  };
}

export interface IngestionResult {
  source: string;
  processed: number;
  errors: number;
  details: string[];
}

// Knowledge sources to ingest from
export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    name: 'Nielsen Norman Group',
    url: 'https://www.nngroup.com/feed/',
    type: 'rss',
    category: 'ux-research',
  },
  {
    name: 'Baymard Institute',
    url: 'https://baymard.com/blog',
    type: 'scrape',
    category: 'ecommerce-patterns',
    extractionRules: {
      titleSelector: 'h1, .entry-title',
      contentSelector: '.entry-content, .post-content',
      linkSelector: 'a[href*="/blog/"]',
    },
  },
  {
    name: 'Laws of UX',
    url: 'https://lawsofux.com',
    type: 'scrape',
    category: 'ux-patterns',
    extractionRules: {
      titleSelector: 'h1, .law-title',
      contentSelector: '.law-description, .content',
      linkSelector: 'a[href*="/law/"]',
    },
  },
  {
    name: 'ConversionXL',
    url: 'https://cxl.com/blog',
    type: 'scrape',
    category: 'conversion',
    extractionRules: {
      titleSelector: 'h1, .post-title',
      contentSelector: '.post-content, .entry-content',
      linkSelector: 'a[href*="/blog/"]',
    },
  },
];

export class KnowledgeIngestionService {
  private vectorService = vectorKnowledgeService;

  /**
   * Main orchestrator method to ingest knowledge from all configured sources
   */
  public async ingestFromSources(): Promise<IngestionResult[]> {
    console.log('Starting knowledge ingestion from all sources...');
    const results: IngestionResult[] = [];

    for (const source of KNOWLEDGE_SOURCES) {
      try {
        console.log(`Processing source: ${source.name}`);
        let result: IngestionResult;

        switch (source.type) {
          case 'rss':
            result = await this.ingestFromRSS(source);
            break;
          case 'scrape':
            result = await this.ingestFromScraping(source);
            break;
          case 'api':
            result = await this.ingestFromAPI(source);
            break;
          default:
            throw new Error(`Unsupported source type: ${source.type}`);
        }

        results.push(result);
        console.log(`Completed processing ${source.name}: ${result.processed} entries processed`);
      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
        results.push({
          source: source.name,
          processed: 0,
          errors: 1,
          details: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    }

    console.log('Knowledge ingestion completed');
    return results;
  }

  /**
   * Ingest knowledge from RSS feeds
   */
  private async ingestFromRSS(source: KnowledgeSource): Promise<IngestionResult> {
    console.log(`Ingesting from RSS: ${source.url}`);
    
    try {
      // Placeholder for RSS parsing - would use a library like fast-xml-parser
      const response = await fetch(source.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
      }

      const xmlText = await response.text();
      
      // Basic RSS parsing (placeholder implementation)
      const entries = this.parseRSSFeed(xmlText, source);
      
      let processed = 0;
      const errors: string[] = [];

      for (const entry of entries) {
        try {
          await this.vectorService.addKnowledgeEntry(entry);
          processed++;
        } catch (error) {
          console.error('Error adding entry:', error);
          errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
      }

      return {
        source: source.name,
        processed,
        errors: errors.length,
        details: errors,
      };
    } catch (error) {
      console.error(`RSS ingestion error for ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Ingest knowledge from web scraping
   */
  private async ingestFromScraping(source: KnowledgeSource): Promise<IngestionResult> {
    console.log(`Ingesting from web scraping: ${source.url}`);
    
    try {
      // Placeholder for web scraping - would use a library like Puppeteer or Cheerio
      const response = await fetch(source.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch webpage: ${response.statusText}`);
      }

      const htmlContent = await response.text();
      
      // Basic HTML parsing (placeholder implementation)
      const entries = this.parseWebContent(htmlContent, source);
      
      let processed = 0;
      const errors: string[] = [];

      for (const entry of entries) {
        try {
          await this.vectorService.addKnowledgeEntry(entry);
          processed++;
        } catch (error) {
          console.error('Error adding entry:', error);
          errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
      }

      return {
        source: source.name,
        processed,
        errors: errors.length,
        details: errors,
      };
    } catch (error) {
      console.error(`Web scraping error for ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Ingest knowledge from API endpoints
   */
  private async ingestFromAPI(source: KnowledgeSource): Promise<IngestionResult> {
    console.log(`Ingesting from API: ${source.url}`);
    
    try {
      const response = await fetch(source.url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'KnowledgeIngestionBot/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Process API response (placeholder implementation)
      const entries = this.parseAPIResponse(data, source);
      
      let processed = 0;
      const errors: string[] = [];

      for (const entry of entries) {
        try {
          await this.vectorService.addKnowledgeEntry(entry);
          processed++;
        } catch (error) {
          console.error('Error adding entry:', error);
          errors.push(error instanceof Error ? error.message : 'Unknown error');
        }
      }

      return {
        source: source.name,
        processed,
        errors: errors.length,
        details: errors,
      };
    } catch (error) {
      console.error(`API ingestion error for ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Parse RSS feed content (placeholder implementation)
   */
  private parseRSSFeed(xmlText: string, source: KnowledgeSource): Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>[] {
    // This is a placeholder - in a real implementation, you'd use a proper XML parser
    console.log('Parsing RSS feed content...');
    
    // Extract basic content using regex (very basic approach)
    const titleMatches = xmlText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || [];
    const descMatches = xmlText.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/g) || [];
    
    const entries: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    for (let i = 0; i < Math.min(titleMatches.length, descMatches.length); i++) {
      const title = titleMatches[i].replace(/<title><!\[CDATA\[/, '').replace(/\]\]><\/title>/, '');
      const content = descMatches[i].replace(/<description><!\[CDATA\[/, '').replace(/\]\]><\/description>/, '');
      
      if (title && content) {
        entries.push({
          title: title.trim(),
          content: content.trim(),
          source: source.name,
          category: source.category,
          tags: ['auto-ingested', 'rss'],
          metadata: {
            ingestionDate: new Date().toISOString(),
            sourceUrl: source.url,
          },
        });
      }
    }
    
    console.log(`Parsed ${entries.length} entries from RSS feed`);
    return entries.slice(0, 5); // Limit to 5 entries for testing
  }

  /**
   * Parse web content (placeholder implementation)
   */
  private parseWebContent(htmlContent: string, source: KnowledgeSource): Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>[] {
    // This is a placeholder - in a real implementation, you'd use a proper HTML parser like Cheerio
    console.log('Parsing web content...');
    
    // Very basic HTML parsing (placeholder)
    const entries: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    // Extract title from page
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'Extracted Content';
    
    // Extract some content (very basic approach)
    const contentMatch = htmlContent.match(/<p>(.*?)<\/p>/i);
    const content = contentMatch ? contentMatch[1] : 'Content extracted from web page';
    
    entries.push({
      title: title.trim(),
      content: content.trim(),
      source: source.name,
      category: source.category,
      tags: ['auto-ingested', 'web-scraping'],
      metadata: {
        ingestionDate: new Date().toISOString(),
        sourceUrl: source.url,
      },
    });
    
    console.log(`Parsed ${entries.length} entries from web content`);
    return entries;
  }

  /**
   * Parse API response (placeholder implementation)
   */
  private parseAPIResponse(data: any, source: KnowledgeSource): Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>[] {
    console.log('Parsing API response...');
    
    const entries: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>[] = [];
    
    // Handle different API response formats
    if (Array.isArray(data)) {
      for (const item of data.slice(0, 5)) { // Limit to 5 entries
        entries.push({
          title: item.title || item.name || 'API Content',
          content: item.content || item.description || item.summary || 'Content from API',
          source: source.name,
          category: source.category,
          tags: ['auto-ingested', 'api'],
          metadata: {
            ingestionDate: new Date().toISOString(),
            sourceUrl: source.url,
            apiData: item,
          },
        });
      }
    } else if (data.items || data.posts || data.articles) {
      const items = data.items || data.posts || data.articles;
      for (const item of items.slice(0, 5)) {
        entries.push({
          title: item.title || item.name || 'API Content',
          content: item.content || item.description || item.summary || 'Content from API',
          source: source.name,
          category: source.category,
          tags: ['auto-ingested', 'api'],
          metadata: {
            ingestionDate: new Date().toISOString(),
            sourceUrl: source.url,
            apiData: item,
          },
        });
      }
    }
    
    console.log(`Parsed ${entries.length} entries from API response`);
    return entries;
  }
}

// Export singleton instance
export const knowledgeIngestionService = new KnowledgeIngestionService();
