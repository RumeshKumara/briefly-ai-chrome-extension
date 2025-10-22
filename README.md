# Briefly AI - AI-Powered Web Page Summarizer Chrome Extension

![Logo](https://github.com/RumeshKumara/briefly-ai-chrome-extension/blob/main/Thumbnail-1.jpg?raw=true)

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-brightgreen)](https://chromewebstore.google.com/) *(Coming soon!)*  
🚀 **Summarize any web page in one click** using Google's Gemini AI. Fast, clean, and privacy-focused—no data leaves your browser except for API calls.

## 🎯 Overview
Briefly AI is a lightweight Chrome extension that extracts text from the active tab, generates concise AI summaries, and saves your history locally. Choose summary length (short, medium, long) and tone (neutral, concise, detailed, fun) for tailored results. Built with HTML, CSS, JavaScript, and the Gemini API.

### Key Features
- **One-Click Summarization**: Click the extension icon to summarize the current page.
- **Customizable Styles**: Dropdown for length and tone—e.g., "Short & Fun" for quick laughs.
- **History Tab**: View past summaries with URLs and delete options (stored locally).
- **Settings Tab**: Securely input your Gemini API key.
- **Copy & Share**: One-button copy to clipboard.
- **Modern UI**: Clean design with tabs, rounded edges, shadows, and responsive layout.
- **Privacy-First**: No tracking; summaries generated client-side.

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Backend**: Google Gemini API (gemini-pro model)
- **Chrome APIs**: `chrome.tabs`, `chrome.storage`, `chrome.scripting`
- **Manifest**: V3 (service worker-based)
- **No External Libs**: Pure vanilla for speed and minimal bundle size.

## 📦 Installation
### Prerequisites
- Google Chrome browser (v88+)
- A free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey) (sign in with Google account).

### Quick Start (Developer Mode)
1. Clone or download this repo:
   ```
   git clone <your-repo-url> briefly-ai-extension
   cd briefly-ai-extension
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in top-right).
4. Click **Load unpacked** and select the `briefly-ai-extension` folder.
5. Pin the extension icon to your toolbar for easy access.
6. Click the icon → Go to **Settings** tab → Paste your Gemini API key → **Save Key**.

### Production (Chrome Web Store)
- Once tested, zip the folder (exclude this README and dev files).
- Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) ($5 one-time fee).
- Users install via the store link—no API key setup needed if you provide a default (not recommended for privacy).

## 🚀 Usage
1. **Navigate** to any webpage (e.g., a long article).
2. **Click** the Briefly AI icon in your toolbar.
3. **Select** a style from the "Summary Style" dropdown (e.g., "Medium & Concise").
4. **Hit** "Generate Summary ⚡" —wait a few seconds for AI magic.
5. **View** the summary in the output area.
6. **Copy** it with the "Copy Summary" button.
7. **Browse History** tab for past summaries (click URLs to reopen pages).
8. **Tweak Settings** for API key management.

### Example Workflow
- On a news site: Generate a "Short & Neutral" summary → Copy to notes.
- Research paper: "Long & Detailed" for in-depth breakdown.
- Fun read: "Short & Fun" to lighten up dense content.

## 📱 Screenshots
*(Add these to your repo for visuals!)*

- **Popup Overview**:
  ![Popup](https://github.com/RumeshKumara/briefly-ai-chrome-extension/blob/f48964046de20d3c6376a410be019c0bdeee36f6/Summarize-1.jpg)  
  ![Popup](https://github.com/RumeshKumara/briefly-ai-chrome-extension/blob/f48964046de20d3c6376a410be019c0bdeee36f6/Summarize%20-%2002-1.jpg)  
  *Summarize tab with dropdown, button, and output.*

- **History Tab**:
  ![History](https://github.com/RumeshKumara/briefly-ai-chrome-extension/blob/f48964046de20d3c6376a410be019c0bdeee36f6/History-1.jpg)  
  *List of saved summaries with delete options.*

- **Settings Tab**:
  ![Settings](https://github.com/RumeshKumara/briefly-ai-chrome-extension/blob/f48964046de20d3c6376a410be019c0bdeee36f6/Settings-1.jpg)  
  *API key input and save confirmation.*

## 🔧 Development & Customization
### Project Structure
```
briefly-ai-extension/
├── manifest.json      # Extension metadata & permissions
├── popup.html         # Main UI template
├── popup.css          # Styles (modern, responsive)
├── popup.js           # Logic: tabs, API calls, storage
├── background.js      # Service worker for content extraction
└── icons/
    └── icon.png       # 128x128 extension icon
```

### Building Changes
- Edit `popup.html/css/js` for UI tweaks.
- Update `background.js` for better text extraction (e.g., integrate Readability.js via content script).
- Test API prompts in `popup.js`—Gemini handles up to ~5000 chars; adjust limits as needed.
- Debug: Right-click icon → **Inspect popup** or check extension console.

### API Limits
- Free Gemini tier: 15 requests/min, 1M tokens/day.
- For heavy use: Upgrade to paid plan in AI Studio.
- Error Handling: Extension shows friendly messages (e.g., "Check your API key").

## ⚠️ Limitations & Known Issues
- **Content Extraction**: Works best on text-heavy pages; skips dynamic/JS-loaded content or images.
- **Long Pages**: Truncates to 10k chars for extraction, 5k for API to avoid token limits.
- **No Offline Mode**: Requires internet for Gemini calls.
- **Security**: API key stored in local storage (encrypted in future updates?).

## 🤝 Contributing
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-idea`).
3. Commit changes (`git commit -m 'Add amazing idea'`).
4. Push to branch (`git push origin feature/amazing-idea`).
5. Open a Pull Request.

Ideas welcome: Better extraction, more tones, export history to CSV?

## 📄 License
MIT License—use freely, but keep the attribution. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments
- Built with ❤️ using Chrome Extension APIs.
- Powered by [Google Gemini](https://ai.google.dev/).
- Inspired by productivity tools like Pocket and Notion AI.

**Questions?** Open an issue or tweet @yourhandle. Happy summarizing! 📖✨

---

*Last updated: October 22, 2025*
