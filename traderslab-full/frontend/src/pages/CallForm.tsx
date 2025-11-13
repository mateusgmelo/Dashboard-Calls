import { Form, Input, InputNumber, Button, Select, Card, message } from 'antd'
import api from '@/lib/api'
import { useNavigate } from 'react-router-dom'

export default function CallForm(){
  const nav = useNavigate()
  const [form] = Form.useForm()

  const onFinish = async (values:any) => {
    try{
      await api.post('/calls', values)
      message.success('Call criada')
      nav('/dashboard')
    }catch(e:any){
      message.error(e?.response?.data?.message || 'Erro ao salvar')
    }
  }

  return (
    <Card title="Nova Call">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Ativo" name="ativo" rules={[{ required:true, message:'Informe o ticker' }]}>
          <Input placeholder="PETR4" />
        </Form.Item>
        <Form.Item label="Operação" name="operacao" rules={[{ required:true }]}>
          <Select options={[{ value:'COMPRA', label:'Compra'}, { value:'VENDA', label:'Venda'}]} />
        </Form.Item>
        <Form.Item label="Preço de Entrada" name="entry" rules={[{ required:true }]}>
          <InputNumber style={{ width:'100%' }} min={0} step={0.01} />
        </Form.Item>
        <Form.Item label="Stop Loss" name="stop" rules={[{ required:true }]}>
          <InputNumber style={{ width:'100%' }} min={0} step={0.01} />
        </Form.Item>
        <Form.Item label="Alvo 1" name="alvo1"><InputNumber style={{ width:'100%' }} min={0} step={0.01} /></Form.Item>
        <Form.Item label="Alvo 2" name="alvo2"><InputNumber style={{ width:'100%' }} min={0} step={0.01} /></Form.Item>
        <Form.Item label="Alvo 3" name="alvo3"><InputNumber style={{ width:'100%' }} min={0.01} step={0.01} /></Form.Item>
        <Form.Item label="Status" name="status" initialValue="AGUARDANDO">
          <Select options={[
            { value:'AGUARDANDO', label:'Aguardando'},
            { value:'ATIVO', label:'Ativo'},
            { value:'FINALIZADO', label:'Finalizado'},
            { value:'CANCELADO', label:'Cancelado'}
          ]} />
        </Form.Item>
        <Form.Item label="Data" name="date" rules={[{ required:true }]}><Input placeholder="DD/MM/AAAA" /></Form.Item>
        <Form.Item label="Fundamentação" name="fundamentacao"><Input.TextArea rows={4} /></Form.Item>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
          <Button onClick={()=>nav(-1)}>Cancelar</Button>
          <Button type="primary" htmlType="submit">Salvar Call</Button>
        </div>
      </Form>
    </Card>
  )
}