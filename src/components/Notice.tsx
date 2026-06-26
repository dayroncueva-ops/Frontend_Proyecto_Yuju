import type { Notice as NoticeType } from '../types'

export function Notice({ notice }: { notice: NoticeType }) {
  if (!notice) return null
  return <p className={`notice ${notice.type}`}>{notice.message}</p>
}
