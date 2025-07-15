import { initializeGemini, generateBlogContent, generateTweet } from '../lib/gemini.js';
import { validateEnvironment, sanitizeInput, getSecureHeaders } from '../utils/security.js';

export default async function handler(req, res) {
  // Enhanced CORS and security headers
  const secureHeaders = getSecureHeaders();
  Object.entries(secureHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate environment
  if (!validateEnvironment()) {
    return res.status(500).json({ 
      error: 'Server configuration error. Please contact administrator.' 
    });
  }

  // Extract and sanitize input
  const { topic, length, style } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  // Sanitize inputs
  const sanitizedTopic = sanitizeInput(topic);
  const sanitizedLength = ['short', 'medium', 'long'].includes(length) ? length : 'medium';
  const sanitizedStyle = ['casual', 'professional', 'friendly'].includes(style) ? style : 'casual';

  if (!sanitizedTopic) {
    return res.status(400).json({ error: 'Invalid topic provided' });
  }

  try {
    console.log(`🎯 Generating content for topic: "${sanitizedTopic}"`);
    
    // Generate blog content
    const blogContent = await generateBlogContent(sanitizedTopic, sanitizedLength, sanitizedStyle);
    
    // Generate tweet
    const tweetContent = await generateTweet(sanitizedTopic);

    // Extract title from blog content
    const titleMatch = blogContent.match(/^#\s*(.+)$/m);
    const extractedTitle = titleMatch ? titleMatch[1] : `${sanitizedTopic.charAt(0).toUpperCase() + sanitizedTopic.slice(1)}: A Comprehensive Guide`;

    // Calculate metadata
    const wordCount = blogContent.split(' ').length;
    const readingTime = Math.ceil(wordCount / 200);

    return res.status(200).json({
      success: true,
      data: {
        title: extractedTitle,
        content: blogContent,
        tweet: tweetContent,
        metadata: {
          wordCount,
          readingTime,
          topic: sanitizedTopic,
          length: sanitizedLength,
          style: sanitizedStyle,
          generatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Error generating blog content:', error);
    
    // Enhanced error handling
    if (error.message?.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid API key configuration. Please check your Gemini API key.',
        code: 'INVALID_API_KEY'
      });
    }
    
    if (error.message?.includes('quota')) {
      return res.status(429).json({ 
        error: 'API quota exceeded. Please try again later.',
        code: 'QUOTA_EXCEEDED'
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate content. Please try again later.',
      code: 'GENERATION_FAILED',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
