import React, { useState } from 'react'

const events = [
  { id: 1, title: 'Team Standup', date: 'Today', time: '9:00 AM', color: '#007aff', location: 'Zoom' },
  { id: 2, title: 'Lunch with Sarah', date: 'Today', time: '12:30 PM', color: '#34c759', location: 'Sushi Place' },
  { id: 3, title: 'Project Review', date: 'Today', time: '3:00 PM', color: '#ff9500', location: 'Room 301' },
  { id: 4, title: 'Dentist Appointment', date: 'Tomorrow', time: '10:00 AM', color: '#ff3b30', location: 'Medical Center' },
  { id: 5, title: 'Gym', date: 'Tomorrow', time: '6:00 PM', color: '#af52de', location: 'Fitness Center' },
  { id: 6, title: 'Birthday Party', date: 'Aug 20', time: '7:00 PM', color: '#ff9500', location: 'Home' },
  { id: 7, title: 'Flight to NYC', date: 'Aug 25', time: '8:00 AM', color: '#007aff', location: 'Airport' },
]

const todos = [
  { id: 1, text: 'Finish project proposal', completed: false, list: 'Work' },
  { id: 2, text: 'Buy groceries', completed: false, list: 'Personal' },
  { id: 3, text: 'Call dentist', completed: true, list: 'Personal' },
  { id: 4, text: 'Review PR #42', completed: false, list: 'Work' },
  { id: 5, text: 'Update resume', completed: false, list: 'Personal' },
]

const lists = ['Reminders', 'Work', 'Personal', 'Shopping']

export default function RemindersApp() {
  const [selectedList, setSelectedList] = useState('Reminders')
  const [todosState, setTodosState] = useState(todos)
  const [newTodo, setNewTodo] = useState('')

  const filteredTodos = todosState.filter(t =>
    selectedList === 'Reminders' ? true : t.list === selectedList
  )

  const toggleTodo = (id: number) => {
    setTodosState(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const addTodo = () => {
    if (!newTodo.trim()) return
    setTodosState(prev => [...prev, { id: Date.now(), text: newTodo, completed: false, list: selectedList }])
    setNewTodo('')
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#f5f5f7', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Lists sidebar */}
      <div style={{ width: 180, background: 'rgba(0,0,0,0.04)', borderRight: '1px solid rgba(0,0,0,0.08)', padding: '12px 0', overflow: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', padding: '4px 14px 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Lists</div>
        {lists.map(list => (
          <div key={list} onClick={() => setSelectedList(list)}
            style={{ padding: '5px 14px', fontSize: 13, cursor: 'pointer', color: selectedList === list ? '#007aff' : '#1d1d1f',
              background: selectedList === list ? 'rgba(0,122,255,0.15)' : 'transparent', borderRadius: 6, margin: '1px 4px', fontWeight: selectedList === list ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: selectedList === list ? '#007aff' : '#86868b' }}>☑</span>
            {list}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1d1d1f' }}>{selectedList}</div>
          <div style={{ fontSize: 12, color: '#86868b', marginTop: 2 }}>
            {filteredTodos.filter(t => !t.completed).length} remaining · {filteredTodos.filter(t => t.completed).length} completed
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px' }}>
          {/* Add new */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()} placeholder="New reminder..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.12)', background: '#fff', fontSize: 13, outline: 'none' }} />
            <button onClick={addTodo} style={{ padding: '8px 16px', borderRadius: 8, background: '#007aff', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add</button>
          </div>

          {/* Todos */}
          {filteredTodos.map(todo => (
            <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div onClick={() => toggleTodo(todo.id)} style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${todo.completed ? '#34c759' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', background: todo.completed ? '#34c759' : 'transparent' }}>
                {todo.completed && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
              </div>
              <span style={{ fontSize: 14, color: todo.completed ? '#86868b' : '#1d1d1f', textDecoration: todo.completed ? 'line-through' : 'none', flex: 1 }}>{todo.text}</span>
              <span style={{ fontSize: 11, color: '#86868b' }}>{todo.list}</span>
            </div>
          ))}

          {filteredTodos.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#86868b', fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
              All caught up!
            </div>
          )}
        </div>

        {/* Events section */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '12px 20px', background: 'rgba(255,255,255,0.6)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#86868b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Upcoming Events</div>
          {events.filter(e => e.date === 'Today').map(ev => (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <div style={{ width: 4, height: 32, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f' }}>{ev.title}</div>
                <div style={{ fontSize: 11, color: '#86868b' }}>{ev.time} · {ev.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
