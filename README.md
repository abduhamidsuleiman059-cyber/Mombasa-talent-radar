# Mombasa Talent Radar

This project now includes a simple backend server for the frontend pages.

## Setup

1. Install Node.js and npm on your machine.
2. Open a terminal in `Mombasa-talent-radar`.
3. Run:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Available endpoints

- `GET /api/videos` - returns video items stored in the backend
- `GET /api/talents` - returns all talent entries stored in the backend
- `POST /api/talents` - uploads a new talent entry with optional photo, voice, and video files

- `GET /admin.html` - load the admin page for viewing talent entries

## Notes

- Static frontend files are served from the project root.
- Uploaded media files are saved into `uploads/`.
- Talent metadata is stored in `data/talents.json`.
- The frontend pages already use `/api/videos` and `/api/talents`.
