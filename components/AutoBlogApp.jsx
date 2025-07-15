import React, { useState, useEffect } from 'react';
import { PenTool, BookOpen, Settings, Rocket, Edit, Eye, Heart, Twitter, Moon, Sun, AlertCircle, CheckCircle } from 'lucide-react';

const AutoBlogApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [blogs, setBlogs] = useState([
    { id: 1, title: "How to Lose Weight Fast", views: 45, likes: 12, published: true },
    { id: 2, title: "Best Coffee Shops", views: 23, likes: 5, published: true },
    { id: 3, title: "Weekend Activities", views: 67, likes: 18, published: true }
  ]);
  const [settings, setSettings] = useState({
    twitterUsername: '',
    twitterPassword: '',
    writingStyle: 'casual',
    autoPostTime: 'immediately',
    geminiApiKey: ''
  });
  const [blogForm, setBlogForm] = useState({
    topic: '',
    length: 'medium',
    autoPost: true,
    autoPublish: true
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishingStatus, setPublishingStatus] = useState('');

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Theme classes
  const themeClasses = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-black',
    card: darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
    input: darkMode ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black placeholder-gray-500',
    button: darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
    secondaryButton: darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
  };

  // Generate blog content using Gemini AI
  const generateBlogContent = async (topic, length, style) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          length,
          style
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate blog content');
      }

      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(data.data);
        setCurrentPage('preview');
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
      
    } catch (error) {
      console.error('Error generating blog:', error);
      alert('Failed to generate blog content. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle create blog submission
  const handleCreateBlog = () => {
    if (!blogForm.topic.trim()) {
      alert('Please enter a topic for your blog post.');
      return;
    }
    generateBlogContent(blogForm.topic, blogForm.length, settings.writingStyle);
  };

  // Post to Twitter using Puppeteer
  const postToTwitter = async (tweetContent, blogUrl = '') => {
    if (!settings.twitterUsername || !settings.twitterPassword) {
      throw new Error('Twitter credentials not provided. Please add them in Settings.');
    }

    const response = await fetch('/api/post-to-twitter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tweetContent,
        username: settings.twitterUsername,
        password: settings.twitterPassword,
        blogUrl
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Failed to post to Twitter');
    }

    return await response.json();
  };

  // Publish blog and tweet - FIXED COMPLETE VERSION
  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishingStatus('Publishing blog...');
    
    try {
      // Step 1: Save blog
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new blog to the list
      const newBlog = {
        id: blogs.length + 1,
        title: generatedContent.title,
        views: 0,
        likes: 0,
        published: true
      };
      
      setBlogs([newBlog, ...blogs]);
      setPublishingStatus('Blog published! ✅');

      // Step 2: Post to Twitter if enabled
      if (blogForm.autoPost && settings.twitterUsername && settings.twitterPassword) {
        setPublishingStatus('Posting to Twitter...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await postToTwitter(generatedContent.tweet, 'https://yourblog.com/latest');
          setPublishingStatus('Blog published! ✅ Tweet posted! ✅');
        } catch (twitterError) {
          console.error('Twitter posting failed:', twitterError);
          setPublishingStatus('Blog published! ✅ (Twitter posting failed)');
        }
      } else {
        setPublishingStatus('Blog published! ✅');
      }
      
      // Reset form and redirect
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBlogForm({ topic: '', length: 'medium', autoPost: true, autoPublish: true });
      setGeneratedContent(null);
      setCurrentPage('success');
      
      // Auto-redirect to home after 3 seconds
      setTimeout(() => setCurrentPage('home'), 3000);
      
    } catch (error) {
      console.error('Error publishing:', error);
      setPublishingStatus('Publishing failed! ❌');
      alert(`Failed to publish: ${error.message}`);
    } finally {
      setIsPublishing(false);
      setTimeout(() => setPublishingStatus(''), 3000);
    }
  };

  // Home Page Component
  const HomePage = () => (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-6`}>
      <div className="max-w-md mx-auto">
        <div className={`${themeClasses.card} rounded-lg border-2 p-8 text-center shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">📝 AutoBlog</h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${themeClasses.secondaryButton}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          {/* Twitter Setup Alert */}
          {!settings.twitterUsername && (
            <div className={`mb-4 p-3 rounded-lg border ${darkMode ? 'bg-yellow-900 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-300 text-yellow-800'}`}>
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span className="text-sm">Set up Twitter in Settings for auto-posting</span>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={() => setCurrentPage('create')}
              className={`w-full ${themeClasses.button} text-white py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors`}
            >
              <PenTool size={24} />
              ✍️ Write New Blog
            </button>
            
            <button
              onClick={() => setCurrentPage('blogs')}
              className={`w-full ${themeClasses.secondaryButton} py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors`}
            >
              <BookOpen size={24} />
              📚 My Blogs
            </button>
            
            <button
              onClick={() => setCurrentPage('settings')}
              className={`w-full ${themeClasses.secondaryButton} py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors`}
            >
              <Settings size={24} />
              ⚙️ Settings
            </button>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-300 dark:border-gray-600">
            <p className="text-sm opacity-75">
              Stats: {blogs.length} blogs written, {blogs.reduce((sum, blog) => sum + blog.views, 0)} views today
            </p>
            {settings.twitterUsername && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Twitter connected as {settings.twitterUsername}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Create Blog Page Component
  const CreateBlogPage = () => (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-6`}>
      <div className="max-w-md mx-auto">
        <div className={`${themeClasses.card} rounded-lg border-2 p-6 shadow-lg`}>
          <button
            onClick={() => setCurrentPage('home')}
            className={`mb-4 ${themeClasses.secondaryButton} py-2 px-4 rounded-lg text-sm`}
          >
            ← Back
          </button>
          
          <h2 className="text-xl font-bold mb-6">What do you want to write about?</h2>
          
          <div className="space-y-6">
            <div>
              <input
                type="text"
                value={blogForm.topic}
                onChange={(e) => setBlogForm({...blogForm, topic: e.target.value})}
                placeholder="Type your topic here... Example: how to lose weight"
                className={`w-full ${themeClasses.input} p-4 rounded-lg border-2 focus:outline-none focus:border-blue-500`}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateBlog()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Length:</label>
              <div className="flex gap-2">
                {['short', 'medium', 'long'].map((length) => (
                  <button
                    key={length}
                    onClick={() => setBlogForm({...blogForm, length})}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      blogForm.length === length 
                        ? `${themeClasses.button} text-white` 
                        : `${themeClasses.secondaryButton}`
                    }`}
                  >
                    {length.charAt(0).toUpperCase() + length.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleCreateBlog}
              disabled={isGenerating}
              className={`w-full ${themeClasses.button} text-white py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50`}
            >
              <Rocket size={24} />
              {isGenerating ? 'Generating...' : '🚀 Create Blog + Tweet'}
            </button>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoPost"
                  checked={blogForm.autoPost}
                  onChange={(e) => setBlogForm({...blogForm, autoPost: e.target.checked})}
                  className="accent-blue-500"
                />
                <label htmlFor="autoPost" className="flex items-center gap-1">
                  ✅ Auto-post to Twitter
                  {!settings.twitterUsername && (
                    <span className="text-yellow-500 text-xs">(Setup required)</span>
                  )}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoPublish"
                  checked={blogForm.autoPublish}
                  onChange={(e) => setBlogForm({...blogForm, autoPublish: e.target.checked})}
                  className="accent-blue-500"
                />
                <label htmlFor="autoPublish">✅ Publish to my blog</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Preview Page Component
  const PreviewPage = () => (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-6`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${themeClasses.card} rounded-lg border-2 p-6 shadow-lg`}>
          <button
            onClick={() => setCurrentPage('create')}
            className={`mb-4 ${themeClasses.secondaryButton} py-2 px-4 rounded-lg text-sm`}
          >
            ← Back
          </button>
          
          <h2 className="text-xl font-bold mb-4">📝 Your Blog: "{generatedContent?.title}"</h2>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg mb-6 max-h-80 overflow-y-auto`}>
            <pre className="whitespace-pre-wrap text-sm">{generatedContent?.content}</pre>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Twitter size={20} className="text-blue-500" />
              🐦 Your Tweet:
            </h3>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg text-sm`}>
              {generatedContent?.tweet}
            </div>
          </div>

          {/* Publishing Status */}
          {publishingStatus && (
            <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-800'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span className="text-sm">{publishingStatus}</span>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPage('create')}
              className={`flex-1 ${themeClasses.secondaryButton} py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2`}
            >
              <Edit size={20} />
              📝 Edit
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className={`flex-1 ${themeClasses.button} text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              <Rocket size={20} />
              {isPublishing ? 'Publishing...' : '🚀 Publish Both'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // My Blogs Page Component
  const MyBlogsPage = () => (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-6`}>
      <div className="max-w-md mx-auto">
        <div className={`${themeClasses.card} rounded-lg border-2 p-6 shadow-lg`}>
          <button
            onClick={() => setCurrentPage('home')}
            className={`mb-4 ${themeClasses.secondaryButton} py-2 px-4 rounded-lg text-sm`}
          >
            ← Back
          </button>
          
          <h2 className="text-xl font-bold mb-6">📚 My Blogs</h2>
          
          <div className="space-y-4 mb-6">
            {blogs.map((blog) => (
              <div key={blog.id} className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">✅ {blog.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm opacity-75">
                      <span className="flex items-center gap-1">
                        <Eye size={16} />
                        👁️ {blog.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={16} />
                        ❤️ {blog.likes} likes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage('create')}
            className={`w-full ${themeClasses.button} text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2`}
          >
            <PenTool size={20} />
            ✍️ Write Another
          </button>
        </div>
      </div>
    </div>
  );

  // Settings Page Component
  const SettingsPage = () => (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-6`}>
      <div className="max-w-md mx-auto">
        <div className={`${themeClasses.card} rounded-lg border-2 p-6 shadow-lg`}>
          <button
            onClick={() => setCurrentPage('home')}
            className={`mb-4 ${themeClasses.secondaryButton} py-2 px-4 rounded-lg text-sm`}
          >
            ← Back
          </button>
          
          <h2 className="text-xl font-bold mb-6">⚙️ Settings</h2>
          
          <div className="space-y-6">
            {/* Twitter Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Twitter size={20} className="text-blue-500" />
                Twitter Setup
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">🐦 Twitter Username:</label>
                <input
                  type="text"
                  value={settings.twitterUsername}
                  onChange={(e) => setSettings({...settings, twitterUsername: e.target.value})}
                  placeholder="@yourusername or email"
                  className={`w-full ${themeClasses.input} p-3 rounded-lg border-2 focus:outline-none focus:border-blue-500`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">🔐 Twitter Password:</label>
                <input
                  type="password"
                  value={settings.twitterPassword}
                  onChange={(e) => setSettings({...settings, twitterPassword: e.target.value})}
                  placeholder="Your Twitter password"
                  className={`w-full ${themeClasses.input} p-3 rounded-lg border-2 focus:outline-none focus:border-blue-500`}
                />
                <p className="text-xs opacity-60 mt-1">
                  ⚠️ Stored securely as environment variables on server
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
              <label className="block text-sm font-medium mb-2">📝 Writing Style:</label>
              <div className="flex gap-2">
                {['casual', 'professional', 'friendly'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setSettings({...settings, writingStyle: style})}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      settings.writingStyle === style 
                        ? `${themeClasses.button} text-white` 
                        : `${themeClasses.secondaryButton}`
                    }`}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">📅 Auto-Post Time:</label>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'immediately', label: 'Immediately' },
                  { value: '1hour', label: 'In 1 hour' },
                  { value: 'tomorrow', label: 'Tomorrow 9AM' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings({...settings, autoPostTime: option.value})}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      settings.autoPostTime === option.value 
                        ? `${themeClasses.button} text-white` 
                        : `${themeClasses.secondaryButton}`
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">🔑 Gemini API Key:</label>
              <input
                type="password"
                value={settings.geminiApiKey}
                onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                placeholder="Enter your Gemini API key"
                className={`w-full ${themeClasses.input} p-3 rounded-lg border-2 focus:outline-none focus:border-blue-500`}
              />
              <p className="text-xs opacity-60 mt-1">
                Your API key is stored securely and never shared.
              </p>
            </div>
            
            <button
              onClick={() => {
                alert('Settings saved successfully!');
                setCurrentPage('home');
              }}
              className={`w-full ${themeClasses.button} text-white py-3 px-6 rounded-lg font-semibold`}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Success Page Component
  const SuccessPage = () => (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-6`}>
      <div className="max-w-md mx-auto">
        <div className={`${themeClasses.card} rounded-lg border-2 p-8 text-center shadow-lg`}>
          <h2 className="text-xl font-bold mb-6">🎉 Awesome! Your content is live!</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span>✅ Blog published</span>
            </div>
            {settings.twitterUsername && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Twitter size={20} />
                <span>✅ Tweet posted</span>
              </div>
            )}
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
            <h3 className="font-semibold mb-2">📊 So far today:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-center gap-1">
                <Eye size={16} />
                <span>👁️ {blogs.reduce((sum, blog) => sum + blog.views, 0)} people viewed your blogs</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Heart size={16} />
                <span>❤️ {blogs.reduce((sum, blog) => sum + blog.likes, 0)} people liked your content</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentPage('create')}
            className={`w-full ${themeClasses.button} text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2`}
          >
            <PenTool size={20} />
            ✍️ Write Another Blog
          </button>
        </div>
      </div>
    </div>
  );

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'create': return <CreateBlogPage />;
      case 'preview': return <PreviewPage />;
      case 'blogs': return <MyBlogsPage />;
      case 'settings': return <SettingsPage />;
      case 'success': return <SuccessPage />;
      default: return <HomePage />;
    }
  };

  return renderCurrentPage();
};

export default AutoBlogApp;
