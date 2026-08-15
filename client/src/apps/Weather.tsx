import React, { useState } from 'react'

const cities = [
  { name: 'San Francisco', temp: 72, condition: 'Partly Cloudy', high: 76, low: 58, humidity: 65, wind: 12, feels: 70, icon: '⛅' },
  { name: 'New York', temp: 68, condition: 'Sunny', high: 74, low: 55, humidity: 50, wind: 15, feels: 66, icon: '☀️' },
  { name: 'Tokyo', temp: 82, condition: 'Humid', high: 85, low: 72, humidity: 80, wind: 8, feels: 88, icon: '🌤️' },
  { name: 'London', temp: 55, condition: 'Rainy', high: 58, low: 48, humidity: 85, wind: 20, feels: 50, icon: '🌧️' },
  { name: 'Sydney', temp: 65, condition: 'Clear', high: 70, low: 55, humidity: 55, wind: 18, feels: 63, icon: '🌙' },
]

const forecast = [
  { day: 'Mon', high: 74, low: 58, icon: '☀️' },
  { day: 'Tue', high: 72, low: 56, icon: '⛅' },
  { day: 'Wed', high: 68, low: 54, icon: '🌧️' },
  { day: 'Thu', high: 70, low: 55, icon: '⛅' },
  { day: 'Fri', high: 75, low: 59, icon: '☀️' },
  { day: 'Sat', high: 77, low: 60, icon: '☀️' },
  { day: 'Sun', high: 73, low: 57, icon: '🌤️' },
]

export default function WeatherApp() {
  const [selectedCity, setSelectedCity] = useState(cities[0])

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: 'linear-gradient(180deg,#4a90d9 0%,#87ceeb 40%,#b8e6f0 100%)', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 220, padding: '16px 12px', overflow: 'auto', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: '4px 8px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Cities</div>
        {cities.map(city => (
          <div key={city.name} onClick={() => setSelectedCity(city)}
            style={{ padding: '8px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 4,
              background: selectedCity.name === city.name ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)', transition: 'background 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{city.name}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{city.temp}°</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{city.condition}</div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '20px 28px' }}>
        {/* Current weather */}
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#fff' }}>
          <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>{selectedCity.name}</div>
          <div style={{ fontSize: 96, fontWeight: 200, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{selectedCity.temp}°</div>
          <div style={{ fontSize: 20, fontWeight: 500, marginTop: 4 }}>{selectedCity.condition}</div>
          <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>H:{selectedCity.high}° L:{selectedCity.low}° · Feels like {selectedCity.feels}°</div>
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Humidity', value: `${selectedCity.humidity}%`, icon: '💧' },
            { label: 'Wind', value: `${selectedCity.wind} mph`, icon: '💨' },
            { label: 'Feels Like', value: `${selectedCity.feels}°`, icon: '🌡️' },
            { label: 'UV Index', value: selectedCity.temp > 70 ? '6 (High)' : '3 (Moderate)', icon: '☀️' },
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
            {['Now', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM'].map((hour, i) => (
              <div key={hour} style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{hour}</div>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{['☀️','⛅','⛅','🌧️','🌧️','⛅','☀️'][i]}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{selectedCity.temp - i * 2}°</div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day forecast */}
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>7-Day Forecast</div>
          {forecast.map((day, i) => (
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
