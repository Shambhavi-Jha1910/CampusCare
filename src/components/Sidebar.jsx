import {
  LayoutDashboard, Plus, ClipboardList, Settings, LifeBuoy, ChevronLeft, LogOut,
} from 'lucide-react'

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'ADMIN'] },
  { id: 'submit', label: 'Submit Request', icon: Plus, roles: ['STUDENT'] },
  { id: 'requests', label: 'My Requests', icon: ClipboardList, roles: ['STUDENT'] },
  { id: 'admin', label: 'Manage Requests', icon: ClipboardList, roles: ['ADMIN'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['STUDENT', 'ADMIN'] },
]

export default function Sidebar({ page, setPage, user, open, onClose, onLogout }) {
  const role = user.role
  return (
    <>
      {open && <button className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><LifeBuoy size={22} strokeWidth={2.4} /></div>
          <div><strong>CampusCare</strong><span>Campus helpdesk</span></div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close navigation"><ChevronLeft size={18} /></button>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {items.filter((item) => item.roles.includes(role)).map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => { setPage(id); onClose() }}>
              <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
              {id === 'admin' && <span className="nav-pill">Admin</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-help">
          <div className="help-icon"><LifeBuoy size={18} /></div>
          <strong>Need a hand?</strong>
          <p>Our campus team is here to help.</p>
          <button onClick={() => setPage(role === 'ADMIN' ? 'admin' : 'submit')}>{role === 'ADMIN' ? 'Manage requests' : 'Contact support'} <span>→</span></button>
        </div>
        <div className="sidebar-bottom">
          <div className={`profile-avatar ${role === 'ADMIN' ? 'profile-admin' : ''}`}>{user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
          <div className="profile-copy"><strong>{user.name}</strong><span>{role === 'ADMIN' ? 'Facilities team' : 'Student'}</span></div>
          <button className="sidebar-logout" onClick={onLogout} aria-label="Sign out"><LogOut size={15} /></button>
        </div>
      </aside>
    </>
  )
}
