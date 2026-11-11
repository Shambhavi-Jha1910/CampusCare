import { X, MapPin, CalendarDays, UserRound, Flag } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import { formatDate } from './RequestTable.jsx'

export default function RequestModal({ request, onClose }) {
  if (!request) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="request-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header"><div><span className="eyebrow">{request.id}</span><h2 id="modal-title">{request.title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close details"><X size={19} /></button></div>
        <div className="modal-status"><StatusBadge status={request.status} /><span className={`priority priority-${request.priority.toLowerCase()}`}>{request.priority} priority</span></div>
        <p className="modal-description">{request.description}</p>
        <div className="modal-meta"><span><MapPin size={16} />{request.location}</span><span><CalendarDays size={16} />Submitted {formatDate(request.submittedAt)}</span><span><UserRound size={16} />{request.submittedBy}</span><span><Flag size={16} />{request.category}</span></div>
        <div className="tracking-box"><strong>Request progress</strong><div className="tracking-steps">{['Submitted', 'In Progress', 'Resolved'].map((step, index) => {
          const current = request.status === 'Pending' ? 0 : request.status === 'In Progress' ? 1 : 2
          return <div key={step} className={`tracking-step ${index <= current ? 'step-done' : ''}`}><span className="step-marker">{index < current ? '✓' : index + 1}</span><small>{step}</small></div>
        })}</div>{request.history?.length > 1 && <div className="history-list">{request.history.map((item) => <div key={item.id}><span>{item.newStatus}</span><small>{new Date(item.changedAt).toLocaleString()} · {item.changedBy}</small>{item.note && <small>{item.note}</small>}</div>)}</div>}</div>
        <button className="button button-primary modal-done" onClick={onClose}>Done</button>
      </section>
    </div>
  )
}
