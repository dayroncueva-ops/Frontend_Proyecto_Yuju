import type { FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import type { Material, MaterialForm } from '../types'
import { money } from '../utils/format'

export function MaterialsPage({ materials, materialForm, setMaterialForm, createMaterial, loading }: {
  materials: Material[]
  materialForm: MaterialForm
  setMaterialForm: (form: MaterialForm) => void
  createMaterial: (event: FormEvent) => void
  loading: boolean
}) {
  return (
    <div className="stack">
      <form className="panel form-grid two" onSubmit={createMaterial}>
        <h2 className="full">Nuevo material</h2>
        <label>Titulo<input required value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} /></label>
        <label>Categoria<input required value={materialForm.category} onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })} /></label>
        <label>Tipo<select value={materialForm.materialType} onChange={(e) => setMaterialForm({ ...materialForm, materialType: e.target.value as MaterialForm['materialType'] })}><option>PDF</option><option>VIDEO</option><option>NOTE</option></select></label>
        <label>Precio<input required min={0} step="0.01" type="number" value={materialForm.price} onChange={(e) => setMaterialForm({ ...materialForm, price: Number(e.target.value) })} /></label>
        <label className="full">URL del archivo<input required type="url" value={materialForm.fileUrl} onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })} /></label>
        <label className="full">Descripcion<textarea required value={materialForm.description} onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })} /></label>
        <button className="primary full" disabled={loading}>Publicar material</button>
      </form>
      {materials.length === 0 ? <EmptyState title="Aun no hay materiales" detail="Publica uno con cualquier URL http/https para probar en local." /> : (
        <div className="cards-grid">
          {materials.map((material) => <article className="resource-card" key={material.id}><div><span className="tag">{material.materialType}</span><h3>{material.title}</h3><p>{material.description}</p></div><div className="detail-row"><span>{material.category}</span><strong>{money(material.price)}</strong></div><a href={material.fileUrl} target="_blank">Abrir archivo</a></article>)}
        </div>
      )}
    </div>
  )
}
