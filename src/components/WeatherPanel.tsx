"use client";

import { useState } from "react";

type Weather = {
  temperature: number;
  feelsLike: number;
  condition: string;
};

function weatherCondition(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Misty";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}

export default function WeatherPanel() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  function loadWeather() {
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Location is not available in this browser.");
      return;
    }

    setStatus("loading");
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,apparent_temperature,weather_code&timezone=auto`);
          if (!response.ok) throw new Error("Weather service unavailable");
          const data = await response.json();
          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            feelsLike: Math.round(data.current.apparent_temperature),
            condition: weatherCondition(data.current.weather_code),
          });
          setStatus("idle");
        } catch {
          setStatus("error");
          setMessage("Weather could not be loaded right now.");
        }
      },
      (error) => {
        setStatus("error");
        setMessage(error.code === error.PERMISSION_DENIED ? "Allow location access to see local weather." : "Your location could not be determined.");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 15 * 60_000 },
    );
  }

  return (
    <section className="card-surface overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Local weather</p>
          <h2 className="mt-2 text-lg font-bold text-ink">Weather near you</h2>
          {weather ? (
            <div className="mt-4 flex items-end gap-3"><p className="text-4xl font-bold text-ink">{weather.temperature}°</p><div className="pb-1"><p className="font-semibold text-ink">{weather.condition}</p><p className="text-xs text-ink/55">Feels like {weather.feelsLike}°C</p></div></div>
          ) : <p className="mt-2 text-sm text-ink/60">See the current conditions where you are.</p>}
        </div>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">Now</span>
      </div>
      <div className="border-t border-hairline bg-gray-50/70 px-5 py-3 dark:bg-[#171a1f]/70 sm:px-6">
        {status === "error" && <p className="mb-2 text-xs text-rust">{message}</p>}
        <button type="button" onClick={loadWeather} disabled={status === "loading"} className="text-sm font-semibold text-brand hover:text-brand-dark disabled:cursor-wait disabled:opacity-60">
          {status === "loading" ? "Finding your weather..." : weather ? "Refresh weather" : "Use my location"}
        </button>
      </div>
    </section>
  );
}