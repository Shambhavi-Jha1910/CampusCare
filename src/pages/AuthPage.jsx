import { useState } from 'react'
import { LifeBuoy, ArrowRight, LogIn, UserPlus } from 'lucide-react'

export default function AuthPage({ onLogin, onRegister, error, loading }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [validation, setValidation] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setValidation('')
    if (!form.email.trim() || !form.password) {
      setValidation('Enter your email and password.')
      return
    }
    if (mode === 'register' && (!form.name.trim() || form.password.length < 8)) {
      setValidation('Enter your name and a password with at least 8 characters.')
      return
    }
    await (mode === 'login' ? onLogin(form) : onRegister(form))
  }

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setValidation('')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark"><LifeBuoy size={22} strokeWidth={2.4} /></span><span><strong>CampusCare</strong><small>Campus helpdesk</small></span></div>
        <span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN CAMPUSCARE'}</span>
        <h1>{mode === 'login' ? 'Sign in to your account' : 'Create your student account'}</h1>
        <p className="auth-intro">{mode === 'login' ? 'Sign in to track requests and keep campus running smoothly.' : 'Register with your college email to submit and track requests.'}</p>
        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && <label>Name<input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={120} required /></label>}
          <label>Email address<input type="email" autoComplete="username" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={mode === 'register' ? 8 : undefined} required /></label>
          {(validation || error) && <div className="auth-error" role="alert">{validation || error}</div>}
          <button className="button button-primary auth-submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}{!loading && <ArrowRight size={16} />}</button>
        </form>
        <div className="auth-switch">{mode === 'login' ? "Don't have an account?" : 'Already registered?'} <button onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? <><UserPlus size={14} /> Create account</> : <><LogIn size={14} /> Sign in</>}</button></div>
      </section>
    </main>
  )
}
