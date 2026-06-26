import type { View } from '../types'
import { viewLabel } from '../utils/views'

export function Topbar({ view, loading, onRefresh }: { view: View; loading: boolean; onRefresh: () => void }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Panel web</p>
        <h1>{viewLabel(view)}</h1>
      </div>
      <button className="ghost" onClick={onRefresh} disabled={loading} type="button">Actualizar</button>
    </header>
  )
}
