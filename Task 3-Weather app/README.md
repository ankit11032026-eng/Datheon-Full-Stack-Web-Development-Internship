# Skycast | Live Weather Forecast

A weather app where you search any city in the world and get live conditions plus a 5-day forecast. Built with plain HTML, CSS and JavaScript (async/await + Fetch API).

## Features

- Search any global city (press Enter or click Search), or tap a quick-city chip
- Current temperature, "feels like", weather condition with a dynamic icon
- Humidity, wind speed (km/h) and atmospheric pressure (hPa)
- 5-day forecast cards (high / low temperature and condition), rendered with `Array.map()`
- Background gradient changes with the weather: sunny, cloudy, rain, storm, snow, mist and night
- Loading spinner while data is fetched
- Friendly error messages: city not found, network failure, invalid API key, rate limit
- Remembers your last searched city
- Responsive (Flexbox and Grid), keyboard friendly, reduced-motion support

## Data sources

The app supports two providers and picks one automatically:

| Condition | Provider |
| --- | --- |
| `OWM_API_KEY` is set in `config.js` | [OpenWeatherMap](https://openweathermap.org/api) (`/weather` and `/forecast`) |
| `OWM_API_KEY` is empty | [Open-Meteo](https://open-meteo.com/) (free, no key needed) |

Both providers are converted into the same data shape, so the interface code is shared.

## Use your OpenWeatherMap API key

1. Create a free account and copy your key from https://home.openweathermap.org/api_keys
2. Open `config.js` and paste it:

```js
const CONFIG = {
  OWM_API_KEY: "your_key_here"
};
```

New keys can take up to 2 hours to activate. Until then the API returns a 401 error, and the app shows a message about it.

**Security note:** this is a front-end-only app, so any key in `config.js` is visible to anyone who opens the site. Free-tier keys have low risk, but if you push the repo publicly, you can regenerate the key anytime from your OpenWeatherMap dashboard. Never reuse a paid or sensitive key here.

## Project structure

```
task-3-weather-app/
├── index.html   # Markup
├── style.css    # Layout, weather gradients, spinner
├── config.js    # Optional API key
├── script.js    # Fetching, error handling, rendering
└── README.md
```

## How it works

1. `search(city)` shows the spinner and calls `fetchOWM()` or `fetchMeteo()`.
2. `request()` wraps `fetch()` in try/catch and maps HTTP status codes (404, 401, 429) to clear messages.
3. OpenWeatherMap's 3-hour forecast is grouped into days, keeping the min/max and the entry nearest noon.
4. `render()` fills the page, sets `data-sky` on `<body>` for the gradient, and builds the forecast cards with `Array.map()`.

## Run locally

```bash
python -m http.server 8000
```

Then visit http://localhost:8000

## Deploy

Push to GitHub, then **Settings → Pages → Deploy from a branch → `main` / `(root)`**. Live URL format:
`https://<username>.github.io/<repo>/task-3-weather-app/`

## Tech stack

HTML5 · CSS3 (Flexbox, Grid) · JavaScript ES6+ · Fetch API · async/await · OpenWeatherMap API · Open-Meteo API
