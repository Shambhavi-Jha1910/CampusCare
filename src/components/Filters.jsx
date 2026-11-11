import { Search, SlidersHorizontal, X } from 'lucide-react'

export default function Filters({ search, setSearch, category, setCategory, status, setStatus, categories = [], includeStatus = true, placeholder = 'Search requests...' }) {
  return (
    <div className="filters">
      <label className="filter-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={placeholder} /><span className="filter-search-icon"><SlidersHorizontal size={15} /></span></label>
      <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((name) => <option key={name}>{name}</option>)}</select>
      {includeStatus && <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option value="">All statuses</option><option>Pending</option><option>In Progress</option><option>Resolved</option></select>}
      {(search || category || status) && <button className="clear-filters" onClick={() => { setSearch(''); setCategory(''); setStatus('') }} aria-label="Clear filters"><X size={15} /> Clear</button>}
    </div>
  )
}
