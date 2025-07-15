import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, length, style } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    // Initialize Gemini AI with environment variable
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create detailed prompt based on user preferences
    const wordCount = length === 'short' ? '300-500' : length === 'medium' ? '800-1200' : '1500-2500';
    const toneInstruction = style === 'professional' ? 'professional and authoritative' : 
                           style === 'friendly' ? 'friendly and conversational' : 
                           'casual and engaging';

    const prompt = `Write a comprehensive blog post about "${topic}".

Requirements:
- Length: ${wordCount} words
- Tone: ${toneInstruction}
- Include a catchy title
- Structure with clear headings and subheadings
- Include practical tips and actionable advice
- Add a compelling introduction and conclusion
- Optimize for SEO and engagement
- Include a call-to-action at the end

Format the output as a well-structured blog post with proper markdown formatting.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const blogContent = result.response.text();

    // Generate a Twitter-friendly summary
    const tweetPrompt = `Create a Twitter-friendly promotional tweet for a blog post about "${topic}". 
    
    Requirements:
    - Maximum 280 characters
    - Include relevant hashtags
    - Be engaging and clickbait-worthy
    - Include emojis
    - End with a call to action to read the blog
    
    Do not include the actual link - just write [LINK] where the link would go.`;

    const tweetResult = await model.generateContent(tweetPrompt);
    const tweetContent = tweetResult.response.text();

    // Extract title from blog content (first line after removing # symbols)
    const titleMatch = blogContent.match(/^#\s*(.+)$/m);
    const extractedTitle = titleMatch ? titleMatch[1] : `${topic.charAt(0).toUpperCase() + topic.slice(1)}: A Comprehensive Guide`;

    return res.status(200).json({
      success: true,
      data: {
        title: extractedTitle,
        content: blogContent,
        tweet: tweetContent.replace(/"/g, '').trim(),
        metadata: {
          wordCount: blogContent.split(' ').length,
          readingTime: Math.ceil(blogContent.split(' ').length / 200),
          topic,
          length,
          style
        }
      }
    });

  } catch (error) {
    console.error('Error generating blog content:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your Gemini API key configuration.' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate content. Please try again later.',
      details: error.message 
    });
  }
}
