import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import type { Material, MaterialForm } from '../types'
import { money } from '../utils/format'

function parsePrice(value: string) {
  const normalized = value.replace(',', '.')
  if (normalized === '') return 0
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function MaterialsPage({ materials, materialForm, setMaterialForm, materialFile, setMaterialFile, materialFileInputKey, createMaterial, loading }: {
  materials: Material[]
  materialForm: MaterialForm
  setMaterialForm: (form: MaterialForm) => void
  materialFile: File | null
  setMaterialFile: (file: File | null) => void
  materialFileInputKey: number
  createMaterial: (event: FormEvent) => void
  loading: boolean
}) {
  const fileInputId = `material-file-${materialFileInputKey}`
  const [priceText, setPriceText] = useState(String(materialForm.price))

  useEffect(() => {
    setPriceText(String(materialForm.price))
  }, [materialFileInputKey])

  function updatePrice(value: string) {
    if (!/^\d*([.,]\d{0,2})?$/.test(value)) return
    setPriceText(value)
    setMaterialForm({ ...materialForm, price: parsePrice(value) })
  }

  return (
    <div className="stack">
      <form className="panel form-grid two" onSubmit={createMaterial}>
        <h2 className="full">Nuevo material</h2>
        <label>Titulo<input required value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} /></label>
        <label>Categoria<input required value={materialForm.category} onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })} /></label>
        <label>Tipo<select value={materialForm.materialType} onChange={(e) => setMaterialForm({ ...materialForm, materialType: e.target.value as MaterialForm['materialType'] })}><option>PDF</option><option>VIDEO</option><option>NOTE</option></select></label>
        <label>Precio<input required inputMode="decimal" type="text" value={priceText} onChange={(e) => updatePrice(e.target.value)} onBlur={() => setPriceText(String(materialForm.price))} /></label>
        <div className="file-field full">
          <span>Archivo</span>
          <input id={fileInputId} key={materialFileInputKey} required type="file" accept="application/pdf,image/*,video/*" onChange={(e) => setMaterialFile(e.target.files?.[0] ?? null)} />
          <label className="file-button" htmlFor={fileInputId}>{materialFile ? 'Cambiar archivo' : 'Seleccionar archivo'}</label>
        </div>
        {materialFile && <p className="hint full">Listo para subir: {materialFile.name}</p>}
        <label className="full">Descripcion<textarea required value={materialForm.description} onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })} /></label>
        <button className="primary full" disabled={loading || !materialFile}>Publicar material</button>
      </form>
      {materials.length === 0 ? <EmptyState title="Aun no hay materiales" detail="Sube un PDF, imagen o video para publicarlo desde Cloudinary." /> : (
        <div className="cards-grid">
          {materials.map((material) => <article className="resource-card" key={material.id}><div><span className="tag">{material.materialType}</span><h3>{material.title}</h3><p>{material.description}</p></div><div className="detail-row"><span>{material.category}</span><strong>{money(material.price)}</strong></div><a href={material.fileUrl} target="_blank">Abrir archivo</a></article>)}
        </div>
      )}
    </div>
  )
}
