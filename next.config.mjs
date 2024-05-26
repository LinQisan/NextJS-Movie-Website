/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {

    remotePatterns: [
      {
        hostname: 'image.tmdb.org',
      }, {
        hostname: 'media.themoviedb.org',
      }
    ]
  }
};

export default nextConfig;
