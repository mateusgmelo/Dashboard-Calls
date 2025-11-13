export type Role = 'admin' | 'viewer'
export type Operacao = 'COMPRA' | 'VENDA'
export type Status = 'AGUARDANDO' | 'ATIVO' | 'FINALIZADO' | 'CANCELADO'

export interface User { id: string; name: string; email: string; role: Role; createdAt: string }
export interface Call {
  id: string; ativo: string; operacao: Operacao; entry: number; stop: number;
  alvo1?: number|null; alvo2?: number|null; alvo3?: number|null;
  status: Status; date: string; fundamentacao?: string|null; authorId?: string;
  createdAt: string; updatedAt: string;
}
export interface LoginResponse { accessToken: string; user: User }