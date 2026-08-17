import React, { useState } from 'react'
import { useApp } from '../stores/app.store'
import type { AppDefinition } from '../types'

const WALLPAPER_OPTIONS = [
  { id: 'aurora', name: '极光', grad: 'linear-gradient(135deg, #1a1a2e 0%, #533483 100%)' },
  { id: 'ocean',  name: '海洋', grad: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)' },
  { id: 'sunset', name: '日落', grad: 'linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)' },
  { id: 'forest', name: '森林', grad: 'linear-gradient(135deg, #134e5e 0%, #71b28a 100%)' },
  { id: 'dawn',   name: '黎明', grad: 'linear-gradient(135deg, #3a1c71 0%, #ffaf7b 100%)' },
  { id: 'midnight', name: '午夜', grad: 'linear-gradient(160deg, #0d1117 0%, #21262d 100%)' },
  { id: 'lava',   name: '熔岩', grad: 'linear-gradient(135deg, #200122 0%, #6f0000 100%)' },
  { id: 'auroraLight', name: '淡极光', grad: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
]

type Step = 'welcome' | 'wallpaper' | 'theme' | 'done'

const SETUP_KEY = 'macsimos-setup-done'

interface SetupWizardProps {
  apps: AppDefinition[]
  onComplete: () => void
}

export default function SetupWizard({ apps, onComplete }: SetupWizardProps) {
  const { state, dispatch } = useApp()
  const [step, setStep] = useState<Step>('welcome')
  const [selectedWP, setSelectedWP] = useState(state.wallpaper)
  const [darkMode, setDarkMode] = useState(state.darkMode)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleNext = () => {
    if (step === 'welcome') setStep('wallpaper')
    else if (step === 'wallpaper') setStep('theme')
    else if (step === 'theme') finish()
  }

  const handleBack = () => {
    if (step === 'wallpaper') setStep('welcome')
    else if (step === 'theme') setStep('wallpaper')
  }

  const finish = () => {
    localStorage.setItem(SETUP_KEY, 'true')
    dispatch({ type: 'SET_WALLPAPER', wallpaper: selectedWP })
    dispatch({ type: 'SET_DARK_MODE', on: darkMode })
    dispatch({ type: 'SET_THEME', theme: darkMode ? 'dark' : 'light' })
    setStep('done')
    setTimeout(() => onComplete(), 600)
  }

  // Auto-advance wallpaper carousel
  React.useEffect(() => {
    if (step !== 'wallpaper') return
    const id = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % WALLPAPER_OPTIONS.length
        setSelectedWP(WALLPAPER_OPTIONS[next].id)
        return next
      })
    }, 3000)
    return () => clearInterval(id)
  }, [step])

  if (step === 'done') return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50000,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'setupIn 0.4s ease-out',
    }}>
      {/* Top progress dots */}
      <div style={{ position: 'absolute', top: 48, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
        {(['welcome', 'wallpaper', 'theme'] as Step[]).map((s, i) => (
          <div key={s} style={{
            width: s === step ? 24 : 8, height: 8, borderRadius: 4,
            background: s === step ? '#007aff' : 'rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* ── Welcome Step ── */}
      {step === 'welcome' && (
        <div style={{ textAlign: 'center', animation: 'setupFade 0.4s ease-out' }}>
          <div style={{
            width: 88, height: 88, borderRadius: 22,
            background: 'linear-gradient(135deg, rgba(0,122,255,0.3), rgba(88,86,214,0.3))',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 32px',
          }}>
            <img src="/icons/apple-logo.svg" alt="" style={{ width: 48, height: 60, filter: 'brightness(0) invert(1)' }} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: -0.5 }}>欢迎使用</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: '0 0 48px', lineHeight: 1.6 }}>
            在浏览器中体验 macOS 模拟器<br />
            <span style={{ opacity: 0.6 }}>只需几步，即可开始使用</span>
          </p>
          <button onClick={handleNext} style={btnPrimary}>开始设置</button>
        </div>
      )}

      {/* ── Wallpaper Step ── */}
      {step === 'wallpaper' && (
        <div style={{ textAlign: 'center', animation: 'setupFade 0.4s ease-out', width: '100%', maxWidth: 600 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>选择壁纸</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 32px' }}>
            自动切换预览 · 点击选中 · 支持自定义 URL
          </p>

          {/* Wallpaper preview card */}
          <div style={{
            width: '100%', height: 220, borderRadius: 16, overflow: 'hidden',
            background: WALLPAPER_OPTIONS[activeIndex]?.grad,
            marginBottom: 20, position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            transition: 'background 0.5s ease',
          }}>
            {/* Simulated desktop preview */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 44,
              background: 'rgba(30,30,30,0.6)', backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              {['finder', 'safari', 'terminal', 'notes'].slice(0, 4).map((id, i) => (
                <div key={id} style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, animation: `float 2s ease-in-out ${i * 0.2}s infinite`,
                }}>
                  {['📁', '🧭', '⬛', '📝'][i]}
                </div>
              ))}
            </div>
          </div>

          {/* Wallpaper grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
            {WALLPAPER_OPTIONS.map((wp) => {
              const isActive = selectedWP === wp.id
              return (
                <button key={wp.id} onClick={() => { setSelectedWP(wp.id); setActiveIndex(WALLPAPER_OPTIONS.indexOf(wp)) }}
                  style={{
                    aspectRatio: '16/10', borderRadius: 10, overflow: 'hidden',
                    background: wp.grad, border: isActive ? '2px solid #007aff' : '2px solid transparent',
                    cursor: 'pointer', position: 'relative', transition: 'transform 0.2s, border-color 0.2s',
                    boxShadow: isActive ? '0 0 16px rgba(0,122,255,0.4)' : 'none',
                  }}
                  onMouseEnter={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'}}
                  onMouseLeave={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}}
                >
                  {isActive && <div style={{
                    position: 'absolute', bottom: 3, right: 4, fontSize: 10, color: '#fff',
                    background: 'rgba(0,0,0,0.4)', borderRadius: 4, padding: '1px 4px',
                  }}>✓</div>}
                </button>
              )
            })}
          </div>

          {/* Custom URL input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, padding: '0 4px' }}>
            <input id="setup-wp-url" placeholder="或输入图片 URL…"
              style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 13, outline: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value.trim(); if (v) { setSelectedWP(`url(${v})`); (e.target as HTMLInputElement).value = '' } } }}
            />
            <button onClick={() => { const v = (document.getElementById('setup-wp-url') as HTMLInputElement)?.value.trim(); if (v) { setSelectedWP(`url(${v})`); (document.getElementById('setup-wp-url') as HTMLInputElement).value = '' } }} style={{ ...btnSecondary, padding: '8px 14px' }}>应用</button>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={handleNext} style={btnPrimary}>下一步</button>
          </div>
        </div>
      )}

      {/* ── Theme Step ── */}
      {step === 'theme' && (
        <div style={{ textAlign: 'center', animation: 'setupFade 0.4s ease-out' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>外观样式</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 36px' }}>选择你喜欢的系统主题</p>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 40 }}>
            {[
              { id: true, label: '深色模式', desc: '护眼舒适', bg: 'linear-gradient(145deg, #1a1a2e, #16213e)', icon: '🌙' },
              { id: false, label: '浅色模式', desc: '明亮清晰', bg: 'linear-gradient(145deg, #f5f5f7, #e8e8ed)', icon: '☀️' },
            ].map(opt => {
              const active = darkMode === opt.id
              return (
                <button key={String(opt.id)} onClick={() => setDarkMode(opt.id)} style={{
                  width: 160, padding: '24px 20px', borderRadius: 16,
                  background: opt.bg, border: active ? '2px solid #007aff' : '2px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  boxShadow: active ? '0 0 24px rgba(0,122,255,0.3)' : '0 8px 32px rgba(0,0,0,0.3)',
                  animation: active ? 'themeSelect 0.3s ease-out' : undefined,
                }}
                  onMouseEnter={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)'}}
                  onMouseLeave={e => {(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{opt.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: opt.id ? '#fff' : '#1d1d1f', marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: opt.id ? 'rgba(255,255,255,0.5)' : '#6e6e73' }}>{opt.desc}</div>
                  {active && <div style={{ marginTop: 12, fontSize: 11, color: '#007aff', fontWeight: 600 }}>已选择</div>}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={handleBack} style={btnSecondary}>上一步</button>
            <button onClick={finish} style={btnPrimary}>完成</button>
          </div>
        </div>
      )}

      {/* Bottom text */}
      <div style={{ position: 'absolute', bottom: 40, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
        mac-sim-os v1.0.0 · 浏览器端 macOS 模拟器
      </div>

      <style>{`
        @keyframes setupIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes setupFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes themeSelect { 0% { transform: scale(0.95); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '12px 40px', borderRadius: 10, border: 'none',
  background: '#007aff', color: '#fff', fontSize: 15, fontWeight: 600,
  cursor: 'pointer', transition: 'background 0.2s, transform 0.15s',
  boxShadow: '0 4px 16px rgba(0,122,255,0.3)',
}

const btnSecondary: React.CSSProperties = {
  padding: '12px 28px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15, fontWeight: 500,
  cursor: 'pointer', transition: 'background 0.2s',
}
