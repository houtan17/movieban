# Movieban

Movieban is a modern, responsive movie and TV show discovery Progressive Web App (PWA). Discover titles, explore trending content, track upcoming releases, and count down to release dates — all through a clean, intuitive interface.

Designed to work across desktop computers, tablets, and mobile devices.

## Features

* Discover movies and TV shows using live TMDB data.
* Search for movies and TV shows.
* Browse trending titles and upcoming releases.
* Track release dates with countdowns.
* Save and manage your personal watchlist.
* User authentication with Supabase.
* Load more titles with paginated results.
* Light and dark themes.
* Installable PWA experience.
* Responsive design for different screen sizes.

## Tech Stack

**Frontend**

* React
* Vite
* JavaScript
* Tailwind CSS

**Backend**

* Node.js tooling
* Cloudflare Workers
* Hono

**Database & Authentication**

* Supabase

**Movie Data**

* The Movie Database (TMDB) API

**Deployment**

* Vercel (frontend)
* Cloudflare Workers (API)

## Getting Started

### Prerequisites

Install the following before getting started:

* [Node.js](https://nodejs.org/) (LTS recommended)
* npm
* A Supabase project
* A TMDB API key
* A Cloudflare account for deploying the API

### Installation

1. Clone the repository:

   ```bash
   git clone <YOUR_REPOSITORY_URL>
   ```

2. Navigate to the project directory:

   ```bash
   cd movieban
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env.local` file based on `.env.example` and configure the required frontend environment variables.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL shown in your terminal.

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

* `npm run dev` — Start the development server.
* `npm run build` — Build the production frontend.
* `npm run lint` — Check the code for linting issues.
* `npm run test` — Run the project's tests.
* `npm run preview` — Preview the production build locally.

## Backend Setup

The API is located in the `worker/` directory.

```bash
cd worker
npm install
```

Configure the required Cloudflare Worker secrets and environment variables according to the project's configuration. Never commit real API keys, tokens, or other secrets to the repository.

To deploy the API, use the deployment script configured in the Worker project's `package.json`:

```bash
npm run deploy
```

## Environment Variables

Frontend environment variables are configured through `.env.local` for local development and through your deployment platform for production.

Backend secrets must be configured separately in Cloudflare Workers.

Refer to `.env.example` and the Worker configuration for the exact variable names required by your setup. Never publish `.env.local` or real credentials.

## Credits

Movie and TV show metadata is provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).

This project uses TMDB data and is not endorsed or certified by TMDB unless explicitly stated otherwise.

## License

See the [LICENSE](LICENSE) file for license information.
