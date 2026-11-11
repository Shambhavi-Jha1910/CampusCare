import { useMemo } from 'react'
import { ClipboardList, Clock3, Wrench, CheckCircle2, ArrowRight, Plus, ArrowUpRight, CalendarDays } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import RequestTable from '../components/RequestTable.jsx'
import Filters from '../components/Filters.jsx'
import { formatDate } from '../components/RequestTable.jsx'

export default function Dashboard({ requests, summary, categories, user, role, setPage, search, setSearch, category, setCategory, status, setStatus, onOpen, loading }) {
  const stats = useMemo(() => ({
    total: summary?.total ?? requests.length,
    pending: summary?.pending ?? requests.filter((request) => request.status === 'Pending').length,
    progress: summary?.progress ?? requests.filter((request) => request.status === 'In Progress').length,
    resolved: summary?.resolved ?? requests.filter((request) => request.status === 'Resolved').length,
  }), [requests, summary])
  const filtered = requests.filter((request) => {
    const query = search.toLowerCase()
    return (!query || [request.id, request.title, request.category, request.location].some((value) => value.toLowerCase().includes(query)))
      && (!category || request.category === category) && (!status || request.status === status)
  }).slice().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5)
  const activity = requests.slice().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 3)

  return (
    <>
      <div className="page-heading heading-with-action">
        <div><span className="eyebrow">OVERVIEW</span><h1>Welcome back, {user.name} <span className="wave">✦</span></h1><p>Here's an overview of campus maintenance requests.</p></div>
        <button className="button button-primary" onClick={() => setPage('submit')}><Plus size={17} /> Submit new request</button>
      </div>
      <section className="stats-grid" aria-label="Request statistics">
        <StatCard label="Total requests" value={stats.total} note="Across campus" icon={ClipboardList} tone="blue" />
        <StatCard label="Pending requests" value={stats.pending} note="Awaiting review" icon={Clock3} tone="amber" />
        <StatCard label="In progress" value={stats.progress} note="Being worked on" icon={Wrench} tone="violet" />
        <StatCard label="Resolved" value={stats.resolved} note="Successfully fixed" icon={CheckCircle2} tone="green" />
      </section>
      <section className="dashboard-columns">
        <div className="panel recent-panel">
          <div className="panel-heading"><div><span className="eyebrow">STAY IN THE LOOP</span><h2>Recent requests</h2></div><button className="text-button" onClick={() => setPage(role === 'Admin' ? 'admin' : 'requests')}>View all <ArrowRight size={15} /></button></div>
          <Filters search={search} setSearch={setSearch} category={category} setCategory={setCategory} status={status} setStatus={setStatus} categories={categories.map((item) => item.name)} />
          {loading ? <div className="workspace-loading" role="status">Loading requests…</div> : <RequestTable requests={filtered} onOpen={onOpen} />}
        </div>
        <aside className="dashboard-rail">
          <div className="panel activity-panel">
            <div className="panel-heading"><div><span className="eyebrow">WHAT'S HAPPENING</span><h2>Recent activity</h2></div><button className="icon-button light-icon" aria-label="Activity options"><ArrowUpRight size={17} /></button></div>
            {activity.length ? <div className="activity-list">{activity.map((request, index) => (
              <button className="activity-item" key={request.id} onClick={() => onOpen(request)}>
                <span className={`activity-icon activity-${request.status.toLowerCase().replace(' ', '-')}`}>{index === 0 ? <Plus size={15} /> : <Wrench size={15} />}</span>
                <span className="activity-copy"><strong>{request.status === 'Resolved' ? 'Request resolved' : request.status === 'In Progress' ? 'Work in progress' : 'New request submitted'}</strong><span>{request.title} · {formatDate(request.submittedAt)}</span></span>
                <ArrowUpRight size={14} className="activity-arrow" />
              </button>
            ))}</div> : <p className="rail-empty">New activity will appear here.</p>}
            <button className="activity-link" onClick={() => setPage(role === 'Admin' ? 'admin' : 'requests')}>See all activity <ArrowRight size={14} /></button>
          </div>
          <div className="panel summary-panel">
            <div className="panel-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Request status</h2></div><CalendarDays size={17} className="muted-icon" /></div>
            <div className="summary-total"><strong>{stats.total}</strong><span>total requests</span></div>
            <div className="summary-bar"><span className="bar-resolved" style={{ width: `${stats.total ? stats.resolved / stats.total * 100 : 0}%` }} /><span className="bar-progress" style={{ width: `${stats.total ? stats.progress / stats.total * 100 : 0}%` }} /><span className="bar-pending" style={{ width: `${stats.total ? stats.pending / stats.total * 100 : 0}%` }} /></div>
            <div className="summary-legend"><span><i className="legend-green" />Resolved <b>{stats.resolved}</b></span><span><i className="legend-blue" />In progress <b>{stats.progress}</b></span><span><i className="legend-amber" />Pending <b>{stats.pending}</b></span></div>
          </div>
        </aside>
      </section>
    </>
  )
}
