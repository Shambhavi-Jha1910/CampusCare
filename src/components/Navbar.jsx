import { Bell, Search, Menu, LogOut } from 'lucide-react'

export default function Navbar({ user, search, setSearch, onMenu, onLogout }) {
  const role = user.role === 'ADMIN' ? 'Admin' : 'Student'
  const initials = user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
        <div className="topbar-greeting"><span>Good morning, {role} <span className="wave">✦</span></span><small>{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())}</small></div>
      </div>
      <div className="topbar-actions">
        <label className="top-search">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search anything..." aria-label="Search requests" />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button>
        <span className="topbar-divider" />
        <span className="mini-avatar">{initials}</span>
        <span className="nav-user-name">{user.name}</span>
        <button className="icon-button" onClick={onLogout} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
      </div>
    </header>
  )
}
