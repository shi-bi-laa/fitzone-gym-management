import { useEffect, useMemo, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Activity, BarChart3, Bell, CalendarCheck, ChevronDown, CreditCard, Dumbbell, LayoutDashboard, Menu, Settings, Users, Wallet, X, LogOut, Building2, Search, Plus, PanelLeftClose } from 'lucide-react'
import { initialMembers, initialPayments, initialPlans, initialVisits, type Member, type Payment, type Plan, type Visit } from './data/mock'
import { Avatar, Button, Modal, Topbar, money } from './components/ui'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Attendance from './pages/Attendance'
import Plans from './pages/Plans'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import SettingsPage from './pages/Settings'
import Staff from './pages/Staff'

export type Store = {members:Member[];setMembers:(v:Member[]|((p:Member[])=>Member[]))=>void;visits:Visit[];setVisits:(v:Visit[]|((p:Visit[])=>Visit[]))=>void;plans:Plan[];setPlans:(v:Plan[]|((p:Plan[])=>Plan[]))=>void;payments:Payment[];setPayments:(v:Payment[]|((p:Payment[])=>Payment[]))=>void}
const navigation=[{label:'OVERVIEW',items:[{to:'/',label:'Dashboard',icon:LayoutDashboard}]},{label:'MANAGEMENT',items:[{to:'/members',label:'Members',icon:Users},{to:'/attendance',label:'Attendance',icon:CalendarCheck},{to:'/plans',label:'Membership plans',icon:Dumbbell}]},{label:'FINANCE',items:[{to:'/payments',label:'Payments',icon:Wallet},{to:'/reports',label:'Reports',icon:BarChart3}]},{label:'WORKSPACE',items:[{to:'/staff',label:'Staff',icon:Users}]},{label:'PREFERENCES',items:[{to:'/settings',label:'Settings',icon:Settings}]}]
function useStoredState<T>(key:string,initial:T){const [value,setValue]=useState<T>(()=>{try{const saved=localStorage.getItem(key);return saved?JSON.parse(saved) as T:initial}catch{return initial}});useEffect(()=>{localStorage.setItem(key,JSON.stringify(value))},[key,value]);return [value,setValue] as const}
export default function App(){
 const [members,setMembers]=useStoredState<Member[]>('fitzone-members',initialMembers)
 const [visits,setVisits]=useStoredState<Visit[]>('fitzone-visits',initialVisits)
 const [plans,setPlans]=useStoredState<Plan[]>('fitzone-plans',initialPlans)
 const [payments,setPayments]=useStoredState<Payment[]>('fitzone-payments',initialPayments)
 const [mobileOpen,setMobileOpen]=useState(false)
 const store:Store={members,setMembers,visits,setVisits,plans,setPlans,payments,setPayments}
 const location=useLocation()
 useEffect(()=>setMobileOpen(false),[location.pathname])
 const pageName=navigation.flatMap(n=>n.items).find(n=>n.to===location.pathname)?.label||'Dashboard'
 return <div className="app-shell"><aside className={`sidebar ${mobileOpen?'sidebar-open':''}`}><div className="brand"><div className="brand-mark"><Dumbbell size={22}/></div><div><strong>FitZone</strong><span>FITNESS MANAGEMENT</span></div><button className="icon-button sidebar-close" onClick={()=>setMobileOpen(false)}><X size={19}/></button></div><div className="gym-switcher"><div className="gym-icon"><Building2 size={18}/></div><div><strong>FitZone Fitness</strong><span>Single location</span></div><ChevronDown size={15}/></div><nav className="side-nav">{navigation.map(group=><div className="nav-group" key={group.label}><span className="nav-label">{group.label}</span>{group.items.map(item=><NavLink key={item.to} to={item.to} end={item.to==='/'} className={({isActive})=>`nav-link ${isActive?'active':''}`}><item.icon size={18}/><span>{item.label}</span>{item.to==='/members'&&<small>{members.length}</small>}</NavLink>)}</div>)}</nav><div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Activity size={17}/></div><strong>Need a hand?</strong><p>Your fitness workspace, all in one place.</p><button onClick={()=>window.alert('Help centre coming soon.')}>Visit help centre <span>↗</span></button></div><div className="sidebar-profile"><Avatar name="Admin"/><div><strong>FitZone Admin</strong><span>Owner account</span></div><button className="icon-button" aria-label="Account menu"><LogOut size={17}/></button></div></div></aside>{mobileOpen&&<div className="mobile-overlay" onClick={()=>setMobileOpen(false)}/>}<main className="main-area"><Topbar onMenu={()=>setMobileOpen(true)}/><div className="content-wrap"><div className="mobile-page-label">{pageName}</div><Routes><Route path="/" element={<Dashboard store={store}/>}/><Route path="/members" element={<Members store={store}/>}/><Route path="/attendance" element={<Attendance store={store}/>}/><Route path="/plans" element={<Plans store={store}/>}/><Route path="/payments" element={<Payments store={store}/>}/><Route path="/reports" element={<Reports store={store}/>}/><Route path="/staff" element={<Staff/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes><footer className="footer"><span>© 2026 FitZone Fitness</span><span>Made for better fitness management <span className="footer-heart">♥</span></span></footer></div></main></div>
}
