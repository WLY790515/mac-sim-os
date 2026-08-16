import type { MutableRefObject } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const iconRectsRef: MutableRefObject<Map<string, DOMRect>> = { current: new Map() }
