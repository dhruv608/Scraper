# 🌟 Multi-Platform Scraper API

A powerful web scraping API that extracts coding profile data from multiple platforms including LeetCode and GeeksforGeeks (GFG).

## 🚀 Features

- **Multi-Platform Support**: LeetCode & GFG profile scraping
- **Real-time Data**: Extracts total solved problems and recent submissions
- **Intelligent Caching**: 10-minute in-memory cache for performance
- **Error Handling**: Proper HTTP status codes and error messages
- **Clean Architecture**: Separated concerns with modular structure
- **Fast Performance**: First request ~60s, cached requests ~0.1s

## 📋 Platforms Supported

### 🟦 LeetCode
- **Profile URL**: `https://leetcode.com/u/{username}/`
- **Data Extracted**:
  - Total solved count
  - Recent AC problems (unlimited)
  - Problem names only (no timestamps)
- **Endpoint**: `GET /api/leetcode/:username`

### 🟩 GeeksforGeeks (GFG)
- **Profile URL**: `https://www.geeksforgeeks.org/user/{username}/`
- **Data Extracted**:
  - Total problems by difficulty (SCHOOL, BASIC, EASY, MEDIUM, HARD)
  - Problem names with URLs
- **Endpoint**: `GET /api/gfg/:username`

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Steps
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scraper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   # OR
   node src/server.js
   ```

### Environment Variables
- `PORT`: Server port (default: 3000)

## 📡 API Usage

### Base URL
```
http://localhost:3000
```

### Endpoints

#### LeetCode
```bash
# Get user profile
curl http://localhost:3000/api/leetcode/dhruv608

# Example response
{
  "username": "dhruv608",
  "platform": "leetcode",
  "totalSolved": 197,
  "recentSolved": [
    "Word Search",
    "Subsets II",
    "Generate Parentheses",
    "House Robber",
    "Perfect Squares",
    "Climbing Stairs",
    "Fibonacci Number",
    "Subsets",
    "Combination Sum",
    "Minimum Replacements to Sort Array",
    "Earliest Possible Day of Full Bloom",
    "Ugly Number II",
    "Relative Ranks",
    "Top K Frequent Elements",
    "Kth Largest Element in an Array"
  ]
}
```

#### GeeksforGeeks
```bash
# Get user profile
curl http://localhost:3000/api/gfg/dhruv608

# Example response
{
  "username": "striver",
  "platform": "gfg",
  "totalSolved": 260,
  "problems": {
    "school": [],
    "basic": [
      {
        "title": "Length of Linked List",
        "url": "https://www.geeksforgeeks.org/problems/length-of-linked-list",
        "difficulty": "Basic"
      }
    ],
    "easy": [...],
    "medium": [...],
    "hard": [...]
  }
}
```

### Health Check
```bash
curl http://localhost:3000/health
```

## 🏗️ Project Structure

```
scraper/
├── src/
│   ├── routes/
│   │   ├── gfgRoutes.js          # GFG API endpoints
│   │   └── leetcodeRoutes.js      # LeetCode API endpoints
│   ├── scrapers/
│   │   ├── gfgScraper.js          # GFG scraping logic
│   │   └── leetcodeScraper.js      # LeetCode scraping logic
│   ├── services/
│   │   └── browser.js              # Puppeteer browser management
│   └── server.js                   # Main server file
├── README.md                         # This file
├── .gitignore                        # Git ignore file
└── package.json                      # Node.js dependencies
```

## 🔧 Configuration

### Browser Settings
- **Headless Mode**: Enabled for server deployment
- **Viewport**: 1920x1080 (desktop)
- **Timeouts**: 45 seconds for navigation and page operations
- **Pool Size**: 2 browser instances

### Cache Settings
- **Type**: In-memory Map
- **TTL**: 10 minutes (600,000ms)
- **Auto-cleanup**: Enabled

## 🚨 Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad request (missing username)
- `404`: Profile not found
- `500`: Scraping failed
- `504`: Request timeout

### Error Response Format
```json
{
  "error": "Error type",
  "message": "Human-readable description"
}
```

## 🎯 Technical Details

### Scraping Technology
- **Puppeteer**: Headless Chrome automation
- **Dynamic Content**: Waits for React hydration
- **Smart Scrolling**: Loads all content on infinite scroll pages
- **Text Anchors**: Uses DOM text patterns instead of CSS classes

### Data Extraction Strategy
- **LeetCode**: Targets `/submissions/detail/` links in "Recent AC" section
- **GFG**: Targets problem list sections by difficulty categories
- **Cleaning**: Removes timestamps, duplicates, and UI elements

## 🔄 Development

### Scripts
```bash
# Start development server
npm start

# Start with auto-restart (development)
npm run dev

# Start production server with scaling
npm run start:production
```

### Example Usage Scripts

#### Continuous Monitoring
```bash
# Run continuous monitoring (fetches every minute)
node examples/continuous-fetch.js
```

#### Batch Processing
```bash
# Fetch multiple users sequentially
node examples/batch-fetch.js
```

### Environment
- **Development**: Default settings
- **Production**: Set `NODE_ENV=production`
- **Browser Pool Size**: Set `BROWSER_POOL_SIZE=4` (default: 2)
- **Rate Limit**: Set `RATE_LIMIT_MAX=200` (default: 100)

## 📝 Logging

The application provides comprehensive logging:
- 🚀 Server startup messages
- 🔍 Scraping progress
- ✅ Success confirmations
- ❌ Error details
- 🚀 Cache hit notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open-source and available under the MIT License.

## 🆘 Support

For issues, questions, or contributions:
- Create an issue in the repository
- Check existing issues before creating new ones

---

**Built with ❤️ for the coding community**
