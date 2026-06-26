import type { FormEvent } from 'react'
import type { AuthMode, LoginForm, RegisterForm } from '../types'
import { Notice } from '../components/Notice'
import type { Notice as NoticeType } from '../types'

export function AuthPage({ authMode, setAuthMode, notice, loading, loginForm, setLoginForm, registerForm, setRegisterForm, submitLogin, submitRegister }: {
  authMode: AuthMode
  setAuthMode: (mode: AuthMode) => void
  notice: NoticeType
  loading: boolean
  loginForm: LoginForm
  setLoginForm: (form: LoginForm) => void
  registerForm: RegisterForm
  setRegisterForm: (form: RegisterForm) => void
  submitLogin: (event: FormEvent) => void
  submitRegister: (event: FormEvent) => void
}) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-mark">Y</div>
        <p className="eyebrow">Yuju Study Hub</p>
        <h1>Organiza tus estudios, comparte materiales y mejora tus habitos.</h1>
        <p className="lead">Frontend web conectado al backend Spring Boot: autenticacion, planificador, progreso, marketplace y mentor IA.</p>
        <div className="auth-tabs" role="tablist" aria-label="Autenticacion">
          <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')} type="button">Iniciar sesion</button>
          <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')} type="button">Crear cuenta</button>
        </div>
        <Notice notice={notice} />
        {authMode === 'login' ? (
          <form className="form-grid" onSubmit={submitLogin}>
            <label>Email<input required type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} /></label>
            <label>Password<input required type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} /></label>
            <button className="primary" disabled={loading}>{loading ? 'Conectando...' : 'Entrar'}</button>
          </form>
        ) : (
          <form className="form-grid two" onSubmit={submitRegister}>
            <label>Nombres<input required value={registerForm.firstName} onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })} /></label>
            <label>Apellidos<input required value={registerForm.lastName} onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })} /></label>
            <label>Email<input required type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} /></label>
            <label>Usuario<input required minLength={3} value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} /></label>
            <label>Edad<input required type="number" min={13} max={100} value={registerForm.age} onChange={(e) => setRegisterForm({ ...registerForm, age: Number(e.target.value) })} /></label>
            <label>Password<input required minLength={8} type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} /></label>
            <button className="primary full" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
          </form>
        )}
      </section>
    </main>
  )
}
