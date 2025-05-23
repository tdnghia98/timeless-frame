# Wed Memory - Event Photo Sharing App

## Overview
This is the MVP version of an event photo-sharing app built with Next.js (TypeScript). The app includes:
- Google Drive integration for automatic storage.
- Event creation with customizable album titles, descriptions, and themes.
- Guest uploads via unique URLs or QR codes.

## Features
- **Google Drive Integration**: Secure OAuth2 login and file storage.
- **Event Creation**: Create and manage events with ease.
- **Guest Sharing**: Share event links or QR codes for uploads.
- **Real-Time Album**: Display uploaded content in a responsive gallery.

## Getting Started
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `src/`: Contains the main application code.
- `.github/`: Includes Copilot instructions for AI-generated code.
## Environment

To securely store Google refresh tokens, you must set the environment variable `REFRESH_TOKEN_ENCRYPTION_KEY` to a strong, random 32-character string (256 bits).

How to generate a key on macOS/Linux:

Open your terminal and run:

```openssl rand -base64 32 | cut -c1-32```

Copy the output and add it to your .env.local file:

Important:

The key must be exactly 32 characters.
Never commit this key to version control.
If you change this key, all previously encrypted tokens will become unreadable.
Your app will now use this key to encrypt and decrypt refresh tokens securely.

## License
This project is licensed under the MIT License.