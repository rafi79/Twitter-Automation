module.exports = async function handler(req, res) {
  // Only allow in development or with special header
  if (process.env.NODE_ENV === 'production' && req.headers['x-debug-key'] !== 'debug123') {
    return res.status(403).json({ error: 'Debug endpoint not accessible' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  return res.status(200).json({
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'Not found',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('API')),
    nodeEnv: process.env.NODE_ENV
  });
};
