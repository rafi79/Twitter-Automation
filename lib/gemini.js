import { GoogleGenerativeAI } from '@google/generative-ai';

// Secure API key retrieval with fallbacks
function getGeminiApiKey() {
  // Try multiple environment variable names for security
  const apiKey = process.env.GEMINI_API_KEY || 
                 process.env.GOOGLE_AI_API_KEY || 
                 process.env.GENERATIVE_AI_KEY ||
                 process.env.NEXT_PUBLIC_GEMINI_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found in environment variables');
  }
  
  return apiKey;
}

// Initialize Gemini AI with error handling
export function initializeGemini() {
  try {
    const apiKey = getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw error;
  }
}

// Generate blog content with comprehensive prompting
export async function generateBlogContent(topic, length, style) {
  try {
    const model = initializeGemini();
    
    const wordCount = length === 'short' ? '300-500' : 
                     length === 'medium' ? '800-1200' : '1500-2500';
    
    const toneInstruction = style === 'professional' ? 'professional and authoritative' : 
                           style === 'friendly' ? 'friendly and conversational' : 
                           'casual and engaging';

    const prompt = `Write a comprehensive blog post about "${topic}".

Requirements:
- Length: ${wordCount} words
- Tone: ${toneInstruction}
- Include a catchy title (start with # for markdown)
- Structure with clear headings and subheadings
- Include practical tips and actionable advice
- Add a compelling introduction and conclusion
- Optimize for SEO and engagement
- Include a call-to-action at the end
- Use proper markdown formatting
- Make it engaging and valuable for readers

Format the output as a well-structured blog post with proper markdown formatting.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating blog content:', error);
    throw error;
  }
}

// Generate Twitter-optimized tweet
export async function generateTweet(topic, blogUrl = '[LINK]') {
  try {
    const model = initializeGemini();
    
    const prompt = `Create a Twitter-friendly promotional tweet for a blog post about "${topic}".

Requirements:
- Maximum 280 characters (very important!)
- Include relevant hashtags (2-3 maximum)
- Be engaging and clickbait-worthy
- Include emojis strategically
- End with a call to action to read the blog
- Include ${blogUrl} where the link should go
- Make it shareable and likely to get engagement

Create a tweet that will make people want to click and read the full blog post.`;

    const result = await model.generateContent(prompt);
    return result.response.text().replace(/"/g, '').trim();
  } catch (error) {
    console.error('Error generating tweet:', error);
    throw error;
  }
}

// Validate API key format
export function validateApiKey(apiKey) {
  if (!apiKey) return false;
  
  // Basic validation for Google API key format
  const apiKeyPattern = /^AIza[0-9A-Za-z-_]{35}$/;
  return apiKeyPattern.test(apiKey);
}

// Test API key functionality
export async function testApiKey(apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Simple test prompt
    const result = await model.generateContent('Say "API key is working" if you can read this.');
    const response = result.response.text();
    
    return response.includes('API key is working') || response.includes('working');
  } catch (error) {
    console.error('API key test failed:', error);
    return false;
  }
}
