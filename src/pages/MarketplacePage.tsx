import type { FormEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Row } from '../components/Row'
import type { Listing, ListingForm, Material, PaymentMethod, Transaction } from '../types'
import { formatDate } from '../utils/format'

export function MarketplacePage({ listings, materials, listingForm, setListingForm, createListing, purchaseListing, loading, transactions, currentUserId }: {
  listings: Listing[]
  materials: Material[]
  listingForm: ListingForm
  setListingForm: (form: ListingForm) => void
  createListing: (event: FormEvent) => void
  purchaseListing: (id: number, paymentMethod: PaymentMethod) => void
  loading: boolean
  transactions: Transaction[]
  currentUserId: number
}) {
  const ownMaterials = materials.filter((material) => material.ownerId === currentUserId)
  return (
    <div className="stack">
      <form className="panel form-grid three" onSubmit={createListing}>
        <h2 className="full">Crear publicacion</h2>
        <label>Material<select required value={listingForm.materialId} onChange={(e) => setListingForm({ ...listingForm, materialId: e.target.value })}><option value="">Seleccionar</option>{ownMaterials.map((material) => <option key={material.id} value={material.id}>{material.title}</option>)}</select></label>
        <label>Operacion<select value={listingForm.transactionType} onChange={(e) => setListingForm({ ...listingForm, transactionType: e.target.value as ListingForm['transactionType'] })}><option>SALE</option><option>EXCHANGE</option></select></label>
        <label>Stock<input min={1} type="number" value={listingForm.stock} onChange={(e) => setListingForm({ ...listingForm, stock: Number(e.target.value) })} /></label>
        <button className="primary full" disabled={loading || ownMaterials.length === 0}>Agregar al marketplace</button>
        {ownMaterials.length === 0 && <p className="hint full">Primero crea un material en la seccion Materiales. Solo puedes publicar materiales de tu usuario.</p>}
      </form>
      {listings.length === 0 ? <EmptyState title="No hay publicaciones activas" detail="Cuando publiques tu primer material aparecera aqui. Para comprarlo necesitas otro usuario, porque el backend no permite comprar tu propio material." /> : (
        <div className="cards-grid">
          {listings.map((listing) => {
            const ownListing = listing.sellerId === currentUserId
            return <article className="resource-card" key={listing.id}><span className="tag">{listing.transactionType}</span><h3>{listing.materialTitle}</h3><p>Vendedor: @{listing.sellerUsername}</p><div className="detail-row"><span>{listing.publicationStatus}</span><strong>Stock {listing.stock}</strong></div><div className="button-row"><button className="primary" disabled={loading || listing.stock < 1 || ownListing} onClick={() => purchaseListing(listing.id, listing.transactionType === 'EXCHANGE' ? 'EXCHANGE' : 'FREE')}>Obtener</button><button className="ghost" disabled={loading || listing.stock < 1 || ownListing} onClick={() => purchaseListing(listing.id, 'STRIPE')}>Stripe</button></div>{ownListing && <p className="hint">Es tu publicacion. Inicia sesion con otro usuario para comprarla.</p>}</article>
          })}
        </div>
      )}
      <section className="list-panel"><div className="section-title"><h2>Mis transacciones</h2><span>{transactions.length}</span></div>{transactions.length === 0 ? <EmptyState title="Sin transacciones" detail="Compra o intercambia materiales desde una cuenta diferente al vendedor." /> : transactions.map((tx) => <Row key={tx.id} title={tx.materialTitle} meta={`${tx.paymentMethod} · ${formatDate(tx.transactionDate)}`} value={tx.status} />)}</section>
    </div>
  )
}
