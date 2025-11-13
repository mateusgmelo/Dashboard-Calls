import { Card, Form, Input, Button, Typography, message } from 'antd'
import api from '@/lib/api'
import { useAuth } from '@/store/auth'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Login(){
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const from = (loc.state as any)?.from || '/dashboard'
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    try{
      const { data } = await api.post('/auth/login', values)
      login(data.user, data.accessToken)
      message.success('Bem-vindo!')
      nav(from, { replace:true })
    }catch(e:any){
      message.error(e?.response?.data?.message || 'Falha no login')
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Card title="Entrar" style={{ width:380 }}>
        <Typography.Paragraph>Use seu e-mail e senha.</Typography.Paragraph>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="E-mail" name="email" rules={[{ required:true, type:'email', message:'Informe um e-mail válido' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Senha" name="password" rules={[{ required:true, min:8, message:'Mínimo 8 caracteres' }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Entrar</Button>
        </Form>
      </Card>
    </div>
  )
}