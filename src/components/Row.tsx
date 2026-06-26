export function Row({ title, meta, value }: { title: string; meta: string; value: string }) {
  return <div className="row"><div><strong>{title}</strong><span>{meta}</span></div><em>{value}</em></div>
}
