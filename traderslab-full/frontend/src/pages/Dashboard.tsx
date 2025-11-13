// frontend/src/pages/Dashboard.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Table, Tag, Space, Select, Input, Button, Modal, Form, InputNumber, message, Popconfirm } from 'antd'
import type { Call } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { useState } from 'react'
import { useAuth } from '@/store/auth'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [operacao, setOperacao] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<null | Call>(null)
  const [form] = Form.useForm()
  const nav = useNavigate()
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['calls', { operacao, status, q }],
    queryFn: async () => {
      const params: any = {}
      if (operacao) params.operacao = operacao
      if (status) params.status = status
      if (q) params.q = q
      const { data } = await api.get('/calls', { params })
      return data as Call[]
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<Call> & { id: string }) => {
      const { id, ...rest } = payload
      const { data } = await api.put(`/calls/${id}`, rest)
      return data as Call
    },
    onSuccess: () => { message.success('Atualizado!'); qc.invalidateQueries({queryKey:['calls']}); setEditing(null) },
    onError: (e:any)=> message.error(e?.response?.data?.message || 'Erro ao atualizar')
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/calls/${id}`)
    },
    onSuccess: () => { message.success('Excluído!'); qc.invalidateQueries({queryKey:['calls']}) },
    onError: (e:any)=> message.error(e?.response?.data?.message || 'Erro ao excluir')
  })

  const columns: any[] = [
    { title: 'ATIVO', dataIndex: 'ativo', key: 'ativo' },
    { title: 'OPERAÇÃO', dataIndex: 'operacao', key: 'operacao',
      render: (v: string) => <Tag color={v==='COMPRA'?'green':'red'}>{v}</Tag>
    },
    { title: 'ENTRY', dataIndex: 'entry', key: 'entry', render: (v:number)=>`R$ ${v.toFixed(2)}` },
    { title: 'STOP', dataIndex: 'stop', key: 'stop', render: (v:number)=>`R$ ${v.toFixed(2)}` },
    { title: 'ALVO 1', dataIndex: 'alvo1', key: 'alvo1', render: (v:number)=> v ? `R$ ${v.toFixed(2)}` : '-' },
    { title: 'ALVO 2', dataIndex: 'alvo2', key: 'alvo2', render: (v:number)=> v ? `R$ ${v.toFixed(2)}` : '-' },
    { title: 'ALVO 3', dataIndex: 'alvo3', key: 'alvo3', render: (v:any) => (v ? `R$ ${Number(v).toFixed(2)}` : '-') },
    { title: 'STATUS', dataIndex: 'status', key: 'status', render:(v:string)=><StatusBadge status={v as any}/> },
    { title: 'DATA', dataIndex: 'date', key: 'date' },
    {
      title: 'Ações', key: 'actions',
      render: (_:any, record:Call) => (
        <Space>
          {user?.role === 'admin' && (<>
            <Button size="small" onClick={()=>{ setEditing(record); form.setFieldsValue(record) }}>Editar</Button>
            <Popconfirm title="Excluir esta call?" onConfirm={()=>deleteMutation.mutate(record.id)}>
              <Button size="small" danger>Excluir</Button>
            </Popconfirm>
          </>)}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Space style={{ marginBottom:16 }} wrap>
        <Select placeholder="Operação" style={{ width:140 }}
          options={[{value:'',label:'Todas'},{value:'COMPRA',label:'Compra'},{value:'VENDA',label:'Venda'}]}
          value={operacao} onChange={setOperacao}
        />
        <Select placeholder="Status" style={{ width:160 }}
          options={[
            { value:'', label:'Todos' },
            { value:'AGUARDANDO', label:'Aguardando' },
            { value:'ATIVO', label:'Ativo' },
            { value:'FINALIZADO', label:'Finalizado' },
            { value:'CANCELADO', label:'Cancelado'}
          ]}
          value={status} onChange={setStatus}
        />
        <Input.Search placeholder="Buscar por ativo..." allowClear onSearch={setQ} style={{ width:220 }} />
        <Button type="primary" onClick={()=>nav('/calls/new')} disabled={user?.role!=='admin'}>Nova Call</Button>
      </Space>

      <Table
        loading={isLoading}
        dataSource={data || []}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Editar Call"
        open={!!editing}
        onCancel={()=>setEditing(null)}
        onOk={()=>{ form.submit() }}
        okButtonProps={{ loading: updateMutation.isPending }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={(vals)=> editing && updateMutation.mutate({ id: editing.id, ...vals })}>
          <Form.Item label="Ativo" name="ativo" rules={[{ required:true }]}><Input /></Form.Item>
          <Form.Item label="Operação" name="operacao" rules={[{ required:true }]}>
            <Select options={[{value:'COMPRA',label:'Compra'},{value:'VENDA',label:'Venda'}]} />
          </Form.Item>
          <Form.Item label="Preço de Entrada" name="entry" rules={[{ required:true }]}><InputNumber style={{width:'100%'}} min={0} step={0.01} /></Form.Item>
          <Form.Item label="Stop" name="stop" rules={[{ required:true }]}><InputNumber style={{width:'100%'}} min={0} step={0.01} /></Form.Item>
          <Form.Item label="Alvo 1" name="alvo1"><InputNumber style={{width:'100%'}} min={0} step={0.01} /></Form.Item>
          <Form.Item label="Alvo 2" name="alvo2"><InputNumber style={{width:'100%'}} min={0} step={0.01} /></Form.Item>
          <Form.Item label="Alvo 3" name="alvo3"><InputNumber style={{width:'100%'}} min={0} step={0.01} /></Form.Item>
          <Form.Item label="Status" name="status" rules={[{ required:true }]}>
            <Select options={[
              { value:'AGUARDANDO', label:'Aguardando'},
              { value:'ATIVO', label:'Ativo'},
              { value:'FINALIZADO', label:'Finalizado'},
              { value:'CANCELADO', label:'Cancelado'}
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
