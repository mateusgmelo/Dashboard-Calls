import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Table, Form, Input, Select, Button, Space, message, Popconfirm, Card } from 'antd'
import type { User } from '@/types'
import { useAuth } from '@/store/auth'

export default function Users(){
  const qc = useQueryClient()
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users')
      return data as User[]
    }
  })

  const [form] = Form.useForm()

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/users', payload)
      return data
    },
    onSuccess: () => { message.success('Usuário criado'); form.resetFields(); qc.invalidateQueries({queryKey:['users']}) },
    onError: (e:any)=> message.error(e?.response?.data?.message || 'Erro ao criar usuário')
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/users/${id}`) },
    onSuccess: () => { message.success('Usuário removido'); qc.invalidateQueries({queryKey:['users']}) },
    onError: (e:any)=> message.error(e?.response?.data?.message || 'Erro ao remover usuário')
  })

  if (user?.role !== 'admin') {
    return <div>Somente administradores podem acessar esta página.</div>
  }

  return (
    <div className="space-y-4">
      <Card title="Novo usuário">
        <Form form={form} layout="vertical" onFinish={(vals)=>createMutation.mutate(vals)}>
          <Form.Item label="Nome" name="name" rules={[{ required:true }]}><Input /></Form.Item>
          <Form.Item label="E-mail" name="email" rules={{ required:true, type:'email' as const }}><Input /></Form.Item>
          <Form.Item label="Senha" name="password" rules={{ required:true, min:8 }}><Input.Password /></Form.Item>
          <Form.Item label="Perfil" name="role" initialValue="viewer">
            <Select options={[{value:'admin',label:'ADMIN'},{value:'viewer',label:'VIEWER'}]} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Criar</Button>
        </Form>
      </Card>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data || []}
        columns={[
          { title:'Nome', dataIndex:'name' },
          { title:'E-mail', dataIndex:'email' },
          { title:'Perfil', dataIndex:'role' },
          { title:'Ações', key:'actions', render: (_:any, record:User)=>(
            <Space>
              <Popconfirm title="Remover este usuário?" onConfirm={()=>deleteMutation.mutate(record.id)}>
                <Button danger size="small">Excluir</Button>
              </Popconfirm>
            </Space>
          )}
        ]}
      />
    </div>
  )
}