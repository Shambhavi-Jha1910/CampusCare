export default function StatCard({ label, value, note, icon: Icon, tone, trend }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-top"><span className="stat-icon"><Icon size={19} strokeWidth={2} /></span><span className="stat-note">{note}</span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-bottom"><span>{label}</span>{trend && <span className="stat-trend">{trend}</span>}</div>
    </article>
  )
}
