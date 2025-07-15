const { GoogleGenerativeAI } = require('@google/generative-ai');

// Secure API key retrieval with fallbacks
function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY || 
                 process.env.GOOGLE_AI_API_KEY || 
                 process.env.GENERATIVE_AI_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found in environment variables');
  }
  
  return apiKey;
}

// Initialize Gemini AI with error handling
function initializeGemini() {
  try {
    const apiKey = getGeminiApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw error;
  }
}

// Sanitize user input
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/script/gi, '') // Remove script tags
    .slice(0, 1000); // Limit length
}

module.exports = async function handler(req, res) {
  // Enhanced CORS and security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    
    // Initialize Gemini model
    const model = initializeGemini();
    
    // Create detailed prompt based on user preferences
    const wordCount = sanitizedLength === 'short' ? '300-500' : 
                     sanitizedLength === 'medium' ? '800-1200' : '1500-2500';
    
    const toneInstruction = sanitizedStyle === 'professional' ? 'professional and authoritative' : 
                           sanitizedStyle === 'friendly' ? 'friendly and conversational' : 
                           'casual and engaging';

    const blogPrompt = `Write a comprehensive blog post about "${sanitizedTopic}".

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

Format the output as a well-structured blog post with proper markdown formatting.`;

    // Generate blog content
    const blogResult = await model.generateContent(blogPrompt);
    const blogContent = blogResult.response.text();

    // Generate Twitter-friendly summary
    const tweetPrompt = `Create a Twitter-friendly promotional tweet for a blog post about "${sanitizedTopic}".

Requirements:
- Maximum 280 characters (very important!)
- Include relevant hashtags (2-3 maximum)
- Be engaging and clickbait-worthy
- Include emojis strategically
- End with a call to action to read the blog
- Include [LINK] where the link should go
- Make it shareable and likely to get engagement

Create a tweet that will make people want to click and read the full blog post.`;

    const tweetResult = await model.generateContent(tweetPrompt);
    const tweetContent = tweetResult.response.text().replace(/"/g, '').trim();

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
};
