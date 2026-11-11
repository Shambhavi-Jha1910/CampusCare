import { ClipboardList, Clock3, CheckCircle2 } from 'lucide-react'
import Filters from '../components/Filters.jsx'
import RequestTable from '../components/RequestTable.jsx'

export default function MyRequests({ requests, categories, search, setSearch, category, setCategory, status, setStatus, onOpen, loading }) {
  const counts = { total: requests.length, open: requests.filter((item) => item.status !== 'Resolved').length, resolved: requests.filter((item) => item.status === 'Resolved').length }
  const filtered = requests.filter((request) => {
    const query = search.toLowerCase()
    return (!query || [request.id, request.title, request.category, request.location].some((value) => value.toLowerCase().includes(query)))
      && (!category || request.category === category) && (!status || request.status === status)
  }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
  return <>
    <div className="page-heading"><span className="eyebrow">YOUR ACTIVITY</span><h1>My requests</h1><p>Keep an eye on the issues you've reported around campus.</p></div>
    <div className="mini-stats"><div><ClipboardList size={17} /><strong>{counts.total}</strong><span>Total submitted</span></div><div><Clock3 size={17} /><strong>{counts.open}</strong><span>Still in progress</span></div><div><CheckCircle2 size={17} /><strong>{counts.resolved}</strong><span>Resolved</span></div></div>
    <section className="panel requests-page-panel"><div className="panel-heading"><div><span className="eyebrow">REQUEST HISTORY</span><h2>All requests <span className="count-chip">{filtered.length}</span></h2></div></div><Filters search={search} setSearch={setSearch} category={category} setCategory={setCategory} status={status} setStatus={setStatus} categories={categories.map((item) => item.name)} />{loading ? <div className="workspace-loading" role="status">Loading your requests…</div> : <RequestTable requests={filtered} onOpen={onOpen} />}</section>
  </>
}
