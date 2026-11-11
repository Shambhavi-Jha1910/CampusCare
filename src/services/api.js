const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '')

let csrfToken = null
let csrfHeader = 'X-CSRF-TOKEN'

export class ApiError extends Error {
  constructor(message, status, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function getCsrfToken(forceRefresh = false) {
  if (csrfToken && !forceRefresh) return
  const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw await readError(response)
  const data = await response.json()
  csrfHeader = data.headerName
  csrfToken = data.token
}

async function readError(response) {
  let payload = {}
  try {
    payload = await response.json()
  } catch {
    payload = {}
  }
  const validation = payload.validationErrors
    ? Object.entries(payload.validationErrors).map(([field, message]) => `${field}: ${message}`).join(' ')
    : ''
  const message = validation || payload.message || (
    response.status === 404
      ? 'Backend API route not found. Check VITE_API_BASE_URL and that the Phase 2 API is running.'
      : payload.error || `Request failed (${response.status}).`
  )
  return new ApiError(
    message,
    response.status,
    payload,
  )
}

async function request(path, { method = 'GET', body, headers = {}, retryCsrf = true } = {}) {
  const upperMethod = method.toUpperCase()
  const requestHeaders = { Accept: 'application/json', ...headers }
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json'
  if (!['GET', 'HEAD', 'OPTIONS'].includes(upperMethod)) {
    await getCsrfToken()
    requestHeaders[csrfHeader] = csrfToken
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: upperMethod,
    credentials: 'include',
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 403 && !['GET', 'HEAD', 'OPTIONS'].includes(upperMethod) && retryCsrf) {
    csrfToken = null
    await getCsrfToken(true)
    return request(path, { method, body, headers, retryCsrf: false })
  }
  if (!response.ok) throw await readError(response)
  if (response.status === 204) return null
  return response.json()
}

export const api = {
  async csrf() {
    csrfToken = null
    await getCsrfToken(true)
  },
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: async (data) => {
    const user = await request('/auth/login', { method: 'POST', body: data })
    csrfToken = null
    await getCsrfToken(true)
    return user
  },
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  categories: () => request('/request-categories'),
  studentSummary: () => request('/dashboard/student/summary'),
  adminSummary: () => request('/dashboard/admin/summary'),
  recentRequests: (limit = 5) => request(`/requests/recent?limit=${limit}`),
  myRequests: (params = {}) => request(`/requests/mine?${new URLSearchParams(params)}`),
  adminRequests: (params = {}) => request(`/admin/requests?${new URLSearchParams(params)}`),
  createRequest: (data) => request('/requests', { method: 'POST', body: data }),
  requestDetails: (id) => request(`/requests/${encodeURIComponent(id)}`),
  requestHistory: (id) => request(`/requests/${encodeURIComponent(id)}/history`),
  updateStatus: (id, status, note = '') => request(`/admin/requests/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status, note },
  }),
  assignRequest: (id, adminUserId) => request(`/admin/requests/${encodeURIComponent(id)}/assignment`, {
    method: 'PATCH',
    body: { adminUserId },
  }),
  deleteRequest: (id) => request(`/admin/requests/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}

export function normalizeRequest(request) {
  if (!request || typeof request !== 'object') {
    throw new Error('The backend returned an invalid request record.')
  }
  const status = typeof request.status === 'string' ? request.status : 'PENDING'
  const priority = typeof request.priority === 'string' ? request.priority : 'MEDIUM'
  return {
    id: request.id ?? '',
    title: request.title ?? 'Untitled request',
    category: request.category ?? 'Uncategorized',
    categoryId: request.categoryId,
    location: request.location,
    description: request.description,
    priority: priority === 'HIGH' ? 'High' : priority === 'LOW' ? 'Low' : 'Medium',
    status: status === 'IN_PROGRESS' ? 'In Progress' : status[0] + status.slice(1).toLowerCase(),
    submittedAt: request.submittedAt,
    submittedBy: request.submittedBy ?? '',
    studentId: request.studentId,
    assignedAdminId: request.assignedAdminId,
    assignedAdmin: request.assignedAdmin,
  }
}

export function normalizeRequestList(response) {
  if (Array.isArray(response)) return response.map(normalizeRequest)
  if (Array.isArray(response?.items)) return response.items.map(normalizeRequest)
  throw new Error('The backend returned an unexpected request list. Expected an array or an items array.')
}

export function normalizeSummary(summary = {}) {
  return {
    total: Number.isFinite(summary?.total) ? summary.total : 0,
    pending: Number.isFinite(summary?.pending) ? summary.pending : 0,
    progress: Number.isFinite(summary?.inProgress) ? summary.inProgress : 0,
    resolved: Number.isFinite(summary?.resolved) ? summary.resolved : 0,
  }
}

export function backendStatus(status) {
  return status.toUpperCase().replace(' ', '_')
}

export function backendPriority(priority) {
  return priority.toUpperCase()
}

export function isUnauthorized(error) {
  return error instanceof ApiError && error.status === 401
}
