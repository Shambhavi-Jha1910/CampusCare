import { CheckCircle2, Clock3, Wrench } from 'lucide-react'

const statusIcons = {
  Pending: Clock3,
  'In Progress': Wrench,
  Resolved: CheckCircle2,
}

export default function StatusBadge({ status }) {
  const Icon = statusIcons[status] || Clock3
  return (
    <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
      <Icon size={13} strokeWidth={2.2} />
      {status}
    </span>
  )
}
