import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Navbar from './components/Navbar.jsx'
import Toast from './components/Toast.jsx'
import RequestModal from './components/RequestModal.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SubmitRequest from './pages/SubmitRequest.jsx'
import MyRequests from './pages/MyRequests.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Settings from './pages/Settings.jsx'
import AuthPage from './pages/AuthPage.jsx'
import { api, backendPriority, backendStatus, isUnauthorized, normalizeRequest, normalizeRequestList, normalizeSummary } from './services/api.js'
import './styles/dashboard.css'

function frontendHistory(history) {
  return history.map((entry) => ({
    ...entry,
    newStatus: entry.newStatus === 'IN_PROGRESS'
      ? 'In Progress'
      : entry.newStatus[0] + entry.newStatus.slice(1).toLowerCase(),
  }))
}

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPageState] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toast, setToast] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [categories, setCategories] = useState([])
  const [requests, setRequests] = useState([])
  const [summary, setSummary] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [authError, setAuthError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const isAdmin = user?.role === 'ADMIN'
  const getRequestFilters = () => {
    const categoryId = categories.find((category) => category.name === categoryFilter)?.id
    return {
      ...(search.trim() ? { query: search.trim() } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(statusFilter ? { status: backendStatus(statusFilter) } : {}),
      page: 0,
      size: 100,
    }
  }
  const hasRequestFilters = Boolean(search.trim() || categoryFilter || statusFilter)

  useEffect(() => {
    let active = true
    Promise.all([
      api.categories(),
      api.me().catch((requestError) => {
        if (isUnauthorized(requestError)) return null
        throw requestError
      }),
    ]).then(([categoryData, currentUser]) => {
      if (!active) return
      setCategories(categoryData)
      setUser(currentUser)
      if (currentUser?.role === 'ADMIN') setPageState('admin')
    }).catch((requestError) => {
      if (!active) return
      setAuthError(requestError.message || 'CampusCare could not be reached. Check the backend connection.')
    }).finally(() => {
      if (active) setInitializing(false)
    })
    return () => { active = false }
  }, [])

  const loadPageData = useCallback(async () => {
    if (!user) return
    setDataLoading(true)
    setError('')
    try {
      const filters = getRequestFilters()
      if (page === 'dashboard') {
        const [requestData, summaryData] = await Promise.all([
          isAdmin
            ? hasRequestFilters
              ? api.adminRequests(filters)
              : api.recentRequests(5)
            : hasRequestFilters
              ? api.myRequests(filters)
              : api.recentRequests(5),
          isAdmin ? api.adminSummary() : api.studentSummary(),
        ])
        setRequests(normalizeRequestList(requestData))
        setSummary(normalizeSummary(summaryData))
      } else if (page === 'requests' && !isAdmin) {
        const result = await api.myRequests(filters)
        setRequests(normalizeRequestList(result))
        setSummary(null)
      } else if (page === 'admin' && isAdmin) {
        const [result, summaryData] = await Promise.all([
          api.adminRequests(filters),
          api.adminSummary(),
        ])
        setRequests(normalizeRequestList(result))
        setSummary(normalizeSummary(summaryData))
      }
    } catch (requestError) {
      if (isUnauthorized(requestError)) {
        setUser(null)
        setPageState('dashboard')
        setAuthError('Your session has expired. Please sign in again.')
      } else if (requestError.status === 403) {
        setPageState('dashboard')
        setError('Your account does not have permission to view this page.')
      } else {
        setError(requestError.message || 'Could not load data from CampusCare.')
      }
    } finally {
      setDataLoading(false)
    }
  }, [user, isAdmin, page, search, categoryFilter, statusFilter, categories, hasRequestFilters])

  useEffect(() => {
    if (!user || initializing) return undefined
    const timer = window.setTimeout(loadPageData, search ? 250 : 0)
    return () => window.clearTimeout(timer)
  }, [user, initializing, loadPageData, refreshKey, search])

  const setPage = (nextPage) => {
    if (nextPage === 'admin' && !isAdmin) {
      setPageState('dashboard')
      setError('Admin access is required for that page.')
      return
    }
    if (nextPage === 'submit' && isAdmin) {
      setPageState('admin')
      return
    }
    setPageState(nextPage)
    setSearch('')
    setCategoryFilter('')
    setStatusFilter('')
    setError('')
  }

  const signIn = async (credentials) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const loggedInUser = await api.login({ email: credentials.email.trim(), password: credentials.password })
      setUser(loggedInUser)
      setPageState(loggedInUser.role === 'ADMIN' ? 'admin' : 'dashboard')
      setSearch('')
      setCategoryFilter('')
      setStatusFilter('')
      setToast({ title: 'Signed in', message: `Welcome, ${loggedInUser.name}.` })
    } catch (requestError) {
      setAuthError(requestError.message || 'Sign in failed.')
    } finally {
      setAuthLoading(false)
    }
  }

  const register = async (details) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      await api.register({
        name: details.name.trim(),
        email: details.email.trim(),
        password: details.password,
      })
      await signIn(details)
    } catch (requestError) {
      setAuthError(requestError.message || 'Registration failed.')
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (requestError) {
      if (!isUnauthorized(requestError)) setToast({ type: 'error', title: 'Sign out issue', message: requestError.message })
    } finally {
      setUser(null)
      setRequests([])
      setSummary(null)
      setSelectedRequest(null)
      setPageState('dashboard')
      setSearch('')
      setAuthError('')
    }
  }

  const submitRequest = async (form) => {
    try {
      const created = await api.createRequest({
        title: form.title.trim(),
        categoryId: form.categoryId,
        location: form.location.trim(),
        description: form.description.trim(),
        priority: backendPriority(form.priority),
      })
      setPageState('requests')
      setSearch('')
      setRefreshKey((current) => current + 1)
      setToast({ title: 'Request submitted', message: `${created.id} has been sent to the facilities team.` })
      return true
    } catch (requestError) {
      if (isUnauthorized(requestError)) {
        setUser(null)
        setAuthError('Please sign in again to submit a request.')
      } else {
        setToast({ type: 'error', title: 'Request not submitted', message: requestError.message })
      }
      return false
    }
  }

  const openRequest = async (request) => {
    setSelectedRequest(request)
    try {
      const [details, history] = await Promise.all([
        api.requestDetails(request.id),
        api.requestHistory(request.id),
      ])
      setSelectedRequest({ ...normalizeRequest(details), history: frontendHistory(history) })
    } catch (requestError) {
      if (!isUnauthorized(requestError)) {
        setToast({ type: 'error', title: 'Could not load request details', message: requestError.message })
      }
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.updateStatus(id, backendStatus(status))
      setRefreshKey((current) => current + 1)
      setToast({ title: 'Status updated', message: `${id} is now ${status.toLowerCase()}.` })
    } catch (requestError) {
      setToast({ type: 'error', title: 'Status not updated', message: requestError.message })
      setRefreshKey((current) => current + 1)
    }
  }

  const assignRequest = async (id, adminId) => {
    try {
      await api.assignRequest(id, adminId)
      setRefreshKey((current) => current + 1)
      setToast({ title: 'Request assigned', message: `${id} was assigned to you.` })
    } catch (requestError) {
      setToast({ type: 'error', title: 'Assignment failed', message: requestError.message })
    }
  }

  const deleteRequest = async (request) => {
    if (!window.confirm(`Delete ${request.id} — "${request.title}"? This will remove it from the student view as well.`)) return
    try {
      await api.deleteRequest(request.id)
      setRefreshKey((current) => current + 1)
      setToast({ title: 'Request deleted', message: `${request.id} has been removed.` })
    } catch (requestError) {
      setToast({ type: 'error', title: 'Request not deleted', message: requestError.message })
    }
  }

  if (initializing) {
    return <main className="auth-page"><div className="workspace-loading" role="status">Connecting to CampusCare…</div></main>
  }

  if (!user) {
    return <><AuthPage onLogin={signIn} onRegister={register} error={authError} loading={authLoading} /><Toast toast={toast} onClose={() => setToast(null)} /></>
  }

  return <div className="app-shell">
    <Sidebar page={page} setPage={setPage} user={user} open={mobileNav} onClose={() => setMobileNav(false)} onLogout={logout} />
    <main className="main-area">
      <Navbar user={user} search={search} setSearch={setSearch} onMenu={() => setMobileNav(true)} onLogout={logout} />
      <div className="content-area">
        {error && <div className="api-error-banner" role="alert"><AlertCircle size={16} /><span>{error}</span><button onClick={() => { setError(''); setRefreshKey((current) => current + 1) }}>Retry</button></div>}
        {page === 'dashboard' && <Dashboard requests={requests} summary={summary} categories={categories} user={user} role={isAdmin ? 'Admin' : 'Student'} setPage={setPage} search={search} setSearch={setSearch} category={categoryFilter} setCategory={setCategoryFilter} status={statusFilter} setStatus={setStatusFilter} onOpen={openRequest} loading={dataLoading} />}
        {page === 'submit' && !isAdmin && <SubmitRequest onSubmit={submitRequest} setPage={setPage} categories={categories} busy={!categories.length} />}
        {page === 'requests' && !isAdmin && <MyRequests requests={requests} categories={categories} search={search} setSearch={setSearch} category={categoryFilter} setCategory={setCategoryFilter} status={statusFilter} setStatus={setStatusFilter} onOpen={openRequest} loading={dataLoading} />}
        {page === 'admin' && isAdmin && <AdminDashboard requests={requests} categories={categories} summary={summary} search={search} setSearch={setSearch} category={categoryFilter} setCategory={setCategoryFilter} status={statusFilter} setStatus={setStatusFilter} onStatusChange={updateStatus} onAssign={assignRequest} currentAdminId={user.id} onDelete={deleteRequest} onOpen={openRequest} loading={dataLoading} />}
        {page === 'settings' && <Settings user={user} />}
        <footer className="page-footer"><span>© 2026 CampusCare</span><span>Made for a better campus <span className="footer-heart">♥</span></span><button onClick={() => setToast({ title: 'Connected', message: 'CampusCare API is responding.' })}><CheckCircle2 size={14} /> API connected</button></footer>
      </div>
    </main>
    <Toast toast={toast} onClose={() => setToast(null)} />
    <RequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
  </div>
}
