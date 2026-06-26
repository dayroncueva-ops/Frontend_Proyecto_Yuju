export function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}
