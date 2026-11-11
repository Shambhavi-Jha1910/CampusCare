import { ArrowUpRight, Trash2, UserRoundCheck } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'

export function formatDate(value) {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
    : '—'
}

export default function RequestTable({ requests = [], admin = false, onStatusChange, onAssign, currentAdminId, onDelete, onOpen, emptyMessage }) {
  const rows = Array.isArray(requests) ? requests : []
  if (!rows.length) {
    return <div className="empty-state"><div className="empty-icon"><span>✓</span></div><strong>Nothing to see here</strong><p>{emptyMessage || 'Try adjusting your filters or submit a new request.'}</p></div>
  }
  return (
    <div className="table-scroll">
      <table className="request-table">
        <thead><tr>
          <th>REQUEST</th><th>CATEGORY</th><th>LOCATION</th><th>SUBMITTED</th><th>STATUS</th>{admin && <><th>PRIORITY</th><th>ASSIGNED</th></>}<th aria-label="Actions" />
        </tr></thead>
        <tbody>
          {rows.map((request) => (
            <tr key={request.id}>
              <td><button className="request-title-cell" onClick={() => onOpen?.(request)}><span className="request-id">{request.id || '—'}</span><strong>{request.title || 'Untitled request'}</strong></button>{admin && <span className="submitted-by">by {request.submittedBy || 'Unknown student'}</span>}</td>
              <td><span className="category-label"><span className={`category-dot category-${String(request.category || 'uncategorized').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} />{request.category || 'Uncategorized'}</span></td>
              <td className="location-cell">{request.location || '—'}</td>
              <td className="date-cell">{formatDate(request.submittedAt)}</td>
              <td>{admin ? <select className={`status-select status-${String(request.status || 'Pending').toLowerCase().replace(' ', '-')}`} value={request.status || 'Pending'} onChange={(event) => onStatusChange?.(request.id, event.target.value)} aria-label={`Update status for ${request.id || 'request'}`}><option>Pending</option><option>In Progress</option><option>Resolved</option></select> : <StatusBadge status={request.status || 'Pending'} />}</td>
              {admin && <td><span className={`priority priority-${String(request.priority || 'Medium').toLowerCase()}`}>{request.priority || 'Medium'}</span></td>}
              {admin && <td>{request.assignedAdmin ? <span className="assigned-label">{request.assignedAdmin}</span> : <button className="assign-action" onClick={() => onAssign?.(request.id, currentAdminId)} disabled={currentAdminId == null || !onAssign}><UserRoundCheck size={14} /> Assign to me</button>}</td>}
              <td>{admin ? <div className="admin-row-actions"><button className="row-action" onClick={() => onOpen?.(request)} aria-label={`View ${request.id || 'request'}`}><ArrowUpRight size={16} /></button><button className="row-action delete-action" onClick={() => onDelete?.(request)} aria-label={`Delete ${request.id || 'request'}`}><Trash2 size={16} /></button></div> : <button className="row-action" onClick={() => onOpen?.(request)} aria-label={`View ${request.id || 'request'}`}><ArrowUpRight size={16} /></button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
