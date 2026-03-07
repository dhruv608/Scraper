# 🆓 Simple GFG Scraper

A free, simple web scraper for GeeksforGeeks profiles. Perfect for single-user usage.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the service
npm start
```

## 📖 Usage

```bash
# Get GFG profile data
curl http://localhost:3000/gfg/striver

# Health check
curl http://localhost:3000/health

# Service info
curl http://localhost:3000/
```

## ⚡ Performance

- **First Request**: ~60 seconds (scrapes GFG)
- **Cached Requests**: ~0.1 seconds (instant!)
- **Cache Duration**: 10 minutes
- **Memory Usage**: ~50MB

## 📊 Example Response

```json
{
  "username": "striver",
  "platform": "gfg",
  "totalSolved": 260,
  "problems": {
    "basic": [
      {
        "title": "Length of Linked List",
        "url": "https://www.geeksforgeeks.org/problems/count-nodes-of-linked-list/0",
        "difficulty": "basic"
      }
    ],
    "easy": [...],
    "medium": [...],
    "hard": [...]
  }
}
```

## 📁 Project Structure

```
scraper/
├── src/
│   ├── server-simple.js      # Main server
│   ├── scrapers/
│   │   └── gfgScraper.js    # Scraping logic
│   └── services/
│       └── browser.js       # Browser management
├── package.json             # Dependencies
└── README.md               # This file
```

## 🌐 Free Deployment

Perfect for:
- Local development
- School servers
- Free Node.js hosting (Heroku, Railway, Render)

## 💡 Features

✅ Zero external dependencies  
✅ In-memory caching  
✅ Single-user optimized  
✅ No costs involved  
✅ Simple setup  

## 🎯 API Endpoints

- `GET /gfg/:username` - Get profile data
- `GET /health` - Health check
- `GET /` - Service information

That's it! Your free GFG scraper is ready to use.
