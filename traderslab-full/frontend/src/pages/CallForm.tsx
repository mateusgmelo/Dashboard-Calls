import { Form, Input, InputNumber, Button, Select, Card, message, Alert } from 'antd'
import api from '@/lib/api'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function CallForm(){
  const nav = useNavigate()
  const [form] = Form.useForm()
  const [errorMessages, setErrorMessages] = useState<string[]>([])

  const onFinish = async (values:any) => {
    setErrorMessages([])
    try{
      const payload = {
        ...values,
        ativo: values.ativo?.toUpperCase()
      }
      await api.post('/calls', payload)
      message.success('Call criada com sucesso!')
      nav('/dashboard')
    }catch(e:any){
      const errors = e?.response?.data?.message
      if (typeof errors === 'string') {
        setErrorMessages([errors])
      } else if (Array.isArray(errors)) {
        const formattedErrors = errors.map((err: any) => {
          if (err.path && err.message) {
            const fieldNames: any = {
              ativo: 'Ativo',
              entry: 'Preço de Entrada',
              stop: 'Stop Loss',
              operacao: 'Operação'
            }
            const fieldName = fieldNames[err.path[0]] || err.path[0]
            return `${fieldName}: ${err.message}`
          }
          return err.message || JSON.stringify(err)
        })
        setErrorMessages(formattedErrors)
      } else {
        setErrorMessages(['Erro ao salvar a call. Verifique os dados e tente novamente.'])
      }
    }
  }

  const validateStopVsEntry = () => {
    const operacao = form.getFieldValue('operacao')
    const entry = form.getFieldValue('entry')
    const stop = form.getFieldValue('stop')
    
    if (operacao && entry && stop) {
      if (operacao === 'COMPRA' && stop >= entry) {
        return Promise.reject('Para operação de COMPRA, o Stop deve ser menor que o Preço de Entrada')
      }
      if (operacao === 'VENDA' && stop <= entry) {
        return Promise.reject('Para operação de VENDA, o Stop deve ser maior que o Preço de Entrada')
      }
    }
    return Promise.resolve()
  }

  return (
    <Card title="Nova Call">
      {errorMessages.length > 0 && (
        <Alert
          type="error"
          message="Erro ao criar call"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {errorMessages.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          }
          closable
          onClose={() => setErrorMessages([])}
          style={{ marginBottom: 16 }}
        />
      )}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item 
          label="Ativo" 
          name="ativo" 
          rules={[
            { required: true, message: 'Informe o ticker do ativo' },
            { 
              pattern: /^[A-Za-z0-9]{3,6}$/, 
              message: 'O ticker deve ter de 3 a 6 caracteres alfanuméricos (ex: PETR4, VALE3, MGLU3)' 
            }
          ]}
          tooltip="Digite o código do ativo (ex: PETR4, VALE3). Será convertido automaticamente para maiúsculas."
        >
          <Input 
            placeholder="PETR4" 
            maxLength={6}
            onChange={(e) => form.setFieldValue('ativo', e.target.value.toUpperCase())}
          />
        </Form.Item>
        <Form.Item 
          label="Operação" 
          name="operacao" 
          rules={[{ required: true, message: 'Selecione o tipo de operação' }]}
        >
          <Select 
            placeholder="Selecione"
            options={[{ value:'COMPRA', label:'Compra'}, { value:'VENDA', label:'Venda'}]} 
            onChange={() => form.validateFields(['stop'])}
          />
        </Form.Item>
        <Form.Item 
          label="Preço de Entrada" 
          name="entry" 
          rules={[{ required: true, message: 'Informe o preço de entrada' }]}
        >
          <InputNumber 
            style={{ width:'100%' }} 
            min={0.01} 
            step={0.01} 
            placeholder="0.00"
            prefix="R$"
            onChange={() => form.validateFields(['stop'])}
          />
        </Form.Item>
        <Form.Item 
          label="Stop Loss" 
          name="stop" 
          rules={[
            { required: true, message: 'Informe o stop loss' },
            { validator: validateStopVsEntry }
          ]}
          tooltip="Para COMPRA: stop deve ser menor que entrada. Para VENDA: stop deve ser maior que entrada."
        >
          <InputNumber 
            style={{ width:'100%' }} 
            min={0.01} 
            step={0.01} 
            placeholder="0.00"
            prefix="R$"
          />
        </Form.Item>
        <Form.Item label="Alvo 1" name="alvo1">
          <InputNumber style={{ width:'100%' }} min={0.01} step={0.01} placeholder="0.00" prefix="R$" />
        </Form.Item>
        <Form.Item label="Alvo 2" name="alvo2">
          <InputNumber style={{ width:'100%' }} min={0.01} step={0.01} placeholder="0.00" prefix="R$" />
        </Form.Item>
        <Form.Item label="Alvo 3" name="alvo3">
          <InputNumber style={{ width:'100%' }} min={0.01} step={0.01} placeholder="0.00" prefix="R$" />
        </Form.Item>
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