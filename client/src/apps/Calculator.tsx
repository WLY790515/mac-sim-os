import React, { useState } from 'react'

type CalcState = {
  display: string
  previousValue: string | null
  operator: string | null
  waitingForOperand: boolean
}

const INIT: CalcState = { display: '0', previousValue: null, operator: null, waitingForOperand: false }

const BUTTONS = [
  ['AC', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]

export default function CalculatorApp() {
  const [state, setState] = useState<CalcState>(INIT)

  const handlePress = (btn: string) => {
    setState(prev => {
      const { display, previousValue, operator, waitingForOperand } = prev

      if (/^[0-9]$/.test(btn)) {
        if (waitingForOperand) return { ...prev, display: btn, waitingForOperand: false }
        return { ...prev, display: display === '0' ? btn : display + btn }
      }

      if (btn === '.') {
        if (waitingForOperand) return { ...prev, display: '0.', waitingForOperand: false }
        if (display.includes('.')) return prev
        return { ...prev, display: display + '.' }
      }

      if (btn === 'AC') return { ...INIT }

      if (btn === '±') return { ...prev, display: String(-parseFloat(display)) }

      if (btn === '%') return { ...prev, display: String(parseFloat(display) / 100) }

      if (['+', '−', '×', '÷'].includes(btn)) {
        const op = btn
        if (previousValue !== null && !waitingForOperand) {
          const result = calculate(parseFloat(previousValue), parseFloat(display), operator!)
          return { display: formatResult(result), previousValue: String(result), operator: op, waitingForOperand: true }
        }
        return { ...prev, previousValue: display, operator: op, waitingForOperand: true }
      }

      if (btn === '=') {
        if (previousValue !== null && operator) {
          const result = calculate(parseFloat(previousValue), parseFloat(display), operator)
          return { display: formatResult(result), previousValue: null, operator: null, waitingForOperand: true }
        }
        return prev
      }

      return prev
    })
  }

  return (
    <div style={{
      width: '100%', height: '100%', background: '#2c2c2c',
      display: 'flex', flexDirection: 'column', padding: '12px',
    }}>
      {/* Display */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
        padding: '0 8px 12px', minWidth: 0,
      }}>
        <span style={{
          fontSize: 48, fontWeight: 200, color: '#fff',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          letterSpacing: -2, wordBreak: 'break-all', lineHeight: 1,
        }}>
          {state.display}
        </span>
      </div>

      {/* Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {BUTTONS.flat().map(btn => {
          const isOp = ['+', '−', '×', '÷', '='].includes(btn)
          const isFunc = ['AC', '±', '%'].includes(btn)
          const isActive = state.operator === btn && state.waitingForOperand && !['='].includes(btn)
          return (
            <button key={btn} onClick={() => handlePress(btn)} style={{
              height: 56, borderRadius: 28, fontSize: 22, fontWeight: 400,
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              border: 'none', cursor: 'pointer', transition: 'filter 0.1s',
              background: isOp
                ? (isActive ? '#fff' : '#ff9f0a')
                : isFunc
                ? '#a5a5a5'
                : '#505050',
              color: isOp ? '#fff' : isFunc ? '#000' : '#fff',
            }}>
              {btn}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function calculate(a: number, b: number, op: string): number {
  switch (op) {
    case '+': return a + b
    case '−': return a - b
    case '×': return a * b
    case '÷': return b !== 0 ? a / b : NaN
    default: return b
  }
}

function formatResult(n: number): string {
  if (isNaN(n)) return 'Error'
  const s = String(n)
  return s.length > 12 ? n.toExponential(5) : s
}
