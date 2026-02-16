# Frontend - Cloud Storage

This is the React + TypeScript + Tailwind CSS v4 version of the Cloud Storage frontend.

## Setup

1.  `npm install`
2.  `npm run dev` to start the development server.
3.  Open `http://localhost:5173` (or port shown).

## Build

To build for production:
`npm run build`

The output will be in `dist/`.

## Backend Integration

The backend runs on `http://localhost:5000`.
The frontend sends requests to this URL (configured in `src/api.ts`).

## Notes

- Uses Firebase v10 (Modular SDK).
- Uses React Router v6.
- Uses Tailwind CSS v4 (via `@tailwindcss/vite`).
