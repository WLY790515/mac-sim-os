import React from 'react'
import type { AppDefinition } from './types'

// ─── App Components ────────────────────────────────────────────
import TerminalApp from './apps/Terminal'
import FinderApp from './apps/Finder'
import EditorApp from './apps/Editor'
import CalculatorApp from './apps/Calculator'
import ClockApp from './apps/Clock'
import SettingsApp from './apps/Settings'
import NotesApp from './apps/Notes'
import SafariApp from './apps/Safari'
import MusicApp from './apps/Music'
import CalendarApp from './apps/Calendar'
import MessagesApp from './apps/Messages'
import MailApp from './apps/Mail'
import PhotosApp from './apps/Photos'
import ContactsApp from './apps/Contacts'
import RemindersApp from './apps/Reminders'
import WeatherApp from './apps/Weather'
import MapsApp from './apps/Maps'
import FaceTimeApp from './apps/FaceTime'
import VideosApp from './apps/Videos'
import AboutApp from './apps/About'

// ─── Icon Paths ────────────────────────────────────────────────
const icon = (name: string) => import.meta.env.BASE_URL + 'icons/' + name + '.png'
const iconSvg = (name: string) => import.meta.env.BASE_URL + 'icons/' + name + '.svg'

// ─── App Registry (ordered like macOS Dock) ──────────────────
export const apps: AppDefinition[] = [
  // System utilities
  {
    id: 'finder',
    name: 'Finder',
    icon: icon('finder'),
    defaultSize: { width: 780, height: 480 },
    defaultPosition: { x: 60, y: 55 },
    component: FinderApp,
  },
  {
    id: 'safari',
    name: 'Safari',
    icon: icon('safari'),
    defaultSize: { width: 900, height: 560 },
    defaultPosition: { x: 80, y: 70 },
    component: SafariApp,
  },
  {
    id: 'messages',
    name: 'Messages',
    icon: icon('messages'),
    defaultSize: { width: 680, height: 480 },
    defaultPosition: { x: 100, y: 80 },
    component: MessagesApp,
  },
  {
    id: 'mail',
    name: 'Mail',
    icon: icon('mail'),
    defaultSize: { width: 780, height: 520 },
    defaultPosition: { x: 120, y: 60 },
    component: MailApp,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: icon('calendar'),
    defaultSize: { width: 720, height: 500 },
    defaultPosition: { x: 140, y: 90 },
    component: CalendarApp,
  },
  {
    id: 'maps',
    name: 'Maps',
    icon: icon('maps'),
    defaultSize: { width: 800, height: 520 },
    defaultPosition: { x: 80, y: 100 },
    component: MapsApp,
  },
  {
    id: 'photos',
    name: 'Photos',
    icon: icon('photos'),
    defaultSize: { width: 860, height: 540 },
    defaultPosition: { x: 60, y: 70 },
    component: PhotosApp,
  },
  {
    id: 'face-time',
    name: 'FaceTime',
    icon: icon('facetime'),
    defaultSize: { width: 640, height: 460 },
    defaultPosition: { x: 200, y: 80 },
    component: FaceTimeApp,
  },
  {
    id: 'music',
    name: 'Music',
    icon: icon('music'),
    defaultSize: { width: 420, height: 520 },
    defaultPosition: { x: 300, y: 80 },
    component: MusicApp,
  },
  {
    id: 'videos',
    name: 'Movies',
    icon: icon('movies'),
    defaultSize: { width: 780, height: 520 },
    defaultPosition: { x: 160, y: 90 },
    component: VideosApp,
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: icon('notes'),
    defaultSize: { width: 520, height: 380 },
    defaultPosition: { x: 200, y: 130 },
    component: NotesApp,
  },
  {
    id: 'reminders',
    name: 'Reminders',
    icon: icon('reminders'),
    defaultSize: { width: 580, height: 440 },
    defaultPosition: { x: 220, y: 100 },
    component: RemindersApp,
  },
  {
    id: 'contacts',
    name: 'Contacts',
    icon: icon('contacts'),
    defaultSize: { width: 640, height: 460 },
    defaultPosition: { x: 180, y: 110 },
    component: ContactsApp,
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: icon('weather'),
    defaultSize: { width: 560, height: 480 },
    defaultPosition: { x: 240, y: 70 },
    component: WeatherApp,
  },
  {
    id: 'clock',
    name: 'Clock',
    icon: icon('clock'),
    defaultSize: { width: 340, height: 420 },
    defaultPosition: { x: 380, y: 120 },
    component: ClockApp,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: icon('calculator'),
    defaultSize: { width: 240, height: 360 },
    defaultPosition: { x: 400, y: 120 },
    component: CalculatorApp,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: iconSvg('terminal_dynamic'),
    defaultSize: { width: 680, height: 420 },
    defaultPosition: { x: 120, y: 90 },
    component: TerminalApp,
  },
  {
    id: 'editor',
    name: 'TextEdit',
    icon: icon('textedit'),
    defaultSize: { width: 720, height: 500 },
    defaultPosition: { x: 160, y: 110 },
    component: EditorApp,
  },
  {
    id: 'settings',
    name: 'System Settings',
    icon: icon('settings'),
    defaultSize: { width: 680, height: 460 },
    defaultPosition: { x: 140, y: 90 },
    component: SettingsApp,
  },
  {
    id: 'about',
    name: 'About This Mac',
    icon: icon('settings'),
    defaultSize: { width: 460, height: 520 },
    defaultPosition: { x: window.innerWidth / 2 - 230, y: window.innerHeight / 2 - 260 },
    component: AboutApp,
  },
]
