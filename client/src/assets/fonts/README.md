# Inter Font Files

This directory contains local copies of the Inter font files for improved build reliability.

These files are used to avoid network requests to Google Fonts during build time, which can cause build failures when the network is unreliable.

## Font Files
- Inter-Regular.woff2 - Regular weight (400)
- Inter-Medium.woff2 - Medium weight (500)
- Inter-SemiBold.woff2 - Semi-bold weight (600)
- Inter-Bold.woff2 - Bold weight (700)

## Usage
These fonts are loaded in the `/src/app/layout.tsx` file using Next.js local font loading.
