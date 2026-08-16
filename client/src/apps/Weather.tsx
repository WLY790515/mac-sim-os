import React, { useState, useEffect } from 'react'

interface City {
  name: string
  lat: number
  condition: string
  icon: string
  temp: number
  high: number
  low: number
  humidity: number
  wind: number
  feels: number
  description: string
  hourly: { time: string; icon: string; temp: number }[]
  forecast: { day: string; high: number; low: number; icon: string }[]
}

// Simulated realistic weather based on city coordinates and current conditions
function generateWeather(name: string, lat: number): City {
  const now = new Date()
  const hour = now.getHours()
  const isNight = hour < 6 || hour >= 20

  // Base temperature by latitude (closer to equator = warmer)
  const baseTemp = Math.max(5, 35 - Math.abs(lat) * 0.5)
  const dayVariation = Math.sin((hour - 6) / 12 * Math.PI) * 8 // hotter during day
  const temp = Math.round(baseTemp + dayVariation + (Math.random() - 0.5) * 4)

  const conditions = isNight
    ? [{ condition: 'Clear', icon: '🌙', description: 'Clear night sky' }]
    : [
        { condition: 'Sunny', icon: '☀️', description: 'Clear and sunny' },
        { condition: 'Partly Cloudy', icon: '⛅', description: 'Some clouds passing through' },
        { condition: 'Cloudy', icon: '☁️', description: 'Overcast skies' },
      ]
  const c = conditions[Math.floor(Math.random() * conditions.length)]

  const hourNames = ['Now', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM']
  const hourly = hourNames.map((t, i) => ({
    time: t,
    icon: i < 3 ? c.icon : isNight ? '🌙' : ['☀️', '⛅', '☁️'][i % 3],
    temp: Math.round(temp - i * (isNight ? 0 : 1)),
  }))

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayIdx = now.getDay()
  const forecast = days.map((day, i) => {
    const variation = Math.round((Math.random() - 0.5) * 6)
    const hi = temp + 3 + variation
    const lo = temp - 4 + variation
    const icons = ['☀️', '⛅', '🌧️', '☀️', '⛅', '☁️', '🌤️']
    return { day, high: hi, low: lo, icon: icons[i] }
  })

  return {
    name, lat,
    ...c,
    temp,
    high: temp + 4,
    low: temp - 5,
    humidity: Math.round(40 + Math.random() * 40),
    wind: Math.round(5 + Math.random() * 20),
    feels: temp + Math.round((Math.random() - 0.5) * 4),
    hourly,
    forecast,
  }
}

const CITIES = [
  { name: 'San Francisco', lat: 37.77 },
  { name: 'New York', lat: 40.71 },
  { name: 'Tokyo', lat: 35.68 },
  { name: 'London', lat: 51.51 },
  { name: 'Sydney', lat: -33.87 },
  { name: 'Paris', lat: 48.86 },
  { name: 'Dubai', lat: 25.20 },
  { name: 'Singapore', lat: 1.35 },
]

export default function WeatherApp() {
  const [cities, setCities] = useState<City[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initial = CITIES.map(c => generateWeather(c.name, c.lat))
    setCities(initial)
    setLoading(false)

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      setCities(prev => prev.map(c => generateWeather(c.name, c.lat)))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const city = cities[selectedIdx]

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg,#4a90d9 0%,#87ceeb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 18, color: '#fff' }}>Loading weather data...</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: 'linear-gradient(180deg,#4a90d9 0%,#87ceeb 40%,#b8e6f0 100%)', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 220, padding: '16px 12px', overflow: 'auto', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: '4px 8px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Cities</div>
        {cities.map((c, i) => (
          <div key={c.name} onClick={() => setSelectedIdx(i)}
            style={{
              padding: '8px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 4,
              background: selectedIdx === i ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)', transition: 'background 0.15s',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{c.name}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{c.temp}°</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{c.condition}</div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '20px 28px' }}>
        {/* Current weather */}
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#fff' }}>
          <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>{city.icon} {city.condition}</div>
          <div style={{ fontSize: 96, fontWeight: 200, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{city.temp}°</div>
          <div style={{ fontSize: 20, fontWeight: 500, marginTop: 4 }}>{city.name}</div>
          <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>H:{city.high}° L:{city.low}° · Feels like {city.feels}°</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{city.description}</div>
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Humidity', value: `${city.humidity}%`, icon: '💧' },
            { label: 'Wind', value: `${city.wind} mph`, icon: '💨' },
            { label: 'Feels Like', value: `${city.feels}°`, icon: '🌡️' },
            { label: 'UV Index', value: city.temp > 70 ? '6 (High)' : '3 (Moderate)', icon: '☀️' },
          ].map(item => (
            <div key={item.label} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>{item.icon} {item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#fff' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Hourly */}
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>Hourly Forecast</div>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
            {city.hourly.map(h => (
              <div key={h.time} style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{h.time}</div>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{h.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{h.temp}°</div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day forecast */}
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>7-Day Forecast</div>
          {city.forecast.map((day, i) => (
            <div key={day.day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#fff', width: 36 }}>{day.day}</span>
              <span style={{ fontSize: 18 }}>{day.icon}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', width: 30 }}>{day.low}°</span>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: '10%', right: '10%', height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#5ac8fa,#ffd60a,#ff3b30)' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', width: 30, textAlign: 'right' }}>{day.high}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
