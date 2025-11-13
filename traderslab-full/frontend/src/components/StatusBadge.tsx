import { Tag } from 'antd'
import type { Status } from '@/types'

export default function StatusBadge({ status }: { status: Status }){
  const color = { AGUARDANDO:'gold', ATIVO:'green', FINALIZADO:'blue', CANCELADO:'red' }[status]
  return <Tag color={color}>{status}</Tag>
}