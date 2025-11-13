// frontend/src/components/Layout.tsx
import { Layout as AntLayout, Menu, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'

const { Header, Content, Sider } = AntLayout

export function Layout(){
  const nav = useNavigate()
  const loc = useLocation()
  const { user, logout } = useAuth()

  const items = [
    { key: '/dashboard', label: 'Dashboard' },
    { key: '/calls/new', label: 'Nova Call' },
    ...(user?.role === 'admin' ? [{ key: '/users', label: 'Gerenciar Usuários' }] : [] as any[])
  ]

  return (
    <AntLayout style={{minHeight:'100vh'}}>
      <Sider breakpoint="lg" collapsedWidth={0}>
        <div style={{color:'#fff',padding:16,fontWeight:700}}>TradersLAB</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[loc.pathname]}
          onClick={(e)=>nav(e.key)}
          items={items as any}
        />
        <div style={{color:'#fff',padding:16,fontSize:12,opacity:.85}}>
          {user?.name} — {user?.role} · <span style={{cursor:'pointer'}} onClick={logout}>sair</span>
        </div>
      </Sider>
      <AntLayout>
        <Header style={{background:'#fff'}}>
          <Typography.Title level={3} style={{margin:0}}>Dashboard de Calls</Typography.Title>
        </Header>
        <Content style={{margin:16}}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
