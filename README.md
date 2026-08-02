## 映跡 EISEKI

> 映画とドラマ、その次の一本へ。

映跡 (EISEKI) is a dynamic movie and TV website built with Next.js 16 and powered by the TMDB API. It combines a responsive streaming-style interface with localized content and detail pages that adapt their visual theme to each title's poster.

This is my first project using Next.js and TypeScript. I developed it by closely following documentation and learning as I went along. As a result, you might notice several areas that could be improved or optimized. I encourage you to explore and identify any bugs or opportunities to make the code DRYer and more reusable.

## Features

- **User-Friendly Display of Movies and TV Shows**: Each movie and TV show is presented in a visually appealing card layout. This layout is designed to be easy on the eyes.
- **Search Functionality**: Allows users to search for movies and TV shows. Requests run only after the user presses Enter or clicks the search icon.
- **Multilingual Interface**: Supports English, Japanese, and Chinese. English is the default language, and the selected language is remembered in a cookie.
- **Image-Driven Themes**: Detail pages extract a restrained color palette from the visible poster and animate the page background, navigation, text accents, separators, and footer.
- **Continuous Detail Layouts**: Movie and TV pages use a shared hero, information hierarchy, credits, and metadata layout instead of a dashboard of disconnected cards.
- **Cross-Platform Detail Data**: Detail pages can show IMDb ratings and TVmaze broadcast information. Adding `OMDB_API_KEY` also enables Rotten Tomatoes and Metacritic scores when OMDb provides them. Animation details additionally try to match a Bangumi subject for anime-specific metadata, a Chinese-locale Bangumi poster, and a separate character-artwork view alongside TMDB voice-actor credits.
- **Unified Ratings**: Detail pages combine IMDb, Douban, TMDB, Bangumi, TVmaze, Rotten Tomatoes, and Metacritic when available. The displayed score prioritizes IMDb, then Douban, TMDB, and other sources, with vote counts used as a confidence adjustment. Douban and Bangumi matching use stable TMDB IDs for browser caching so changing the interface language does not trigger another lookup.
- **Interactive Carousels**: Utilize Embla Carousel for smooth sliding carousels.
- **Stylish Animations**: Enhanced UI animations using Motion and Tailwind CSS transitions.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js 22.x or higher
- npm installed

## Installation

To install this project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/LinQisan/NextJS-Movie-Website.git
   cd NextJS-Movie-Website
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file at the root of your project and add the TMDB API Bearer:

   ```plaintext
   TMDB_Bearer=your_tmdb_api_Bearer_here
   # Optional: enables Rotten Tomatoes and Metacritic detail scores.
   OMDB_API_KEY=your_omdb_api_key
   # Optional: identifies server requests to Bangumi. Public subject reads work without a token.
   BANGUMI_USER_AGENT="Eiseki/0.1.0 (https://github.com/LinQisan/NextJS-Movie-Website)"
   # Optional: enables authorized Bangumi content.
   BANGUMI_ACCESS_TOKEN=
   ```

   A ready-to-copy template is available in `.env.example`. Keep `.env.local` out of version control.

## Running the Application

To run the application in development mode, execute:

```bash
npm run dev
```

Navigate to `http://localhost:3000` to view the app.

For production build and start:

```bash
npm run build
npm start
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [TMDB API](https://www.themoviedb.org/documentation/api)
- [Bangumi API](https://bangumi.github.io/api/)
- [Motion](https://motion.dev/)
