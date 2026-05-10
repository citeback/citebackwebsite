import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import CampaignCard from './CampaignCard'
import { lazy, Suspense } from 'react'
const ProposeModal = lazy(() => import('./ProposeModal'))
import { Plus, Search, SlidersHorizontal, AlertCircle } from 'lucide-react'

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
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    fetch(`${AI_URL}/api/campaigns`)
      .then(r => r.json())
      .then(data => { setCampaigns(data); setLoading(false) })
      .catch(() => { setFetchError(true); setLoading(false) })
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

  const sectionPadding = full ? '48px 24px' : '64px 24px'

  if (loading) return (
    <section className="campaign-list-section" style={{ padding: sectionPadding }}>
      <div className="campaign-list-loading">Loading campaigns…</div>
    </section>
  )

  if (fetchError) return (
    <section className="campaign-list-section" style={{ padding: sectionPadding }}>
      <div className="campaign-list-error">
        <AlertCircle size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
        Unable to load campaigns — please refresh the page.
      </div>
    </section>
  )

  return (
    <>
    {full && (
      <Helmet>
        <title>Active Campaigns | Citeback — Fund Surveillance Lawsuits</title>
        <meta name="description" content="Browse active crowdfunding campaigns to fund surveillance lawsuits, FOIA requests, and ordinance fights. Anonymous Monero (XMR) and Zano contributions." />
        <meta property="og:title" content="Active Campaigns | Citeback — Fund Surveillance Lawsuits" />
        <meta property="og:description" content="Browse active crowdfunding campaigns to fund surveillance lawsuits, FOIA requests, and ordinance fights. Anonymous Monero (XMR) and Zano contributions." />
      </Helmet>
    )}
    <section className="campaign-list-section" style={{ padding: sectionPadding }}>
      <div className="campaign-list-header">
        <div>
          <h2 className="campaign-list-h2">
            {full ? 'All Campaigns' : 'Campaigns'}
          </h2>
          <p className="campaign-list-desc">
            At launch, each campaign will have its own Monero (XMR) and Zano (ZANO) wallet address.
            Contributions go directly to the operator — Citeback never holds funds.
            Balance verified via operator-provided view key. Fully public audit trail.
          </p>
        </div>
        <button onClick={() => setProposing(true)} className="campaign-propose-btn">
          <Plus size={15} /> Propose Campaign
        </button>
      </div>

      {/* Filters + Search (full view only) */}
      {full && (
        <div className="campaign-filter-bar">
          {/* Search */}
          <div className="campaign-search-wrap">
            <Search size={14} className="campaign-search-icon" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search campaigns or locations…"
              className="campaign-search-input"
            />
          </div>

          {/* Type filters */}
          <div className="campaign-type-filters">
            {typeFilters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="campaign-type-filter-btn"
                style={{
                  background: filter === f ? 'var(--accent)' : 'var(--bg3)',
                  border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
                  color: filter === f ? '#fff' : 'var(--muted)',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="campaign-sort-wrap">
            <SlidersHorizontal size={13} style={{ color: 'var(--muted)' }} />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="campaign-sort-select"
            >
              {sortOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="campaign-list-empty">
          {query || filter !== 'All'
            ? 'No campaigns match your search.'
            : 'No campaigns yet — be the first to propose one.'}
        </div>
      ) : (
        <div className="campaign-list-grid">
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
        <div className="campaign-list-view-all">
          <button onClick={() => setTab('campaigns')} className="campaign-list-view-all-btn">
            View All Campaigns →
          </button>
        </div>
      )}

      {proposing && <Suspense fallback={null}><ProposeModal onClose={() => setProposing(false)} /></Suspense>}
    </section>
    </>
  )
}
