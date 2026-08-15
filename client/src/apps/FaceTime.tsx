import React, { useState } from 'react'

const faces = [
  { id: 1, name: 'Sarah Chen', avatar: '👩‍💼', online: true, lastSeen: 'Now' },
  { id: 2, name: 'Mike Johnson', avatar: '👨‍💻', online: false, lastSeen: '5m ago' },
  { id: 3, name: 'Lisa Park', avatar: '👩‍🎨', online: true, lastSeen: 'Now' },
  { id: 4, name: 'David Kim', avatar: '🧑‍🔬', online: false, lastSeen: '1h ago' },
  { id: 5, name: 'Emma Wilson', avatar: '👩‍🏫', online: true, lastSeen: 'Now' },
  { id: 6, name: 'Alex Rivera', avatar: '👨‍🍳', online: false, lastSeen: '30m ago' },
]

export default function FaceTimeApp() {
  const [selectedFace, setSelectedFace] = useState<number | null>(null)
  const [inCall, setInCall] = useState(false)

  const selected = faces.find(f => f.id === selectedFace)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#000', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Contact list */}
      <div style={{ width: 260, background: 'rgba(30,30,30,0.95)', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>FaceTime</div>
        </div>
        <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: 13 }}>🔍</span>
            <input placeholder="Search" style={{ width: '100%', padding: '6px 10px 6px 32px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, outline: 'none' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {faces.map(f => (
            <div key={f.id} onClick={() => !inCall && setSelectedFace(f.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: inCall ? 'default' : 'pointer', opacity: inCall ? 0.4 : 1,
                background: selectedFace === f.id ? 'rgba(0,122,255,0.2)' : 'transparent', transition: 'background 0.1s' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{f.avatar}</div>
                {f.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: '#34c759', border: '2px solid #1e1e1e' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: f.online ? '#34c759' : '#86868b' }}>{f.online ? 'Available' : `Last seen ${f.lastSeen}`}</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52,199,89,0.2)', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📞</button>
                <button style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,122,255,0.2)', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📹</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {selected && !inCall ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, margin: '0 auto 16px' }}>
              {selected.avatar}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{selected.name}</div>
            <div style={{ fontSize: 14, color: '#86868b', marginBottom: 32 }}>{selected.online ? 'Available' : `Last seen ${selected.lastSeen}`}</div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button onClick={() => setInCall(true)} style={{ width: 64, height: 64, borderRadius: '50%', background: '#007aff', border: 'none', cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,122,255,0.4)' }}>📹</button>
              <button style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📞</button>
            </div>
          </div>
        ) : selected && inCall ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 140, height: 140, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, margin: '0 auto 20px', boxShadow: '0 0 60px rgba(102,126,234,0.4)' }}>
              {selected.avatar}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{selected.name}</div>
            <div style={{ fontSize: 14, color: '#34c759', marginBottom: 32 }}>Video Calling...</div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
              <button style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔇</button>
              <button onClick={() => setInCall(false)} style={{ width: 64, height: 64, borderRadius: '50%', background: '#ff3b30', border: 'none', cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(255,59,48,0.4)' }}>📞</button>
              <button style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔊</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#86868b' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📹</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 8 }}>FaceTime Audio & Video</div>
            <div style={{ fontSize: 14 }}>Select a contact to start a call</div>
          </div>
        )}
      </div>
    </div>
  )
}
