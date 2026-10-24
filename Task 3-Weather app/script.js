// ---------- Config ----------
const OWM_URL = "https://api.openweathermap.org/data/2.5";
const METEO_GEO = "https://geocoding-api.open-meteo.com/v1/search";
const METEO_URL = "https://api.open-meteo.com/v1/forecast";
const OWM_KEY = (typeof CONFIG !== "undefined" && CONFIG.OWM_API_KEY || "").trim();
const QUICK_CITIES = ["Mumbai", "Delhi", "London", "New York", "Tokyo"];

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

class WeatherError extends Error {}

// ---------- Condition helpers ----------
// kind: clear | partly | clouds | rain | thunder | snow | mist
const ICONS = {
  clear: ["☀️", "🌙"], partly: ["⛅", "☁️"], clouds: ["☁️", "☁️"],
  rain: ["🌧️", "🌧️"], thunder: ["⛈️", "⛈️"], snow: ["❄️", "❄️"], mist: ["🌫️", "🌫️"]
};
const iconFor = (kind, night) => ICONS[kind][night ? 1 : 0];

function kindFromOWM(id) {
  if (id >= 200 && id < 300) return "thunder";
  if (id >= 300 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  if (id >= 700 && id < 800) return "mist";
  if (id === 800) return "clear";
  if (id === 801 || id === 802) return "partly";
  return "clouds";
}
function kindFromWMO(c) {
  if (c === 0 || c === 1) return "clear";
  if (c === 2) return "partly";
  if (c === 3) return "clouds";
  if (c === 45 || c === 48) return "mist";
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return "rain";
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return "snow";
  if (c >= 95) return "thunder";
  return "clouds";
}
const KIND_TEXT = { clear: "clear sky", partly: "partly cloudy", clouds: "overcast", rain: "rainy", thunder: "thunderstorm", snow: "snowy", mist: "foggy" };

function skyFor(kind, night) {
  if (kind === "thunder") return "storm";
  if (kind === "rain") return "rain";
  if (kind === "snow") return "snow";
  if (kind === "mist") return "mist";
  if (night) return "night";
  return kind === "clear" ? "sunny" : "cloudy";
}

// ---------- Fetch helpers ----------
async function request(url, city) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new WeatherError("Network error. Check your internet connection and try again.");
  }
  if (res.status === 404) throw new WeatherError(`Could not find "${city}". Check the spelling or try another city.`);
  if (res.status === 401) throw new WeatherError("Your OpenWeatherMap API key is invalid or not active yet. New keys can take up to 2 hours.");
  if (res.status === 429) throw new WeatherError("Too many requests. Please wait a minute and try again.");
  if (!res.ok) throw new WeatherError("The weather service had a problem. Please try again shortly.");
  return res.json();
}

// ---------- Provider 1: OpenWeatherMap (used when a key is set) ----------
async function fetchOWM(city) {
  const q = encodeURIComponent(city), key = encodeURIComponent(OWM_KEY);
  const [cur, fc] = await Promise.all([
    request(`${OWM_URL}/weather?q=${q}&units=metric&appid=${key}`, city),
    request(`${OWM_URL}/forecast?q=${q}&units=metric&appid=${key}`, city)
  ]);
  const tz = cur.timezone;
  const night = cur.dt < cur.sys.sunrise || cur.dt > cur.sys.sunset;

  // Group 3-hour entries into days (city's local time), keep min/max and the entry nearest noon
  const days = new Map();
  fc.list.forEach((item) => {
    const local = new Date((item.dt + tz) * 1000);
    const key = local.toISOString().slice(0, 10);
    const d = days.get(key) || { key, min: Infinity, max: -Infinity, best: null, diff: 99 };
    d.min = Math.min(d.min, item.main.temp_min);
    d.max = Math.max(d.max, item.main.temp_max);
    const diff = Math.abs(local.getUTCHours() - 12);
    if (diff < d.diff) { d.best = item; d.diff = diff; }
    days.set(key, d);
  });

  return {
    city: cur.name, country: cur.sys.country, night,
    temp: cur.main.temp, feels: cur.main.feels_like,
    kind: kindFromOWM(cur.weather[0].id), desc: cur.weather[0].description,
    humidity: cur.main.humidity, wind: cur.wind.speed * 3.6, pressure: cur.main.pressure,
    time: new Date((cur.dt + tz) * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }),
    forecast: [...days.values()].slice(0, 5).map((d) => ({
      date: d.key, min: d.min, max: d.max,
      kind: kindFromOWM(d.best.weather[0].id), desc: d.best.weather[0].description
    })),
    source: "OpenWeatherMap"
  };
}

// ---------- Provider 2: Open-Meteo (no key needed) ----------
async function fetchMeteo(city) {
  const geo = await request(`${METEO_GEO}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`, city);
  if (!geo.results || !geo.results.length) throw new WeatherError(`Could not find "${city}". Check the spelling or try another city.`);
  const p = geo.results[0];
  const url = `${METEO_URL}?latitude=${p.latitude}&longitude=${p.longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
  const w = await request(url, city);
  const c = w.current, kind = kindFromWMO(c.weather_code);
  return {
    city: p.name, country: p.country_code || p.country || "", night: c.is_day === 0,
    temp: c.temperature_2m, feels: c.apparent_temperature,
    kind, desc: KIND_TEXT[kind],
    humidity: c.relative_humidity_2m, wind: c.wind_speed_10m, pressure: c.surface_pressure,
    time: c.time.slice(11, 16),
    forecast: w.daily.time.map((date, i) => {
      const k = kindFromWMO(w.daily.weather_code[i]);
      return { date, min: w.daily.temperature_2m_min[i], max: w.daily.temperature_2m_max[i], kind: k, desc: KIND_TEXT[k] };
    }),
    source: "Open-Meteo"
  };
}

// ---------- UI ----------
const show = (id, on) => ($(id).hidden = !on);
const deg = (n) => `${Math.round(n)}°`;

function render(w) {
  document.body.dataset.sky = skyFor(w.kind, w.night);
  $("place").textContent = w.country ? `${w.city}, ${w.country}` : w.city;
  $("time").textContent = `Local time ${w.time}`;
  $("icon").textContent = iconFor(w.kind, w.night);
  $("temp").textContent = `${Math.round(w.temp)}°C`;
  $("desc").textContent = w.desc;
  $("feels").textContent = `Feels like ${deg(w.feels)}C`;
  $("humidity").textContent = `${Math.round(w.humidity)}%`;
  $("wind").textContent = `${Math.round(w.wind)} km/h`;
  $("pressure").textContent = `${Math.round(w.pressure)} hPa`;

  $("forecast").innerHTML = w.forecast.map((d, i) => {
    const label = i === 0 ? "Today" : new Date(d.date + "T00:00:00").toLocaleDateString([], { weekday: "short" });
    return `<div class="day"><div class="d">${esc(label)}</div><div class="i" aria-hidden="true">${iconFor(d.kind, false)}</div>` +
      `<div class="t">${deg(d.max)} <span class="lo">${deg(d.min)}</span></div><small>${esc(d.desc)}</small></div>`;
  }).join("");
  $("credit").textContent = `Data: ${w.source}`;
}

async function search(city) {
  city = city.trim();
  if (!city) return;
  show("error", false); show("result", false); show("loading", true);
  try {
    const data = OWM_KEY ? await fetchOWM(city) : await fetchMeteo(city);
    render(data);
    show("result", true);
    try { localStorage.setItem("skycast.city", data.city); } catch {}
  } catch (err) {
    $("error").textContent = err instanceof WeatherError ? err.message : "Something went wrong. Please try again.";
    show("error", true);
    if (!(err instanceof WeatherError)) console.error(err);
  } finally {
    show("loading", false);
  }
}

$("searchForm").addEventListener("submit", (e) => { e.preventDefault(); search($("city").value); });
QUICK_CITIES.forEach((c) => {
  const b = Object.assign(document.createElement("button"), { type: "button", textContent: c });
  b.addEventListener("click", () => { $("city").value = c; search(c); });
  $("quick").append(b);
});

let last = "Mumbai";
try { last = localStorage.getItem("skycast.city") || last; } catch {}
$("city").value = last;
search(last);
