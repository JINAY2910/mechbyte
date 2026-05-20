# MechByte

A premium mechanical keyboard typing speed test. Built with Next.js, Framer Motion, Web Audio API, and Zustand.

## Features

- Real-time WPM and accuracy tracking
- Interactive 75% keyboard visualization with spring animations
- Procedural mechanical switch sounds (linear, tactile, clicky, thock)
- Crimson RGB underglow and ambient lighting
- Test modes: time, words, quote, zen
- Difficulty presets, punctuation, and numbers toggles
- Session results with WPM chart and key heatmap
- Settings drawer with audio, display, and effect controls
- Local storage persistence
- Mobile Responsiveness: Fully responsive layout with custom viewport shifting to keep typing content above soft keyboards, and a collapsible configuration pill.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Mobile Testing

To test the application on a mobile device within the same Wi-Fi network:

1. Find your computer's local IP address (e.g., `192.168.1.45`).
2. Run the development server:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```
3. Open `http://<your-computer-ip>:3000` on your mobile browser.

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `npm run dev` | Development server       |
| `npm run build` | Production build       |
| `npm start`   | Serve production build   |

## Tech Stack

- Next.js 15 + React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Zustand
- Recharts
- Web Audio API

## License

This project is licensed under the [MIT License](LICENSE).
