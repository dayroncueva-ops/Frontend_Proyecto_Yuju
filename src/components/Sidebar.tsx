import type { Session, View } from '../types'
import { allViews, viewLabel } from '../utils/views'

export function Sidebar({ session, view, setView, logout }: { session: Session; view: View; setView: (view: View) => void; logout: () => void }) {
  return (
    <aside className="sidebar">
      <div className="brand-row"><span className="brand-mark small">Y</span><div><strong>Yuju</strong><small>Study Hub</small></div></div>
      <nav>
        {allViews().map((item) => (
          <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)} type="button">{viewLabel(item)}</button>
        ))}
      </nav>
      <div className="profile-box">
        <strong>{session.user.firstName} {session.user.lastName}</strong>
        <span>@{session.user.username}</span>
        <button className="ghost" onClick={logout} type="button">Salir</button>
      </div>
    </aside>
  )
}
