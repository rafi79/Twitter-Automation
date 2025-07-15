module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  switch (req.method) {
    case 'GET':
      // Return user's blogs (in production, you'd fetch from database)
      return res.status(200).json({
        success: true,
        data: [
          { id: 1, title: "How to Lose Weight Fast", views: 45, likes: 12, published: true, createdAt: new Date().toISOString() },
          { id: 2, title: "Best Coffee Shops", views: 23, likes: 5, published: true, createdAt: new Date().toISOString() },
          { id: 3, title: "Weekend Activities", views: 67, likes: 18, published: true, createdAt: new Date().toISOString() }
        ]
      });

    case 'POST':
      // Save new blog (in production, you'd save to database)
      const { title, content, tweet } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const newBlog = {
        id: Date.now(),
        title,
        content,
        tweet,
        views: 0,
        likes: 0,
        published: true,
        createdAt: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        data: newBlog
      });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};
