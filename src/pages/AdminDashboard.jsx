import { ClipboardList, Clock3, Wrench, CheckCircle2, Trash2, ShieldCheck } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import Filters from '../components/Filters.jsx'
import RequestTable from '../components/RequestTable.jsx'

export default function AdminDashboard({ requests = [], categories = [], summary, search = '', setSearch, category, setCategory, status, setStatus, onStatusChange, onAssign, onDelete, onOpen, currentAdminId, loading }) {
  const safeRequests = Array.isArray(requests) ? requests : []
  const safeCategories = Array.isArray(categories) ? categories : []
  const query = search.toLowerCase()
  const filtered = safeRequests.filter((request) => {
    const searchableValues = [request.id, request.title, request.category, request.location, request.submittedBy]
    return (!query || searchableValues.some((value) => String(value ?? '').toLowerCase().includes(query)))
      && (!category || request.category === category) && (!status || request.status === status)
  }).sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0))
  return <>
    <div className="page-heading heading-with-action"><div><span className="eyebrow">FACILITIES WORKSPACE</span><h1>Manage requests</h1><p>Review reports and keep campus running smoothly.</p></div><span className="admin-indicator"><ShieldCheck size={16} /> Admin view</span></div>
    <section className="stats-grid admin-stats">
      <StatCard label="All requests" value={summary?.total ?? safeRequests.length} note="From the campus" icon={ClipboardList} tone="blue" />
      <StatCard label="Needs review" value={summary?.pending ?? safeRequests.filter((item) => item.status === 'Pending').length} note="Awaiting assignment" icon={Clock3} tone="amber" />
      <StatCard label="Being handled" value={summary?.progress ?? safeRequests.filter((item) => item.status === 'In Progress').length} note="Active work orders" icon={Wrench} tone="violet" />
      <StatCard label="Completed" value={summary?.resolved ?? safeRequests.filter((item) => item.status === 'Resolved').length} note="Closed successfully" icon={CheckCircle2} tone="green" />
    </section>
    <section className="panel admin-table-panel"><div className="panel-heading"><div><span className="eyebrow">CAMPUS-WIDE INBOX</span><h2>All requests <span className="count-chip">{filtered.length}</span></h2></div><span className="table-note"><span className="online-dot admin-dot" /> Live updates</span></div><Filters search={search} setSearch={setSearch} category={category} setCategory={setCategory} status={status} setStatus={setStatus} categories={safeCategories.map((item) => item?.name).filter(Boolean)} placeholder="Search all requests..." />{loading ? <div className="workspace-loading" role="status">Loading all requests…</div> : <RequestTable requests={filtered} admin onStatusChange={onStatusChange} onAssign={onAssign} currentAdminId={currentAdminId} onDelete={onDelete} onOpen={onOpen} emptyMessage="No maintenance requests have been submitted yet." />}</section>
    <div className="admin-footnote"><Trash2 size={14} /> Deleting a request removes it from the student view too. Please confirm each deletion.</div>
  </>
}
