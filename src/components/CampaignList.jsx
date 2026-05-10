import { useState, useEffect } from 'react'
import CampaignCard from './CampaignCard'
import { lazy, Suspense } from 'react'
const ProposeModal = lazy(() => import('./ProposeModal'))
import { Plus, Search, SlidersHorizontal } from 'lucide-react'

const typeFilters = ['All', 'Billboard', 'Legal', 'FOIA', 'Verify']
const sortOptions = [
  { id: 'urgent', label: 'Most Urgent' },
  { id: 'pct', label: '% Funded' },
  { id: 'raised', label: 'Most Raised' },
  { id: 'newest', label: 'Newest' },
]

function getDaysLeft(deadline) {
  return Math.max(0, Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)))
}

import { API_BASE as AI_URL } from '../config.js'

export default function CampaignList({ full, setSelectedCampaign, setTab }) {
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('urgent')
  const [query, setQuery] = useState('')
  const [proposing, setProposing] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${AI_URL}/api/campaigns`)
      .then(r => r.json())
      .then(data => { setCampaigns(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const base = full ? campaigns : campaigns.slice(0, 3)

  const filtered = base
    .filter(c => filter === 'All' || c.type === filter.toLowerCase())
    .filter(c => !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'urgent') return getDaysLeft(a.deadline) - getDaysLeft(b.deadline)
      if (sort === 'pct') return (b.raised / b.goal) - (a.raised / a.goal)
      if (sort === 'raised') return b.raised - a.raised
      if (sort === 'newest') return b.id - a.id
      return 0
    })

  if (loading) return (
    <section style={{ padding: full ? '48px 24px' : '64px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ color: 'var(--muted)', fontSize: 15, textAlign: 'center', padding: 48 }}>Loading campaigns…</div>
    </section>
  )

  return (
    <section style={{ padding: full ? '48px 24px' : '64px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
            {full ? 'All Campaigns' : 'Campaigns'}
          </h2>
          <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 14 }}>
            At launch, each campaign will have its own Monero (XMR) and Zano (ZANO) wallet address. Contributions go directly to the operator — Citeback never holds funds. Balance verified via operator-provided view key. Fully public audit trail.
          </p>
        </div>
        <button onClick={() => setProposing(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--accent)', border: 'none', color: '#fff',
          padding: '10px 18px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 14, minHeight: 44,
        }}>
          <Plus size={15} /> Propose Campaign
        </button>
      </div>

      {/* Filters + Search */}
      {full && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search campaigns or locations..."
              style={{
                width: '100%', paddingLeft: 34, padding: '9px 12px 9px 34px',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', borderRadius: 'var(--radius)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            {typeFilters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? 'var(--accent)' : 'var(--bg3)',
                border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
                color: filter === f ? '#fff' : 'var(--muted)',
                padding: '6px 14px', borderRadius: 'var(--radius)', fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap',
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (filter !== f) { e.currentTarget.style.borderColor = 'var(--fg)'; e.currentTarget.style.color = 'var(--fg)' } }}
              onMouseLeave={e => { if (filter !== f) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' } }}
              >{f}</button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SlidersHorizontal size={13} style={{ color: 'var(--muted)' }} />
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              background: 'var(--bg3)', border: '1px solid var(--border)',
              color: 'var(--text)', padding: '7px 10px', borderRadius: 'var(--radius)', fontSize: 13,
              outline: 'none', cursor: 'pointer',
            }}>
              {sortOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)', fontSize: 15 }}>
          No campaigns match your search.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 20 }}>
          {filtered.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onClick={() => { setSelectedCampaign(c); if (setTab) setTab('campaigns') }}
            />
          ))}
        </div>
      )}

      {!full && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button onClick={() => setTab('campaigns')} style={{
            background: 'var(--bg3)', border: '1px solid var(--border)',
            color: 'var(--text)', padding: '12px 28px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: 15,
          }}>View All Campaigns →</button>
        </div>
      )}

      {proposing && <Suspense fallback={null}><ProposeModal onClose={() => setProposing(false)} /></Suspense>}
    </section>
  )
}
