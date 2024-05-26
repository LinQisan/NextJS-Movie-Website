## NextJS Movie Website

This is a dynamic movie website built using Next.js 14 and powered by the TMDB API. It features modern UI components, responsive design, and interactive elements to provide a seamless user experience for movie enthusiasts.

This is my first project using Next.js and TypeScript. I developed it by closely following documentation and learning as I went along. As a result, you might notice several areas that could be improved or optimized. I encourage you to explore and identify any bugs or opportunities to make the code DRYer and more reusable.

## Features

- **User-Friendly Display of Movies and TV Shows**: Each movie and TV show is presented in a visually appealing card layout. This layout is designed to be easy on the eyes.
- **Search Functionality**: Allows users to search for movies based on keywords.
- **Interactive Carousels**: Utilize Embla Carousel for smooth sliding carousels.
- **Stylish Animations**: Enhanced UI animations using Framer Motion and Tailwind CSS animations.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js 22.x or higher
- npm installed

## Installation

To install this project, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/movies-search.git
   cd movies-search
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file at the root of your project and add the TMDB API Bearer:
   ```plaintext
   TMDB_Bearer=your_tmdb_api_Bearer_here
   ```

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

## License

Distributed under the GNU General Public License v3.0. See `LICENSE` for more information.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [TMDB API](https://www.themoviedb.org/documentation/api)
- [Framer Motion](https://www.framer.com/motion/)
