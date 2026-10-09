import { useEffect, useState, type FormEvent } from 'react'
import { CloudSun, Search, Wind } from 'lucide-react'

type CityResult = {
  name: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
}

type GeocodingResponse = {
  results?: CityResult[]
}

type ForecastResponse = {
  current_weather?: {
    temperature: number
    windspeed: number
  }
}

type Weather = {
  city: string
  temperature: number
  windSpeed: number
}

type WeatherState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; weather: Weather }

function WeatherCard() {
  const [cityInput, setCityInput] = useState('')
  const [request, setRequest] = useState<{ city: string; attempt: number } | null>(null)
  const [weatherState, setWeatherState] = useState<WeatherState>({ status: 'idle' })

  useEffect(() => {
    if (!request) return

    const controller = new AbortController()

    const loadWeather = async () => {
      setWeatherState({ status: 'loading' })

      try {
        const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
        geocodingUrl.search = new URLSearchParams({
          name: request.city,
          count: '1',
          language: 'en',
          format: 'json',
        }).toString()

        const geocodingResponse = await fetch(geocodingUrl, { signal: controller.signal })
        if (!geocodingResponse.ok) {
          throw new Error('Could not search for that city. Please try again.')
        }

        const geocodingData = (await geocodingResponse.json()) as GeocodingResponse
        const city = geocodingData.results?.[0]
        if (!city || !Number.isFinite(city.latitude) || !Number.isFinite(city.longitude)) {
          throw new Error(`No matching city found for “${request.city}”. Check the spelling and try again.`)
        }

        const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast')
        forecastUrl.search = new URLSearchParams({
          latitude: String(city.latitude),
          longitude: String(city.longitude),
          current_weather: 'true',
        }).toString()

        const forecastResponse = await fetch(forecastUrl, { signal: controller.signal })
        if (!forecastResponse.ok) {
          throw new Error('Could not load the current forecast. Please try again.')
        }

        const forecastData = (await forecastResponse.json()) as ForecastResponse
        const currentWeather = forecastData.current_weather
        if (
          !currentWeather ||
          !Number.isFinite(currentWeather.temperature) ||
          !Number.isFinite(currentWeather.windspeed)
        ) {
          throw new Error('The forecast response did not include current weather. Please try again.')
        }

        const cityParts = [city.name, city.admin1, city.country].filter(
          (part, index, parts) => part && parts.indexOf(part) === index,
        )
        setWeatherState({
          status: 'success',
          weather: {
            city: cityParts.join(', '),
            temperature: currentWeather.temperature,
            windSpeed: currentWeather.windspeed,
          },
        })
      } catch (error) {
        if (controller.signal.aborted) return

        setWeatherState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong while loading the weather.',
        })
      }
    }

    void loadWeather()
    return () => controller.abort()
  }, [request])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const city = cityInput.trim()
    if (!city) {
      setRequest(null)
      setWeatherState({ status: 'idle' })
      return
    }

    setRequest((current) => ({ city, attempt: (current?.attempt ?? 0) + 1 }))
  }

  const retrySearch = () => {
    setRequest((current) => current && { ...current, attempt: current.attempt + 1 })
  }

  return (
    <section className="weather-card" aria-label="Current weather">
      <div className="weather-card-heading">
        <div className="weather-icon"><CloudSun size={17} /></div>
        <div>
          <span className="eyebrow">Local conditions</span>
          <h3>Weather</h3>
        </div>
      </div>

      <form className="weather-search" onSubmit={handleSearch}>
        <Search size={14} aria-hidden="true" />
        <input
          aria-label="Search city weather"
          value={cityInput}
          onChange={(event) => setCityInput(event.target.value)}
          placeholder="Search a city"
        />
        <button type="submit" aria-label="Search weather">Go</button>
      </form>

      <div className="weather-result" aria-live="polite" aria-busy={weatherState.status === 'loading'}>
        {weatherState.status === 'idle' && (
          <p className="weather-empty">Search for a city to see its current weather.</p>
        )}

        {weatherState.status === 'loading' && (
          <div className="weather-skeleton" role="status" aria-label="Loading weather">
            <span className="weather-skeleton-line city" />
            <span className="weather-skeleton-line temperature" />
            <span className="weather-skeleton-line wind" />
          </div>
        )}

        {weatherState.status === 'error' && (
          <div className="weather-error" role="alert">
            <p>{weatherState.message}</p>
            <button type="button" className="weather-retry" onClick={retrySearch}>Retry</button>
          </div>
        )}

        {weatherState.status === 'success' && (
          <div className="weather-current">
            <div className="weather-city">{weatherState.weather.city}</div>
            <div className="weather-readings">
              <strong className="weather-temperature">
                {Math.round(weatherState.weather.temperature)}<span>°C</span>
              </strong>
              <div className="weather-wind">
                <Wind size={15} />
                <span>{Math.round(weatherState.weather.windSpeed)} km/h</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="weather-attribution">Weather data by Open-Meteo</div>
    </section>
  )
}

export default WeatherCard
