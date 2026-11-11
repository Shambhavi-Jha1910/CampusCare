import { useState } from 'react'
import { ArrowLeft, Info, CheckCircle2, MapPin, ClipboardList, ShieldCheck } from 'lucide-react'

const initialForm = { title: '', category: '', location: '', description: '', priority: 'Medium' }

export default function SubmitRequest({ onSubmit, setPage, categories, busy }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const update = (key, value) => { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: '' })) }
  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'Please enter a clear issue title.'
    if (!form.category) next.category = 'Please choose a category.'
    if (!form.location.trim()) next.location = 'Please add the campus location.'
    if (form.description.trim().length < 15) next.description = 'Description must be at least 15 characters.'
    setErrors(next)
    if (Object.keys(next).length) return
    setSubmitting(true)
    try {
      const succeeded = await onSubmit({
        ...form,
        categoryId: Number(form.category),
      })
      if (succeeded) setForm(initialForm)
    } finally {
      setSubmitting(false)
    }
  }
  const fieldClass = (name) => `form-field ${errors[name] ? 'field-error' : ''}`

  return (
    <>
      <div className="page-heading">
        <button className="back-link" onClick={() => setPage('dashboard')}><ArrowLeft size={16} /> Back to dashboard</button>
        <span className="eyebrow">CAMPUS SUPPORT</span><h1>Submit a request</h1><p>Tell us what's going on and we'll get the right team on it.</p>
      </div>
      <div className="form-layout">
        <form className="panel request-form" onSubmit={submit} noValidate>
          <div className="form-section-heading"><span className="form-section-icon"><ClipboardList size={17} /></span><div><h2>Request details</h2><p>Give us a few details so we can help you faster.</p></div></div>
          <div className={fieldClass('title')}><label htmlFor="issue-title">Issue title <span>*</span></label><input id="issue-title" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Projector not working in Room 204" maxLength={100} />{errors.title && <small className="field-message">{errors.title}</small>}</div>
          <div className="form-row">
            <div className={fieldClass('category')}><label htmlFor="issue-category">Category <span>*</span></label><select id="issue-category" value={form.category} onChange={(event) => update('category', event.target.value)} disabled={busy}><option value="">Choose a category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errors.category && <small className="field-message">{errors.category}</small>}</div>
            <div className={fieldClass('location')}><label htmlFor="issue-location">Location <span>*</span></label><div className="input-with-icon"><MapPin size={16} /><input id="issue-location" value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Building, floor, room..." maxLength={120} /></div>{errors.location && <small className="field-message">{errors.location}</small>}</div>
          </div>
          <div className={fieldClass('description')}><div className="label-row"><label htmlFor="issue-description">Detailed description <span>*</span></label><small>At least 15 characters</small></div><textarea id="issue-description" rows="5" value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe the issue, when it started, and any details that might help..." maxLength={1000} />{errors.description && <small className="field-message">{errors.description}</small>}</div>
          <fieldset className="priority-field"><legend>Priority level</legend><div className="priority-options">{['Low', 'Medium', 'High'].map((item) => <button type="button" key={item} className={`priority-option priority-option-${item.toLowerCase()} ${form.priority === item ? 'selected' : ''}`} onClick={() => update('priority', item)}><span className="priority-indicator" /><span><strong>{item}</strong><small>{item === 'Low' ? 'Can wait a few days' : item === 'Medium' ? 'Needs attention soon' : 'Urgent issue'}</small></span></button>)}</div></fieldset>
          <div className="form-note"><Info size={16} /><span>For emergencies that pose an immediate safety risk, please contact campus security directly.</span></div>
          <div className="form-footer"><span><ShieldCheck size={15} /> Your request is only shared with the facilities team.</span><button className="button button-primary" type="submit" disabled={submitting || busy}>{submitting ? 'Submitting…' : <>Submit request <span>→</span></>}</button></div>
        </form>
        <aside className="form-aside">
          <div className="tip-card"><div className="tip-art"><div className="tip-art-circle"><CheckCircle2 size={25} /></div><span /><span /><span /></div><span className="eyebrow">WHAT HAPPENS NEXT</span><h3>We've got it from here.</h3><p>Your request goes straight to our facilities team. We'll keep you posted as things move along.</p><div className="tip-steps"><div><span>1</span><p><strong>We review it</strong><small>Usually within one working day</small></p></div><div><span>2</span><p><strong>Team gets assigned</strong><small>The right people take a look</small></p></div><div><span>3</span><p><strong>Issue gets resolved</strong><small>Track progress in My Requests</small></p></div></div></div>
          <div className="aside-help"><strong>Not sure where to start?</strong><p>Include the building name and room number if you can.</p><button onClick={() => setPage('requests')}>See my requests <span>→</span></button></div>
        </aside>
      </div>
    </>
  )
}
