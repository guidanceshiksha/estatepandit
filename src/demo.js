// Browser-only demo data store (localStorage). Nothing here is sent to a server.
import { defaults } from './data.js'

const LEADS_KEY = 'pe_demo_leads'
const CONTENT_KEY = 'pe_demo_content'

const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb } catch { return fb } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage blocked: keep going in memory */ } }

const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString()
const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)

function seed() {
  const L = (id, hoursAgo, o) => ({ id, createdAt: ago(hoursAgo + 0.1), updatedAt: ago(hoursAgo), submittedAt: ago(hoursAgo), submitted: true, status: 'new', notes: '', ...o })
  return [
    L('demo-lead-0001', 0.4, { name: 'Rahul Verma', phone: '9810000011', need: 'Site visit', kind: 'visit', title: '3 BHK Society Flat, Sector 10, Dwarka', source: 'Property visit: 3 BHK Society Flat, Sector 10, Dwarka (₹ 1.25 Cr)', visitDate: day(2), visitTime: '4 PM – 6 PM', message: 'Weekend works better if possible.' }),
    L('demo-lead-0002', 2, { name: 'Anita Sharma', phone: '9810000022', need: 'Buy', kind: 'enquiry', title: '2 BHK DDA Flat, Sector 12, Dwarka', source: 'Property: 2 BHK DDA Flat, Sector 12, Dwarka (₹ 85 Lac)', message: 'Is the price negotiable?' }),
    L('demo-lead-0003', 5, { name: 'Vikas Gupta', phone: '9810000033', need: 'DDA plot / flat', kind: 'service', title: 'DDA Plots & Flats', source: 'Service: DDA Plots & Flats', status: 'contacted', notes: 'Called once, wants plots near Sector 19.' }),
    L('demo-lead-0004', 9, { name: 'Neha Kapoor', phone: '9810000044', need: 'Rent', kind: 'enquiry', title: '3 BHK for Rent, Sector 11, Dwarka', source: 'Property: 3 BHK for Rent, Sector 11, Dwarka (₹ 45,000 / mo)', status: 'qualified', notes: 'Moving in next month. Budget up to 48k.' }),
    L('demo-lead-0005', 26, { name: 'Sandeep Yadav', phone: '9810000055', need: 'Buy', kind: 'area', title: 'Properties in Sector 19', source: 'Area: Sector 19' }),
    L('demo-lead-0006', 30, { name: 'Pooja Malhotra', phone: '9810000066', need: 'Site visit', kind: 'visit', title: '4 BHK Luxury Penthouse, Sector 22, Dwarka', source: 'Property visit: 4 BHK Luxury Penthouse, Sector 22, Dwarka (₹ 2.4 Cr)', visitDate: day(4), visitTime: '10 AM – 12 PM', status: 'contacted', notes: 'Visit confirmed on call.' }),
    L('demo-lead-0007', 52, { name: 'Amit Kaushik', phone: '9810000077', need: 'Sell', kind: 'service', title: 'Property Selling', source: 'Service: Property Selling', status: 'closed', notes: 'Listing signed. Photoshoot done.' }),
    L('demo-lead-0008', 75, { name: 'Meena Aggarwal', phone: '9810000088', need: 'Society membership (L-Zone)', kind: 'callback', title: 'Footer callback request', source: 'Footer form', status: 'lost', notes: 'Not interested now.' }),
    { id: 'demo-lead-0009', createdAt: ago(0.2), updatedAt: ago(0.1), submitted: false, status: 'partial', notes: '', name: 'Rohit', phone: '98100', kind: 'visit', title: '2 BHK SFS Flat, Sector 19, Dwarka', source: 'Property visit: 2 BHK SFS Flat, Sector 19, Dwarka (₹ 65 Lac)' },
  ]
}

let leads = read(LEADS_KEY, null) || seed()
let content = read(CONTENT_KEY, {})
const saveLeads = () => write(LEADS_KEY, leads)
// other tabs (the website forms, the admin panel) share localStorage, so re-read before every use
const refresh = () => { leads = read(LEADS_KEY, null) || leads }

export const demoLeads = () => (refresh(), [...leads]).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
export const demoContentSaved = () => read(CONTENT_KEY, {})

/** Same rules as the real server: partial until submitted, then "new". */
export function demoSaveLead(id, b) {
  refresh()
  const now = new Date().toISOString()
  let lead = leads.find((l) => l.id === id)
  if (!lead) { lead = { id, createdAt: now, status: 'partial', submitted: false, notes: '' }; leads.push(lead) }
  for (const k of ['name', 'phone', 'email', 'need', 'message', 'title', 'source', 'visitDate', 'visitTime', 'budget', 'kind']) if (k in b) lead[k] = String(b[k] ?? '')
  if (b.submitted === true && !lead.submitted) { lead.submitted = true; lead.submittedAt = now; if (lead.status === 'partial') lead.status = 'new' }
  lead.updatedAt = now
  saveLeads()
}
export function demoPatchLead(id, b) {
  refresh()
  const lead = leads.find((l) => l.id === id)
  if (!lead) return null
  if (b.status) lead.status = b.status
  if ('notes' in b) lead.notes = b.notes
  lead.updatedAt = new Date().toISOString()
  saveLeads()
  return lead
}
export function demoDeleteLead(id) { refresh(); leads = leads.filter((l) => l.id !== id); saveLeads() }
export function demoSetContent(key, value) { content = { ...content, [key]: value }; write(CONTENT_KEY, content) }
export function demoResetContent(key) { const { [key]: _drop, ...rest } = content; content = rest; write(CONTENT_KEY, content); return { ...defaults[key] } }
