import { EmptyState } from '../components/EmptyState'
import { Metric } from '../components/Metric'
import { Row } from '../components/Row'
import type { Listing, Material, Planner, Progress, Recommendation, Transaction } from '../types'
import { formatDate, money } from '../utils/format'

export function DashboardPage({ planner, progress, recommendations, materials, listings, transactions }: { planner: Planner | null; progress: Progress | null; recommendations: Recommendation[]; materials: Material[]; listings: Listing[]; transactions: Transaction[] }) {
  return (
    <div className="stack">
      <section className="metrics-grid">
        <Metric label="Horas estudiadas" value={progress?.studyHours ?? 0} detail="registradas" />
        <Metric label="Metas completas" value={progress?.completedGoals ?? 0} detail="objetivos" />
        <Metric label="Racha" value={progress?.currentStreak ?? 0} detail="dias activos" />
        <Metric label="Materiales" value={materials.length} detail="disponibles" />
      </section>
      <section className="split">
        <article className="panel">
          <h2>Plan actual</h2>
          {planner ? <p>{planner.weeklyGoal}</p> : <p className="muted">Crea un plan semanal para activar tu ruta de estudio.</p>}
          <div className="detail-row"><span>Prioridad</span><strong>{planner?.priority ?? 'Sin definir'}</strong></div>
          <div className="detail-row"><span>Meta</span><strong>{planner?.targetHours ?? 0} h</strong></div>
        </article>
        <article className="panel">
          <h2>Ultima recomendacion</h2>
          {recommendations[0] ? <p>{recommendations[0].content}</p> : <p className="muted">Genera una recomendacion desde Mentor IA.</p>}
          <div className="detail-row"><span>Relevancia</span><strong>{recommendations[0]?.relevance ?? 0}/100</strong></div>
        </article>
      </section>
      <section className="list-panel">
        <div className="section-title"><h2>Actividad reciente</h2><span>{transactions.length} transacciones</span></div>
        {transactions.length === 0 ? <EmptyState title="Sin compras todavia" detail="Publica materiales y prueba el marketplace con otro usuario." /> : transactions.slice(0, 4).map((tx) => <Row key={tx.id} title={tx.materialTitle} meta={`${tx.paymentMethod} · ${formatDate(tx.transactionDate)}`} value={money(tx.amount)} />)}
      </section>
      <section className="list-panel">
        <div className="section-title"><h2>Marketplace activo</h2><span>{listings.length} publicaciones</span></div>
        {listings.length === 0 ? <EmptyState title="Marketplace vacio" detail="Crea un material y luego agregalo como publicacion." /> : <div className="cards-grid compact">{listings.slice(0, 3).map((listing) => <article className="mini-card" key={listing.id}><strong>{listing.materialTitle}</strong><span>{listing.transactionType} · stock {listing.stock}</span></article>)}</div>}
      </section>
    </div>
  )
}
