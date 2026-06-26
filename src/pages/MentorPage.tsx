import type { FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Row } from '../components/Row'
import type { Recommendation } from '../types'
import { formatDate } from '../utils/format'

export function MentorPage({ recommendations, generateRecommendation, askMentor, prompt, setPrompt, mentorAnswer, loading }: {
  recommendations: Recommendation[]
  generateRecommendation: () => void
  askMentor: (event: FormEvent) => void
  prompt: string
  setPrompt: (prompt: string) => void
  mentorAnswer: string
  loading: boolean
}) {
  return (
    <div className="split">
      <form className="panel form-grid" onSubmit={askMentor}>
        <h2>Pregunta al mentor</h2>`r`n        <p className="hint">Si el backend tiene GEMINI_API_KEY, responde Gemini. Si no, responde el mentor local para que puedas probar el flujo completo.</p>
        <label>Prompt<textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={1200} /></label>
        <button className="primary" disabled={loading}>Consultar mentor</button>
        {mentorAnswer && <p className="answer-box">{mentorAnswer}</p>}
      </form>
      <section className="list-panel wide"><div className="section-title"><h2>Recomendaciones</h2><button className="ghost" onClick={generateRecommendation} disabled={loading}>Generar</button></div>{recommendations.length === 0 ? <EmptyState title="Sin recomendaciones guardadas" detail="Presiona Generar para crear una recomendacion basada en tu plan y progreso." /> : recommendations.map((rec) => <Row key={rec.id} title={rec.content} meta={`${rec.recommendationType} · ${formatDate(rec.generatedAt)}`} value={`${rec.relevance}/100`} />)}</section>
    </div>
  )
}


