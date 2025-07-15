# AutoBlog - AI Blog Generator with Automated Twitter Posting

## 🚀 Features

- **AI-Powered Content Generation**: Uses Google's Gemini 2.0 Flash model to create high-quality blog posts
- **Automated Twitter Posting**: Uses Puppeteer to automatically post tweets to Twitter/X
- **Secure Credential Management**: Twitter credentials stored as environment variables
- **Dark/Light Mode**: Beautiful dark and light themes
- **Mobile-First Design**: Responsive design that works perfectly on all devices
- **Simple Interface**: One-click blog creation - just type a topic and go!
- **Multiple Length Options**: Short, medium, or long-form content
- **Writing Style Options**: Casual, professional, or friendly tone
- **Real-time Status Updates**: Live publishing status with Twitter posting confirmation
- **Analytics Dashboard**: Track views and engagement

## 🛠️ Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Next.js API Routes (Vercel Serverless Functions)
- **AI**: Google Gemini 2.0 Flash API
- **Automation**: Puppeteer for Twitter posting
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with dark mode support

## 🏗️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/autoblog-app.git
cd autoblog-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=AIzaSyC4Vf9Wa7o2XIMNlhub6I_7exooMFFKs3A
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app in action!

## 🚀 Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial AutoBlog setup with Twitter automation"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini API key

### 3. Set Environment Variables in Vercel
1. Go to your project dashboard
2. Click "Settings"
3. Click "Environment Variables"
4. Add:
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyC4Vf9Wa7o2XIMNlhub6I_7exooMFFKs3A`

## 🐦 Twitter Setup

### How It Works
1. Users enter their Twitter username and password in the app settings
2. Credentials are securely transmitted to the server for automation
3. Puppeteer logs into Twitter and posts tweets automatically
4. No API keys required - works with regular Twitter accounts

### Twitter Credentials Security
- ✅ Credentials are only used server-side during posting
- ✅ Not stored permanently in database
- ✅ Transmitted securely via HTTPS
- ✅ Used only for automated posting, nothing else

### Setup Steps
1. Open the app and go to **Settings**
2. Enter your Twitter username (with @ or email)
3. Enter your Twitter password
4. Save settings
5. Now when you create blogs, they'll auto-post to Twitter!

## 🎯 How It Works

1. **User Input**: User enters a blog topic and selects preferences
2. **AI Generation**: Gemini AI generates comprehensive blog content and tweet
3. **Preview**: User can preview both blog and tweet before publishing
4. **Publishing**: 
   - Blog content is saved
   - If Twitter is enabled, Puppeteer automatically logs in and posts the tweet
   - Real-time status updates show progress
5. **Success**: User gets confirmation that both blog and tweet are live

## 🔐 Security Features

- **Environment Variables**: API keys stored securely in environment variables
- **Server-Side Processing**: All automation happens server-side
- **HTTPS Transmission**: All data transmitted securely
- **No Data Storage**: Twitter credentials used only during posting session
- **Puppeteer Stealth**: Uses stealth mode to avoid detection

## 🔧 API Endpoints

### POST /api/generate-blog
Generates blog content using Gemini AI
```json
{
  "topic": "how to lose weight",
  "length": "medium",
  "style": "casual"
}
```

### POST /api/post-to-twitter
Posts content to Twitter using Puppeteer automation
```json
{
  "tweetContent": "Your tweet text here",
  "username": "your_twitter_username",
  "password": "your_twitter_password",
  "blogUrl": "https://yourblog.com/post"
}
```

### GET /api/blogs
Retrieves user's blog posts

### POST /api/blogs
Saves a new blog post

## 🚨 Important Notes

### Puppeteer Requirements
- Requires sufficient memory (1024MB recommended for Vercel)
- May take 30-60 seconds to complete Twitter posting
- Works best with headless browser mode in production

### Twitter Account Safety
- Use app-specific passwords if you have 2FA enabled
- Consider using a dedicated account for automation
- Twitter may occasionally require additional verification

### Rate Limiting
- Twitter has posting limits (300 tweets per 3 hours)
- The app includes delays to avoid triggering anti-bot measures
- Failed posts will show error messages with details

## 🐛 Troubleshooting

### Common Issues

**"Could not find username input field"**
- Twitter login page structure changed
- Usually resolves after Twitter updates their interface

**"Post button not enabled"**
- Text may be too long (280 character limit)
- Twitter may require additional verification

**"Failed to post tweet"**
- Check Twitter credentials in settings
- Ensure account doesn't have restrictions
- Try again in a few minutes

### Debug Mode
For development, set `headless: false` in `api/post-to-twitter.js` to see the browser automation in action.

## 🌟 Features in Detail

### AI Blog Generation
- **Smart Prompting**: Optimized prompts for different writing styles
- **SEO Optimization**: Content structured for search engines
- **Customizable Length**: 300-2500 words based on user preference
- **Topic Flexibility**: Works with any topic or niche

### Twitter Automation
- **Smart Login**: Handles various Twitter login scenarios
- **Anti-Detection**: Uses stealth mode and human-like behavior
- **Error Recovery**: Multiple fallback methods for reliable posting
- **Real-time Feedback**: Shows posting progress to users

### User Experience
- **One-Click Publishing**: Type topic → Generate → Publish
- **Visual Feedback**: Real-time status updates during publishing
- **Dark Mode**: Beautiful themes for day and night use
- **Mobile Responsive**: Works perfectly on all devices

## 🔮 Future Enhancements

- **Database Integration**: Store blogs permanently
- **User Authentication**: Personal accounts and blog management
- **Scheduled Posting**: Queue tweets for optimal timing
- **Multi-Platform**: LinkedIn, Facebook integration
- **Image Generation**: AI-generated featured images
- **Analytics**: Detailed engagement tracking
- **Template System**: Reusable blog templates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚖️ Legal Disclaimer

This tool automates Twitter posting using browser automation. Users are responsible for:
- Complying with Twitter's Terms of Service
- Not using the tool for spam or malicious purposes
- Ensuring their content follows Twitter's community guidelines
- Using their own legitimate Twitter accounts

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

### Twitter Issues
- Verify your username and password are correct
- Check if your account has any restrictions
- Try posting manually first to ensure account is working

### Technical Issues
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed (`npm install`)

### Getting Help
1. Check the [Issues](https://github.com/yourusername/autoblog-app/issues) page
2. Create a new issue with:
   - Detailed description of the problem
   - Error messages (if any)
   - Steps to reproduce
   - Your environment details

## 🙏 Acknowledgments

- Google Gemini 2.0 Flash for AI-powered content generation
- Puppeteer team for browser automation capabilities
- Vercel for seamless deployment and hosting
- React and Next.js community for excellent documentation
- Tailwind CSS for beautiful, responsive styling

---

**Made with ❤️ for content creators who want to automate their blogging and social media workflow**

## 🚀 Quick Start Commands

```bash
# Setup
git clone https://github.com/yourusername/autoblog-app.git
cd autoblog-app
npm install

# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Live Demo**: `https://autoblog-app-yourusername.vercel.app`
