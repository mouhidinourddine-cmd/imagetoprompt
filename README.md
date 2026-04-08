# Image to Prompt — AI Image Analyzer

A full-stack web app that uses Claude AI (claude-sonnet-4-6) to analyze images and generate descriptions, captions, OCR text, or custom answers.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API key
```bash
cp .env.example .env
```
Open `.env` and replace `your_key_here` with your Anthropic API key from https://console.anthropic.com

### 3. Run the server
```bash
node server.js
```

### 4. Open the app
Visit http://localhost:3000

---

## Features
- **Upload image** (drag & drop or click) or **paste an image URL**
- Four analysis modes: Describe, Caption, Extract Text, Custom question
- Quick prompt pills: Objects, Colors, Mood, Alt text, AI Prompt
- Copy result to clipboard
- Responsive design (mobile friendly)

## Tech Stack
- **Frontend:** Vanilla HTML/CSS/JS
- **Backend:** Node.js + Express
- **AI:** Anthropic Claude claude-sonnet-4-6 (vision)
