import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { initialListing, initialMaterial, initialPlanner, initialProgress } from './config'
import { Notice } from './components/Notice'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { MaterialsPage } from './pages/MaterialsPage'
import { MarketplacePage } from './pages/MarketplacePage'
import { MentorPage } from './pages/MentorPage'
import { PlannerPage } from './pages/PlannerPage'
import { clearSession, getStoredSession, login, register, storeSession } from './services/authService'
import * as workspace from './services/workspaceService'
import type { AuthMode, Listing, ListingForm, Material, MaterialForm, Notice as NoticeType, PaymentMethod, Planner, PlannerForm, Progress, ProgressForm, Recommendation, Session, Transaction, View } from './types'

type WorkspaceState = {
  materials: Material[]
  listings: Listing[]
  transactions: Transaction[]
  planner: Planner | null
  progress: Progress | null
  recommendations: Recommendation[]
}

const emptyWorkspace: WorkspaceState = {
  materials: [],
  listings: [],
  transactions: [],
  planner: null,
  progress: null,
  recommendations: [],
}

function App() {
  const [session, setSession] = useState<Session | null>(() => getStoredSession())
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [view, setView] = useState<View>('dashboard')
  const [notice, setNotice] = useState<NoticeType>(null)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<WorkspaceState>(emptyWorkspace)
  const [mentorAnswer, setMentorAnswer] = useState('')

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', email: '', password: '', username: '', age: 18 })
  const [plannerForm, setPlannerForm] = useState<PlannerForm>(initialPlanner)
  const [progressForm, setProgressForm] = useState<ProgressForm>(initialProgress)
  const [materialForm, setMaterialForm] = useState<MaterialForm>(initialMaterial)
  const [listingForm, setListingForm] = useState<ListingForm>(initialListing)
  const [prompt, setPrompt] = useState('Como puedo organizarme mejor para estudiar esta semana?')

  const token = session?.accessToken ?? ''

  const loadWorkspace = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [materials, listings, planner, progress, recommendations, transactions] = await Promise.allSettled([
        workspace.getMaterials(token),
        workspace.getListings(token),
        workspace.getPlanner(token),
        workspace.getProgress(token),
        workspace.getRecommendations(token),
        workspace.getTransactions(token),
      ])

      setData({
        materials: materials.status === 'fulfilled' ? materials.value : [],
        listings: listings.status === 'fulfilled' ? listings.value : [],
        planner: planner.status === 'fulfilled' ? planner.value : null,
        progress: progress.status === 'fulfilled' ? progress.value : null,
        recommendations: recommendations.status === 'fulfilled' ? recommendations.value : [],
        transactions: transactions.status === 'fulfilled' ? transactions.value : [],
      })
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (session) void loadWorkspace()
  }, [session, loadWorkspace])

  useEffect(() => {
    if (!data.planner) return
    setPlannerForm({
      weeklyGoal: data.planner.weeklyGoal,
      targetHours: data.planner.targetHours,
      startDate: data.planner.startDate,
      endDate: data.planner.endDate,
      priority: data.planner.priority,
      planStatus: data.planner.planStatus,
    })
  }, [data.planner])

  useEffect(() => {
    if (!data.progress) return
    setProgressForm({
      studyHours: data.progress.studyHours,
      completedGoals: data.progress.completedGoals,
      currentStreak: data.progress.currentStreak,
      motivationLevel: data.progress.motivationLevel,
    })
  }, [data.progress])

  async function runAction(action: () => Promise<void>) {
    setLoading(true)
    setNotice(null)
    try {
      await action()
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'No se pudo completar la accion.' })
    } finally {
      setLoading(false)
    }
  }

  function saveSession(authSession: Session) {
    storeSession(authSession)
    setSession(authSession)
  }

  async function submitLogin(event: FormEvent) {
    event.preventDefault()
    await runAction(async () => {
      saveSession(await login(loginForm))
      setNotice({ type: 'ok', message: 'Sesion iniciada correctamente.' })
    })
  }

  async function submitRegister(event: FormEvent) {
    event.preventDefault()
    await runAction(async () => {
      saveSession(await register(registerForm))
      setNotice({ type: 'ok', message: 'Cuenta creada y sesion iniciada.' })
    })
  }

  function logout() {
    clearSession()
    setSession(null)
    setData(emptyWorkspace)
    setNotice(null)
  }

  async function savePlanner(event: FormEvent) {
    event.preventDefault()
    await runAction(async () => {
      const planner = await workspace.savePlanner(token, plannerForm)
      setData((current) => ({ ...current, planner }))
      setNotice({ type: 'ok', message: 'Plan guardado correctamente.' })
    })
  }

  async function saveProgress(event: FormEvent) {
    event.preventDefault()
    await runAction(async () => {
      const progress = await workspace.saveProgress(token, progressForm)
      setData((current) => ({ ...current, progress }))
      setNotice({ type: 'ok', message: `Progreso guardado: ${progress.studyHours} horas, ${progress.completedGoals} metas y racha de ${progress.currentStreak} dias.` })
      const recommendations = await workspace.getRecommendations(token).catch(() => data.recommendations)
      setData((current) => ({ ...current, recommendations }))
    })
  }

  async function createMaterial(event: FormEvent) {
    event.preventDefault()
    await runAction(async () => {
      await workspace.createMaterial(token, materialForm)
      setMaterialForm(initialMaterial)
      setNotice({ type: 'ok', message: 'Material publicado. Ya puedes seleccionarlo en Marketplace.' })
      await loadWorkspace()
      setView('marketplace')
    })
  }

  async function createListing(event: FormEvent) {
    event.preventDefault()
    await runAction(async () => {
      await workspace.createListing(token, listingForm)
      setListingForm(initialListing)
      setNotice({ type: 'ok', message: 'Publicacion agregada al marketplace.' })
      await loadWorkspace()
    })
  }

  async function purchaseListing(id: number, paymentMethod: PaymentMethod) {
    await runAction(async () => {
      await workspace.purchaseListing(token, id, paymentMethod)
      setNotice({ type: 'ok', message: 'Transaccion creada correctamente.' })
      await loadWorkspace()
    })
  }

  async function generateRecommendation() {
    await runAction(async () => {
      const recommendation = await workspace.generateRecommendation(token)
      setData((current) => ({ ...current, recommendations: [recommendation, ...current.recommendations] }))
      setNotice({ type: 'ok', message: 'Recomendacion generada correctamente.' })
    })
  }

  async function askMentor(event: FormEvent) {
    event.preventDefault()
    await runAction(async () => {
      const answer = await workspace.askMentor(token, prompt)
      setMentorAnswer(answer.answer)
    })
  }

  if (!session) {
    return <AuthPage authMode={authMode} setAuthMode={setAuthMode} notice={notice} loading={loading} loginForm={loginForm} setLoginForm={setLoginForm} registerForm={registerForm} setRegisterForm={setRegisterForm} submitLogin={submitLogin} submitRegister={submitRegister} />
  }

  return (
    <main className="app-shell">
      <Sidebar session={session} view={view} setView={setView} logout={logout} />
      <section className="workspace">
        <Topbar view={view} loading={loading} onRefresh={loadWorkspace} />
        <Notice notice={notice} />
        {view === 'dashboard' && <DashboardPage planner={data.planner} progress={data.progress} recommendations={data.recommendations} materials={data.materials} listings={data.listings} transactions={data.transactions} />}
        {view === 'planner' && <PlannerPage plannerForm={plannerForm} setPlannerForm={setPlannerForm} progressForm={progressForm} setProgressForm={setProgressForm} savePlanner={savePlanner} saveProgress={saveProgress} loading={loading} planner={data.planner} progress={data.progress} />}
        {view === 'materials' && <MaterialsPage materials={data.materials} materialForm={materialForm} setMaterialForm={setMaterialForm} createMaterial={createMaterial} loading={loading} />}
        {view === 'marketplace' && <MarketplacePage listings={data.listings} materials={data.materials} listingForm={listingForm} setListingForm={setListingForm} createListing={createListing} purchaseListing={purchaseListing} loading={loading} transactions={data.transactions} currentUserId={session.user.id} />}
        {view === 'mentor' && <MentorPage recommendations={data.recommendations} generateRecommendation={generateRecommendation} askMentor={askMentor} prompt={prompt} setPrompt={setPrompt} mentorAnswer={mentorAnswer} loading={loading} />}
      </section>
    </main>
  )
}

export default App
