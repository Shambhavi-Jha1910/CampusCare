import { Bell, ShieldCheck, UserRound, ChevronRight } from 'lucide-react'

export default function Settings({ user }) {
  return <>
    <div className="page-heading"><span className="eyebrow">PREFERENCES</span><h1>Settings</h1><p>Manage your CampusCare demo preferences.</p></div>
    <section className="panel settings-panel"><div className="settings-title"><span className="settings-icon"><UserRound size={18} /></span><div><h2>Account</h2><p>Your profile and permissions are managed by CampusCare.</p></div></div><div className="settings-row"><span className="settings-icon"><UserRound size={18} /></span><span><strong>{user.name}</strong><small>{user.email}</small></span><span className="settings-tag">{user.role === 'ADMIN' ? 'Administrator' : 'Student'}</span><ChevronRight size={17} className="muted-icon" /></div><div className="settings-row"><span className="settings-icon"><Bell size={18} /></span><span><strong>Notifications</strong><small>In-app updates for request status changes.</small></span><span className="settings-tag">Enabled</span><ChevronRight size={17} className="muted-icon" /></div><div className="settings-row"><span className="settings-icon"><ShieldCheck size={18} /></span><span><strong>Data storage</strong><small>Requests are saved in the CampusCare database.</small></span><span className="settings-tag">Connected</span><ChevronRight size={17} className="muted-icon" /></div></section>
    <div className="demo-notice"><strong>Secure account</strong><p>Your login uses a protected server session. Your account role is verified by the backend on every API request.</p></div>
  </>
}
