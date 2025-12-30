# MacOS OmniScanner

A sleek, macOS-inspired barcode and QR code scanner powered by Google Gemini for intelligent product and content analysis. This web application combines a desktop-class UI with powerful AI capabilities to decode and explain the world around you.

## Features

- **MacOS Aesthetic**: Beautiful glassmorphism UI, interactive dock animations, and window management style.
- **Intelligent Analysis**: Uses Google Gemini (Flash model) to analyze scanned data:
  - Identifies products from UPC/EAN codes.
  - Summarizes text content.
  - Explains URL destinations and safety.
  - Decodes WiFi configurations.
- **Universal Scanner**: Supports QR codes, UPC-A, EAN-13, Code 128, and more via the native `BarcodeDetector` API.
- **History Tracking**: Keeps a session history of scanned items with rich AI-generated insights.
- **Audio Feedback**: Subtle, pleasant sound effects upon successful scans.

## Prerequisites

- **Modern Browser**: Chrome, Edge, or Opera (browsers supporting the `BarcodeDetector` API are recommended). Firefox may require flag enablement or polyfills.
- **Google Gemini API Key**: Required for the AI analysis features. Get one for free at [Google AI Studio](https://aistudio.google.com/).

## Installation & Setup

### 1. Download the Code
Clone this repository or download the source files to your local machine.

### 2. Configure API Key
The application uses the Gemini API to analyze scans. The code references `process.env.API_KEY`.

- **Cloud/Sandboxes (StackBlitz, Replit, etc.)**: Add `API_KEY` to your project's secret/environment variables.
- **Local Development**:
  - If using a bundler (Vite, Parcel), create a `.env` file and use the appropriate prefix (e.g., `VITE_API_KEY`).
  - **Quick Test**: You can temporarily paste your key directly into `services/geminiService.ts` in place of `process.env.API_KEY` (do not commit this to public version control).

### 3. Run the Application
Because this project uses ES Modules and requires Camera permissions, it **must** be served over a local web server (localhost) or HTTPS. You cannot simply open `index.html` via double-click.

**Using Python:**
```bash
# Run this command in the project root directory
python3 -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

**Using Node.js (http-server):**
```bash
npx http-server .
```

## Usage

1. **Grant Permissions**: Upon loading, the app will request Camera access. Click "Allow".
2. **Scan a Code**:
   - Hold a barcode or QR code in front of the camera.
   - Align it within the blue brackets.
   - The app will beep and highlight the code when detected.
3. **Manual Entry**:
   - If your environment doesn't support the camera, type the barcode number or content into the input field at the bottom of the scanner window and click "Scan".
4. **View Results**:
   - The right-hand panel ("History") displays scanned items.
   - Wait a moment for "Thinking..." to resolve into a detailed AI analysis of the item.

## Troubleshooting

- **"Camera access denied"**: Ensure your browser has permission to use the camera and the site is served over HTTPS or localhost.
- **"Browser does not support BarcodeDetector"**: Try using Google Chrome or Microsoft Edge. Alternatively, use the Manual Entry feature.

## Technologies

- React 19
- Tailwind CSS
- Google Gemini API (`@google/genai`)
- Lucide React (Icons)
