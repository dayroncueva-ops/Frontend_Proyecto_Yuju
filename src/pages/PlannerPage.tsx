import type { FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import type { Planner, PlannerForm, Progress, ProgressForm } from '../types'
import { formatDate } from '../utils/format'

export function PlannerPage({ plannerForm, setPlannerForm, progressForm, setProgressForm, savePlanner, saveProgress, loading, planners, progress }: {
  plannerForm: PlannerForm
  setPlannerForm: (form: PlannerForm) => void
  progressForm: ProgressForm
  setProgressForm: (form: ProgressForm) => void
  savePlanner: (event: FormEvent) => void
  saveProgress: (event: FormEvent) => void
  loading: boolean
  planners: Planner[]
  progress: Progress | null
}) {
  return (
    <div className="split">
      <form className="panel form-grid" onSubmit={savePlanner}>
        <h2>Plan semanal</h2>
        <label>Objetivo<input required value={plannerForm.weeklyGoal} onChange={(e) => setPlannerForm({ ...plannerForm, weeklyGoal: e.target.value })} /></label>
        <label>Horas objetivo<input required min={1} type="number" value={plannerForm.targetHours} onChange={(e) => setPlannerForm({ ...plannerForm, targetHours: Number(e.target.value) })} /></label>
        <div className="field-row"><label>Inicio<input required type="date" value={plannerForm.startDate} onChange={(e) => setPlannerForm({ ...plannerForm, startDate: e.target.value })} /></label><label>Fin<input required type="date" value={plannerForm.endDate} onChange={(e) => setPlannerForm({ ...plannerForm, endDate: e.target.value })} /></label></div>
        <div className="field-row"><label>Prioridad<select value={plannerForm.priority} onChange={(e) => setPlannerForm({ ...plannerForm, priority: e.target.value as PlannerForm['priority'] })}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label><label>Estado<select value={plannerForm.planStatus} onChange={(e) => setPlannerForm({ ...plannerForm, planStatus: e.target.value as PlannerForm['planStatus'] })}><option>ACTIVE</option><option>PAUSED</option><option>COMPLETED</option><option>CANCELLED</option></select></label></div>
        <button className="primary" disabled={loading}>Guardar plan</button>
      </form>
      <form className="panel form-grid" onSubmit={saveProgress}>
        <h2>Progreso</h2>
        <label>Horas estudiadas<input required min={0} type="number" value={progressForm.studyHours} onChange={(e) => setProgressForm({ ...progressForm, studyHours: Number(e.target.value) })} /></label>
        <label>Metas completadas<input required min={0} type="number" value={progressForm.completedGoals} onChange={(e) => setProgressForm({ ...progressForm, completedGoals: Number(e.target.value) })} /></label>
        <label>Racha actual<input required min={0} type="number" value={progressForm.currentStreak} onChange={(e) => setProgressForm({ ...progressForm, currentStreak: Number(e.target.value) })} /></label>
        <label>Motivacion<input min={1} max={10} type="range" value={progressForm.motivationLevel} onChange={(e) => setProgressForm({ ...progressForm, motivationLevel: Number(e.target.value) })} /><span className="range-value">{progressForm.motivationLevel}/10</span></label>
        <button className="primary" disabled={loading}>Guardar progreso</button>
      </form>
      <article className="panel wide">
        <h2>Planes guardados</h2>
        {planners.length === 0 ? <EmptyState title="Sin planes activos" detail="Guarda un plan para verlo en esta lista. Los planes vencidos se retiran automaticamente." /> : (
          <div className="cards-grid compact">
            {planners.map((plan) => (
              <article className="mini-card" key={plan.id}>
                <strong>{plan.weeklyGoal}</strong>
                <span>{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
                <div className="detail-row"><span>{plan.priority}</span><strong>{plan.targetHours} h</strong></div>
                <span>{plan.planStatus}</span>
              </article>
            ))}
          </div>
        )}
      </article>
      <article className="panel wide">
        <h2>Resumen de progreso</h2>
        <div className="summary-grid">
          <div><span>Horas</span><strong>{progress?.studyHours ?? 0}</strong></div>
          <div><span>Metas</span><strong>{progress?.completedGoals ?? 0}</strong></div>
          <div><span>Racha</span><strong>{progress?.currentStreak ?? 0}</strong></div>
          <div><span>Ultima actualizacion</span><strong>{formatDate(progress?.lastUpdatedAt)}</strong></div>
        </div>
      </article>
    </div>
  )
}
