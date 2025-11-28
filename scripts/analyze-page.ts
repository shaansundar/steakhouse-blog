/**
 * Page Analysis Script
 * 
 * Analyzes a web page and fills in the rating structure based on AEO/GEO criteria.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface RatingStructure {
  id: string;
  aeoGrade: string;
  storageType: string;
  images: any[];
  lang: string;
  url: string;
  viewport: string;
  llmsTxtExists: boolean;
  aeoAnalysis: {
    structured_data: any;
    answer_first_content: any;
    core_seo: any;
    technical: any;
    eat_trust: any;
  };
  geoAnalysis: any;
  [key: string]: any;
}

async function fetchPage(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
}

function parseHTML(html: string) {
  // Basic HTML parsing - in production, use a proper HTML parser like cheerio or jsdom
  return {
    html,
    title: extractTitle(html),
    metaDescription: extractMetaDescription(html),
    h1: extractHeadings(html, 'h1'),
    h2: extractHeadings(html, 'h2'),
    h3: extractHeadings(html, 'h3'),
    structuredData: extractStructuredData(html),
    robotsTxt: checkRobotsTxt(html),
    llmsTxt: checkLlmsTxt(html),
    links: extractLinks(html),
    images: extractImages(html),
  };
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractMetaDescription(html: string): string {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  return match ? match[1].trim() : '';
}

function extractHeadings(html: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, 'gi');
  const matches = html.matchAll(regex);
  return Array.from(matches, m => m[1].trim());
}

function extractStructuredData(html: string): any[] {
  const schemas: any[] = [];
  
  // Method 1: Standard JSON-LD script tags
  const regex1 = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches1 = html.matchAll(regex1);
  
  for (const match of matches1) {
    try {
      const json = JSON.parse(match[1].trim());
      if (Array.isArray(json)) {
        schemas.push(...json);
      } else {
        schemas.push(json);
      }
    } catch (e) {
      // Invalid JSON, skip
    }
  }
  
  // Method 2: Look for JSON-LD in React streaming format (Next.js)
  // Search for JSON-LD patterns in the HTML
  const jsonLdPattern = /"@context"\s*:\s*"https:\/\/schema\.org"/gi;
  if (jsonLdPattern.test(html)) {
    // Try to extract JSON objects that contain schema.org context
    const jsonMatches = html.match(/\{[^{}]*"@context"\s*:\s*"https:\/\/schema\.org"[^{}]*\}/gi);
    if (jsonMatches) {
      for (const jsonStr of jsonMatches) {
        try {
          const json = JSON.parse(jsonStr);
          schemas.push(json);
        } catch (e) {
          // Try to find complete JSON objects
          const fullMatch = html.match(new RegExp(`\\{[\\s\\S]*?"@context"\\s*:\\s*"https://schema\\.org"[\\s\\S]*?\\}`, 'i'));
          if (fullMatch) {
            try {
              const json = JSON.parse(fullMatch[0]);
              schemas.push(json);
            } catch (e2) {
              // Skip if still invalid
            }
          }
        }
      }
    }
  }
  
  return schemas;
}

function checkRobotsTxt(html: string): boolean {
  // Check if robots.txt is mentioned or if there's a robots meta tag
  return html.includes('robots.txt') || /<meta[^>]*name=["']robots["']/i.test(html);
}

function checkLlmsTxt(html: string): boolean {
  return html.includes('llm.txt') || html.includes('llms.txt');
}

function extractLinks(html: string): Array<{ href: string; text: string }> {
  const regex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  const matches = html.matchAll(regex);
  return Array.from(matches, m => ({
    href: m[1],
    text: m[2].trim(),
  }));
}

function extractImages(html: string): Array<{ src: string; alt: string }> {
  const regex = /<img[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/gi;
  const matches = html.matchAll(regex);
  return Array.from(matches, m => ({
    src: m[1],
    alt: m[2] || '',
  }));
}

function analyzeStructuredData(structuredData: any[], factors: any) {
  // Flatten nested arrays
  const flatSchemas: any[] = [];
  function flatten(arr: any[]) {
    for (const item of arr) {
      if (Array.isArray(item)) {
        flatten(item);
      } else if (item && typeof item === 'object') {
        flatSchemas.push(item);
      }
    }
  }
  flatten(structuredData);
  
  const hasFAQPage = flatSchemas.some(sd => 
    sd['@type'] === 'FAQPage' || 
    (sd.mainEntity && Array.isArray(sd.mainEntity)) ||
    (Array.isArray(sd['@type']) && sd['@type'].includes('FAQPage'))
  );
  
  const hasBreadcrumbs = flatSchemas.some(sd => 
    sd['@type'] === 'BreadcrumbList' ||
    (sd['@graph'] && sd['@graph'].some((item: any) => item['@type'] === 'BreadcrumbList')) ||
    (Array.isArray(sd['@type']) && sd['@type'].includes('BreadcrumbList'))
  );
  
  const hasHowTo = flatSchemas.some(sd => 
    sd['@type'] === 'HowTo' ||
    (Array.isArray(sd['@type']) && sd['@type'].includes('HowTo'))
  );
  
  const hasProduct = flatSchemas.some(sd => 
    sd['@type'] === 'Product' ||
    (Array.isArray(sd['@type']) && sd['@type'].includes('Product'))
  );
  
  const hasBlogPosting = flatSchemas.some(sd => 
    sd['@type'] === 'BlogPosting' ||
    (Array.isArray(sd['@type']) && sd['@type'].includes('BlogPosting'))
  );
  
  // Update factors with proper max values
  if (factors['FAQPage Schema']) {
    factors['FAQPage Schema'].max = 100;
    factors['FAQPage Schema'].name = 'FAQPage Schema';
    factors['FAQPage Schema'].found = hasFAQPage ? 'FAQPage schema detected' : 'No FAQPage schema';
    factors['FAQPage Schema'].score = hasFAQPage ? 100 : 0;
    factors['FAQPage Schema'].status = hasFAQPage ? 'good' : 'critical';
    factors['FAQPage Schema'].recommendation = hasFAQPage 
      ? 'FAQPage schema detected on page.' 
      : 'Add FAQPage schema markup to help AI systems understand your Q&A content.';
  }
  
  if (factors['Schema Breadcrumbs']) {
    factors['Schema Breadcrumbs'].max = 100;
    factors['Schema Breadcrumbs'].name = 'Schema Breadcrumbs';
    factors['Schema Breadcrumbs'].found = hasBreadcrumbs ? 'BreadcrumbList schema found' : 'No BreadcrumbList schema';
    factors['Schema Breadcrumbs'].score = hasBreadcrumbs ? 100 : 0;
    factors['Schema Breadcrumbs'].status = hasBreadcrumbs ? 'good' : 'critical';
    factors['Schema Breadcrumbs'].recommendation = hasBreadcrumbs
      ? 'BreadcrumbList schema found on page.'
      : 'Add BreadcrumbList schema to help AI systems understand your site structure.';
  }
  
  if (factors['HowTo Schema']) {
    factors['HowTo Schema'].max = 100;
    factors['HowTo Schema'].name = 'HowTo Schema';
    factors['HowTo Schema'].found = hasHowTo ? 'HowTo schema found' : 'No HowTo schema';
    factors['HowTo Schema'].score = hasHowTo ? 100 : 0;
    factors['HowTo Schema'].status = hasHowTo ? 'good' : 'warning';
    factors['HowTo Schema'].recommendation = hasHowTo
      ? 'HowTo schema properly implemented.'
      : 'Add HowTo schema for instructional content to help AI systems extract step-by-step processes.';
  }
  
  if (factors['Product Schema']) {
    factors['Product Schema'].max = 100;
    factors['Product Schema'].name = 'Product Schema';
    factors['Product Schema'].found = hasProduct ? 'Product schema found' : 'No Product schema';
    factors['Product Schema'].score = hasProduct ? 100 : 0;
    factors['Product Schema'].status = hasProduct ? 'good' : 'critical';
    factors['Product Schema'].recommendation = hasProduct
      ? 'Product schema detected.'
      : 'Add Product schema markup to help search engines understand your product offerings. Include name, image, description, and offers properties.';
  }
  
  // Check for BlogPosting schema (good for blog posts)
  if (hasBlogPosting && factors['Schema Uniqueness']) {
    factors['Schema Uniqueness'].max = 100;
    factors['Schema Uniqueness'].name = 'Schema Uniqueness';
    factors['Schema Uniqueness'].found = 'BlogPosting schema with @id found';
    factors['Schema Uniqueness'].score = 100;
    factors['Schema Uniqueness'].status = 'good';
    factors['Schema Uniqueness'].recommendation = 'Schema items have unique @id properties.';
  }
}

function analyzeContentStructure(parsed: any, factors: any) {
  // Check for TL;DR
  const hasTLDR = parsed.html.toLowerCase().includes('tl;dr') || 
                  parsed.html.toLowerCase().includes('tldr') ||
                  parsed.h2.some((h: string) => h.toLowerCase().includes('tl;dr'));
  
  if (factors['TL;DR Summary']) {
    factors['TL;DR Summary'].max = 100;
    factors['TL;DR Summary'].name = 'TL;DR Summary';
    factors['TL;DR Summary'].found = hasTLDR ? 'Summary section detected' : 'No summary section';
    factors['TL;DR Summary'].score = hasTLDR ? 100 : 0;
    factors['TL;DR Summary'].status = hasTLDR ? 'good' : 'warning';
    factors['TL;DR Summary'].recommendation = hasTLDR ? 'TL;DR or summary section found.' : 'Add a TL;DR section at the beginning of your content for quick AI extraction.';
  }
  
  // Check question-based H2s
  const questionH2s = parsed.h2.filter((h: string) => /^(what|how|why|when|where|who|can|should|will|does|is|are|do|did|was|were)/i.test(h.trim()));
  const h2QuestionRatio = parsed.h2.length > 0 ? (questionH2s.length / parsed.h2.length) * 100 : 0;
  
  if (factors['Question-Based H2s']) {
    factors['Question-Based H2s'].max = 100;
    factors['Question-Based H2s'].name = 'Question-Based H2s';
    factors['Question-Based H2s'].found = `${questionH2s.length} out of ${parsed.h2.length} H2s are question-based`;
    factors['Question-Based H2s'].score = Math.round(h2QuestionRatio);
    factors['Question-Based H2s'].status = h2QuestionRatio >= 50 ? 'good' : h2QuestionRatio >= 20 ? 'warning' : 'critical';
    factors['Question-Based H2s'].recommendation = h2QuestionRatio >= 50 
      ? 'Good use of question-based H2 headers.'
      : 'Restructure headers to directly answer user questions (e.g., "How Does X Work?" instead of "X Overview").';
  }
  
  // Check question-based H3s
  const questionH3s = parsed.h3.filter((h: string) => /^(what|how|why|when|where|who|can|should|will|does|is|are|do|did|was|were)/i.test(h.trim()));
  const h3QuestionRatio = parsed.h3.length > 0 ? (questionH3s.length / parsed.h3.length) * 100 : 0;
  
  if (factors['Question-Based H3s']) {
    factors['Question-Based H3s'].max = 100;
    factors['Question-Based H3s'].name = 'Question-Based H3s';
    factors['Question-Based H3s'].found = `${questionH3s.length} out of ${parsed.h3.length} H3s are question-based`;
    factors['Question-Based H3s'].score = Math.round(h3QuestionRatio);
    factors['Question-Based H3s'].status = h3QuestionRatio >= 50 ? 'good' : 'warning';
    factors['Question-Based H3s'].recommendation = h3QuestionRatio >= 50 
      ? 'Good use of question-based H3 subheaders.'
      : 'Use more question-based H3 subheaders to improve answer extraction.';
  }
  
  // Check for bulleted lists
  const bulletLists = (parsed.html.match(/<ul[^>]*>[\s\S]*?<\/ul>/gi) || []).length;
  if (factors['Bulleted Lists']) {
    factors['Bulleted Lists'].max = 100;
    factors['Bulleted Lists'].name = 'Bulleted Lists';
    factors['Bulleted Lists'].found = `${bulletLists} bulleted lists found`;
    factors['Bulleted Lists'].score = bulletLists >= 2 ? 100 : bulletLists === 1 ? 50 : 0;
    factors['Bulleted Lists'].status = bulletLists >= 2 ? 'good' : bulletLists === 1 ? 'warning' : 'critical';
    factors['Bulleted Lists'].recommendation = bulletLists >= 2 
      ? `Good use of bulleted lists (${bulletLists} found).`
      : 'Add more bulleted lists to improve content scannability.';
  }
  
  // Check for numbered lists
  const numberedLists = (parsed.html.match(/<ol[^>]*>[\s\S]*?<\/ol>/gi) || []).length;
  if (factors['Numbered Lists']) {
    factors['Numbered Lists'].max = 100;
    factors['Numbered Lists'].name = 'Numbered Lists';
    factors['Numbered Lists'].found = `${numberedLists} numbered lists found`;
    factors['Numbered Lists'].score = numberedLists > 0 ? 100 : 0;
    factors['Numbered Lists'].status = numberedLists > 0 ? 'good' : 'warning';
    factors['Numbered Lists'].recommendation = numberedLists > 0 
      ? 'Numbered lists present for sequential content.'
      : 'Add numbered lists for step-by-step or sequential content.';
  }
}

function analyzeSEO(parsed: any, factors: any) {
  // Check H1
  const h1Count = parsed.h1.length;
  if (factors['Target Keyword in H1']) {
    factors['Target Keyword in H1'].max = 100;
    factors['Target Keyword in H1'].name = 'Target Keyword in H1';
    factors['Target Keyword in H1'].found = `${h1Count} H1 tag(s) found`;
    factors['Target Keyword in H1'].score = h1Count === 1 ? 100 : 0;
    factors['Target Keyword in H1'].status = h1Count === 1 ? 'good' : 'critical';
    factors['Target Keyword in H1'].recommendation = h1Count === 1 
      ? 'H1 tag properly implemented.'
      : 'Use exactly one H1 per page containing your primary keyword.';
  }
  
  // Check title length
  const titleLength = parsed.title.length;
  if (factors['Target Keyword in Title']) {
    factors['Target Keyword in Title'].max = 100;
    factors['Target Keyword in Title'].name = 'Target Keyword in Title';
    factors['Target Keyword in Title'].found = `Title length: ${titleLength} characters`;
    factors['Target Keyword in Title'].score = titleLength >= 50 && titleLength <= 60 ? 100 : titleLength >= 40 && titleLength <= 70 ? 90 : 70;
    factors['Target Keyword in Title'].status = titleLength >= 50 && titleLength <= 60 ? 'good' : 'warning';
    factors['Target Keyword in Title'].recommendation = titleLength >= 50 && titleLength <= 60 
      ? 'Title tag well-optimized.'
      : 'Optimize title length to 50-60 characters for best results.';
  }
  
  // Check meta description
  const metaDescLength = parsed.metaDescription.length;
  if (factors['Unique Meta Description']) {
    factors['Unique Meta Description'].max = 100;
    factors['Unique Meta Description'].name = 'Unique Meta Description';
    factors['Unique Meta Description'].found = `${metaDescLength} characters`;
    factors['Unique Meta Description'].score = metaDescLength >= 120 && metaDescLength <= 160 ? 100 : metaDescLength >= 100 ? 75 : 50;
    factors['Unique Meta Description'].status = metaDescLength >= 120 && metaDescLength <= 160 ? 'good' : 'warning';
    factors['Unique Meta Description'].recommendation = metaDescLength >= 120 && metaDescLength <= 160
      ? 'Meta description length is optimal.'
      : 'Write 120-160 characters of unique copy different from title. Include primary keyword and call-to-action.';
  }
}

function analyzeTechnical(parsed: any, factors: any, url: string) {
  // Check robots.txt
  if (factors['Robots.txt Configuration']) {
    factors['Robots.txt Configuration'].max = 100;
    factors['Robots.txt Configuration'].name = 'Robots.txt Configuration';
    factors['Robots.txt Configuration'].found = parsed.robotsTxt ? 'robots.txt present' : 'robots.txt not found';
    factors['Robots.txt Configuration'].score = parsed.robotsTxt ? 90 : 0;
    factors['Robots.txt Configuration'].status = parsed.robotsTxt ? 'good' : 'critical';
    factors['Robots.txt Configuration'].recommendation = parsed.robotsTxt
      ? 'robots.txt is properly configured with AI-friendly directives and no blocking issues.'
      : 'Create a robots.txt file and explicitly allow AI crawlers (GPTBot, ClaudeBot, etc.).';
  }
  
  // Check llms.txt
  if (factors['LLMs.txt AI Directives']) {
    factors['LLMs.txt AI Directives'].max = 100;
    factors['LLMs.txt AI Directives'].name = 'LLMs.txt AI Directives';
    factors['LLMs.txt AI Directives'].found = parsed.llmsTxt ? 'llms.txt found' : 'llms.txt not found';
    factors['LLMs.txt AI Directives'].score = parsed.llmsTxt ? 100 : 0;
    factors['LLMs.txt AI Directives'].status = parsed.llmsTxt ? 'good' : 'critical';
    factors['LLMs.txt AI Directives'].recommendation = parsed.llmsTxt
      ? 'llms.txt file found.'
      : 'Create an llms.txt file to specify how AI models can use your content. Include: 1) Training data permissions, 2) Attribution requirements, 3) Content access guidelines.';
  }
  
  // Check images with alt text
  const imagesWithAlt = parsed.images.filter((img: any) => img.alt && img.alt.trim().length > 0).length;
  const totalImages = parsed.images.length;
  if (factors['Descriptive Alt Text']) {
    factors['Descriptive Alt Text'].max = 100;
    factors['Descriptive Alt Text'].name = 'Descriptive Alt Text';
    if (totalImages === 0) {
      factors['Descriptive Alt Text'].found = 'No images on page';
      factors['Descriptive Alt Text'].score = 70;
      factors['Descriptive Alt Text'].status = 'warning';
      factors['Descriptive Alt Text'].recommendation = 'Add images with descriptive alt text when relevant.';
    } else {
      const altRatio = (imagesWithAlt / totalImages) * 100;
      factors['Descriptive Alt Text'].found = `${imagesWithAlt} out of ${totalImages} images have alt text`;
      factors['Descriptive Alt Text'].score = Math.round(altRatio);
      factors['Descriptive Alt Text'].status = altRatio === 100 ? 'good' : altRatio >= 80 ? 'warning' : 'critical';
      factors['Descriptive Alt Text'].recommendation = altRatio === 100
        ? 'All images have descriptive alt text.'
        : 'Add descriptive alt text to all images for accessibility and AI understanding.';
    }
  }
}

async function analyzePage(url: string) {
  console.log(`Fetching page: ${url}`);
  const html = await fetchPage(url);
  
  console.log('Parsing HTML...');
  const parsed = parseHTML(html);
  
  console.log('Loading rating structure template...');
  const templatePath = join(process.cwd(), 'internal-rating-template', 'rating-structure.json');
  const template = JSON.parse(readFileSync(templatePath, 'utf-8')) as RatingStructure;
  
  // Fill in basic info
  template.url = url;
  template.id = `analysis-${Date.now()}`;
  template.storageType = 'local';
  template.lang = 'en';
  template.images = parsed.images;
  template.title = parsed.title;
  template.metaDescription = parsed.metaDescription;
  template.headers = {
    h1: parsed.h1,
    h2: parsed.h2,
    h3: parsed.h3,
    h4: [],
    h5: [],
    h6: [],
  };
  template.structuredData = parsed.structuredData;
  template.robotsTxtExists = parsed.robotsTxt;
  template.llmsTxtExists = parsed.llmsTxt;
  template.links = parsed.links;
  template.html = html.substring(0, 1000) + '...'; // Truncate for storage
  template.htmlSize = html.length;
  template.wordCount = countWords(html);
  
  // Analyze structured data
  console.log('Analyzing structured data...');
  analyzeStructuredData(parsed.structuredData, template.aeoAnalysis.structured_data.factors);
  
  // Analyze content structure
  console.log('Analyzing content structure...');
  analyzeContentStructure(parsed, template.aeoAnalysis.answer_first_content.factors);
  analyzeContentStructure(parsed, template.geoAnalysis.answer_first_content.factors);
  
  // Analyze SEO
  console.log('Analyzing SEO...');
  analyzeSEO(parsed, template.aeoAnalysis.core_seo.factors);
  analyzeSEO(parsed, template.geoAnalysis.core_seo.factors);
  
  // Analyze technical
  console.log('Analyzing technical aspects...');
  analyzeTechnical(parsed, template.aeoAnalysis.technical.factors, url);
  analyzeTechnical(parsed, template.geoAnalysis.technical.factors, url);
  
  // Calculate scores
  console.log('Calculating scores...');
  calculateScores(template);
  
  // Save results
  const outputPath = join(process.cwd(), 'internal-rating-template', `rating-${Date.now()}.json`);
  writeFileSync(outputPath, JSON.stringify(template, null, 2));
  console.log(`\nAnalysis complete! Results saved to: ${outputPath}`);
  
  return template;
}

function countWords(html: string): number {
  // Remove HTML tags and count words
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

function calculateScores(template: RatingStructure) {
  // Calculate category scores
  const categories = ['structured_data', 'answer_first_content', 'core_seo', 'technical', 'eat_trust'];
  
  for (const category of categories) {
    if (!template.aeoAnalysis[category] || !template.aeoAnalysis[category].factors) {
      continue;
    }
    
    const factors = template.aeoAnalysis[category].factors;
    const factorEntries = Object.entries(factors);
    
    if (factorEntries.length === 0) {
      template.aeoAnalysis[category].score = 0;
      continue;
    }
    
    let totalScore = 0;
    let totalMax = 0;
    
    for (const [_, factor] of factorEntries) {
      const score = (factor as any).score || 0;
      const max = (factor as any).max || 100;
      totalScore += score;
      totalMax += max;
    }
    
    template.aeoAnalysis[category].score = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    
    // Same for geoAnalysis
    if (template.geoAnalysis[category]?.factors) {
      const geoFactors = template.geoAnalysis[category].factors;
      const geoFactorEntries = Object.entries(geoFactors);
      
      if (geoFactorEntries.length > 0) {
        let geoTotalScore = 0;
        let geoTotalMax = 0;
        
        for (const [_, factor] of geoFactorEntries) {
          const score = (factor as any).score || 0;
          const max = (factor as any).max || 100;
          geoTotalScore += score;
          geoTotalMax += max;
        }
        
        template.geoAnalysis[category].score = geoTotalMax > 0 ? Math.round((geoTotalScore / geoTotalMax) * 100) : 0;
      }
    }
  }
  
  // Calculate overall AEO and GEO scores
  const aeoWeights = {
    structured_data: 0.25,
    answer_first_content: 0.29,
    core_seo: 0.09,
    technical: 0.18,
    eat_trust: 0.19,
  };
  
  template.aeoScore = Math.round(
    Object.entries(aeoWeights).reduce((sum, [cat, weight]) => {
      return sum + (template.aeoAnalysis[cat].score * weight);
    }, 0)
  );
  
  template.geoScore = template.aeoScore; // GEO uses same calculation for now
  
  // Assign grades
  template.aeoGrade = getGrade(template.aeoScore);
  template.geoGrade = getGrade(template.geoScore);
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

// Run analysis
const url = process.argv[2] || 'http://localhost:3001/blog/what-is-generative-engine-optimization';
analyzePage(url).catch(console.error);

