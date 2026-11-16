export type MemberStatus = 'Active' | 'Expiring' | 'Expired' | 'Inactive'
export type Member = { id: string; name: string; email: string; phone: string; plan: string; joined: string; expiry: string; status: MemberStatus; avatar: string; gender: string }
export type Visit = { id: string; memberId: string; member: string; time: string; checkOut: string; method: 'Manual' | 'QR'; status: 'Checked in' | 'Checked out' }
export type Plan = { id: string; name: string; duration: string; price: number; description: string; status: 'Active' | 'Inactive'; color: string }
export type Payment = { id: string; member: string; memberId: string; date: string; amount: number; method: 'Cash' | 'UPI' | 'Card'; status: 'Paid' | 'Pending' | 'Failed'; plan: string }
export const initialMembers: Member[] = [
  {id:'FZ1001',name:'Aarav Sharma',email:'aarav.sharma@email.com',phone:'+91 98765 43210',plan:'Annual Fitness',joined:'12 Jan 2026',expiry:'12 Jan 2027',status:'Active',avatar:'AS',gender:'Male'},
  {id:'FZ1002',name:'Ananya Nair',email:'ananya.nair@email.com',phone:'+91 98765 12340',plan:'Quarterly Pro',joined:'18 Aug 2026',expiry:'18 Nov 2026',status:'Expiring',avatar:'AN',gender:'Female'},
  {id:'FZ1003',name:'Rohan Mehta',email:'rohan.mehta@email.com',phone:'+91 99887 66554',plan:'Monthly Flex',joined:'02 Nov 2026',expiry:'02 Dec 2026',status:'Active',avatar:'RM',gender:'Male'},
  {id:'FZ1004',name:'Priya Menon',email:'priya.menon@email.com',phone:'+91 98470 12345',plan:'Annual Fitness',joined:'05 Mar 2026',expiry:'05 Mar 2027',status:'Active',avatar:'PM',gender:'Female'},
  {id:'FZ1005',name:'Kabir Patel',email:'kabir.patel@email.com',phone:'+91 98980 45678',plan:'Quarterly Pro',joined:'15 Jul 2026',expiry:'15 Oct 2026',status:'Expired',avatar:'KP',gender:'Male'},
  {id:'FZ1006',name:'Diya Krishnan',email:'diya.krishnan@email.com',phone:'+91 97450 33445',plan:'Monthly Flex',joined:'08 Nov 2026',expiry:'08 Dec 2026',status:'Active',avatar:'DK',gender:'Female'},
  {id:'FZ1007',name:'Ishaan Gupta',email:'ishaan.gupta@email.com',phone:'+91 98111 22334',plan:'Annual Fitness',joined:'21 Feb 2026',expiry:'21 Feb 2027',status:'Active',avatar:'IG',gender:'Male'},
  {id:'FZ1008',name:'Meera Iyer',email:'meera.iyer@email.com',phone:'+91 94444 55667',plan:'Quarterly Pro',joined:'16 Aug 2026',expiry:'16 Nov 2026',status:'Expiring',avatar:'MI',gender:'Female'},
  {id:'FZ1009',name:'Aditya Rao',email:'aditya.rao@email.com',phone:'+91 99000 11122',plan:'Monthly Flex',joined:'04 Sep 2026',expiry:'04 Oct 2026',status:'Inactive',avatar:'AR',gender:'Male'},
]
export const initialVisits: Visit[] = [
  {id:'AT2401',memberId:'FZ1001',member:'Aarav Sharma',time:'06:42 AM',checkOut:'08:10 AM',method:'Manual',status:'Checked out'},
  {id:'AT2402',memberId:'FZ1004',member:'Priya Menon',time:'07:05 AM',checkOut:'—',method:'QR',status:'Checked in'},
  {id:'AT2403',memberId:'FZ1003',member:'Rohan Mehta',time:'07:18 AM',checkOut:'08:35 AM',method:'Manual',status:'Checked out'},
  {id:'AT2404',memberId:'FZ1006',member:'Diya Krishnan',time:'08:12 AM',checkOut:'—',method:'QR',status:'Checked in'},
  {id:'AT2405',memberId:'FZ1007',member:'Ishaan Gupta',time:'08:46 AM',checkOut:'09:52 AM',method:'Manual',status:'Checked out'},
  {id:'AT2406',memberId:'FZ1002',member:'Ananya Nair',time:'09:10 AM',checkOut:'—',method:'Manual',status:'Checked in'},
]
export const initialPlans: Plan[] = [
  {id:'PL01',name:'Monthly Flex',duration:'1 Month',price:1499,description:'Flexible month-to-month access',status:'Active',color:'mint'},
  {id:'PL02',name:'Quarterly Pro',duration:'3 Months',price:3999,description:'Great value for consistent training',status:'Active',color:'blue'},
  {id:'PL03',name:'Half-Yearly Plus',duration:'6 Months',price:6999,description:'Build a lasting fitness routine',status:'Active',color:'violet'},
  {id:'PL04',name:'Annual Fitness',duration:'12 Months',price:11999,description:'Our best value membership',status:'Active',color:'amber'},
]
export const initialPayments: Payment[] = [
  {id:'PAY-2081',member:'Aarav Sharma',memberId:'FZ1001',date:'16 Nov 2026',amount:11999,method:'UPI',status:'Paid',plan:'Annual Fitness'},
  {id:'PAY-2080',member:'Diya Krishnan',memberId:'FZ1006',date:'15 Nov 2026',amount:1499,method:'Cash',status:'Paid',plan:'Monthly Flex'},
  {id:'PAY-2079',member:'Ananya Nair',memberId:'FZ1002',date:'14 Nov 2026',amount:3999,method:'UPI',status:'Pending',plan:'Quarterly Pro'},
  {id:'PAY-2078',member:'Ishaan Gupta',memberId:'FZ1007',date:'13 Nov 2026',amount:11999,method:'Card',status:'Paid',plan:'Annual Fitness'},
  {id:'PAY-2077',member:'Kabir Patel',memberId:'FZ1005',date:'12 Nov 2026',amount:3999,method:'Cash',status:'Failed',plan:'Quarterly Pro'},
  {id:'PAY-2076',member:'Priya Menon',memberId:'FZ1004',date:'11 Nov 2026',amount:11999,method:'UPI',status:'Paid',plan:'Annual Fitness'},
]
export const weeklyAttendance = [{day:'Mon',visits:82},{day:'Tue',visits:96},{day:'Wed',visits:78},{day:'Thu',visits:112},{day:'Fri',visits:104},{day:'Sat',visits:138},{day:'Sun',visits:64}]
export const monthlyRevenue = [{month:'Jun',revenue:42000},{month:'Jul',revenue:51000},{month:'Aug',revenue:46500},{month:'Sep',revenue:62000},{month:'Oct',revenue:58500},{month:'Nov',revenue:73500}]
