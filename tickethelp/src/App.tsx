import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import heroImg from './assets/hero.png'
import './App.css'

type TicketStatus = 'open' | 'pending' | 'resolved'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
type TicketCategory = 'ระบบใช้งาน' | 'บัญชีผู้ใช้' | 'อุปกรณ์' | 'เครือข่าย'

type Ticket = {
  id: string
  title: string
  requester: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  channel: string
  detail: string
  createdAt: string
  assignee: string
}

type TicketDraft = {
  title: string
  requester: string
  category: TicketCategory
  priority: TicketPriority
  channel: string
  detail: string
}

const categories: TicketCategory[] = [
  'ระบบใช้งาน',
  'บัญชีผู้ใช้',
  'อุปกรณ์',
  'เครือข่าย',
]

const priorities: TicketPriority[] = ['low', 'medium', 'high', 'urgent']
const statuses: TicketStatus[] = ['open', 'pending', 'resolved']

const priorityLabels: Record<TicketPriority, string> = {
  low: 'ต่ำ',
  medium: 'ปานกลาง',
  high: 'สูง',
  urgent: 'เร่งด่วน',
}

const statusLabels: Record<TicketStatus, string> = {
  open: 'เปิดใหม่',
  pending: 'รอตรวจสอบ',
  resolved: 'แก้ไขแล้ว',
}

const initialDraft: TicketDraft = {
  title: '',
  requester: '',
  category: 'ระบบใช้งาน',
  priority: 'medium',
  channel: 'Web portal',
  detail: '',
}

const initialTickets: Ticket[] = [
  {
    id: 'TK-2401',
    title: 'เข้า dashboard ไม่ได้หลังอัปเดตรหัสผ่าน',
    requester: 'Narin Wong',
    category: 'บัญชีผู้ใช้',
    priority: 'high',
    status: 'open',
    channel: 'Line OA',
    detail: 'ผู้ใช้เปลี่ยนรหัสผ่านแล้วระบบ redirect กลับหน้า login ซ้ำ',
    createdAt: '2026-07-01T09:15:00+07:00',
    assignee: 'IT Support',
  },
  {
    id: 'TK-2400',
    title: 'เครื่องพิมพ์ชั้น 3 แสดง offline',
    requester: 'Suda K.',
    category: 'อุปกรณ์',
    priority: 'medium',
    status: 'pending',
    channel: 'โทรศัพท์',
    detail: 'ทีมบัญชีใช้งานเครื่องพิมพ์ร่วมไม่ได้ตั้งแต่ช่วงเช้า',
    createdAt: '2026-07-01T08:40:00+07:00',
    assignee: 'Field Tech',
  },
  {
    id: 'TK-2399',
    title: 'VPN หลุดบ่อยระหว่างประชุมลูกค้า',
    requester: 'Anan P.',
    category: 'เครือข่าย',
    priority: 'urgent',
    status: 'open',
    channel: 'Email',
    detail: 'เกิดกับผู้ใช้ remote 4 คนในทีมขาย ต้องใช้ก่อนบ่ายนี้',
    createdAt: '2026-06-30T16:10:00+07:00',
    assignee: 'Network',
  },
  {
    id: 'TK-2398',
    title: 'ขอเพิ่มสิทธิ์เข้าถึงรายงานรายเดือน',
    requester: 'Mali S.',
    category: 'ระบบใช้งาน',
    priority: 'low',
    status: 'resolved',
    channel: 'Web portal',
    detail: 'อนุมัติสิทธิ์ตาม role ฝ่ายปฏิบัติการเรียบร้อย',
    createdAt: '2026-06-30T10:25:00+07:00',
    assignee: 'Admin',
  },
]

const nextStatus: Record<TicketStatus, TicketStatus> = {
  open: 'pending',
  pending: 'resolved',
  resolved: 'open',
}

function Icon({
  name,
  className,
}: {
  name: 'plus' | 'search' | 'ticket' | 'clock' | 'check' | 'chart'
  className?: string
}) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    search: <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" />,
    ticket: <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v1.25a2.25 2.25 0 0 0 0 4.5v1.25a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 14.5v-1.25a2.25 2.25 0 0 0 0-4.5V7.5Zm7-1v11" />,
    clock: <path d="M12 7v5l3.5 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    check: <path d="m5 12 4.2 4.2L19 6.5" />,
    chart: <path d="M5 19V5m0 14h14M9 16V9m4 7V7m4 9v-4" />,
  }

  return (
    <svg
      className={className ?? 'icon'}
      viewBox="0 0 24 24"
      role="presentation"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function App() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [draft, setDraft] = useState<TicketDraft>(initialDraft)
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>(
    'all',
  )
  const [searchTerm, setSearchTerm] = useState('')

  const summary = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === 'open').length,
      pending: tickets.filter((ticket) => ticket.status === 'pending').length,
      resolved: tickets.filter((ticket) => ticket.status === 'resolved').length,
    }),
    [tickets],
  )

  const filteredTickets = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('th-TH')

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === 'all' || ticket.status === statusFilter
      const matchesPriority =
        priorityFilter === 'all' || ticket.priority === priorityFilter
      const matchesSearch =
        query.length === 0 ||
        [ticket.id, ticket.title, ticket.requester, ticket.category]
          .join(' ')
          .toLocaleLowerCase('th-TH')
          .includes(query)

      return matchesStatus && matchesPriority && matchesSearch
    })
  }, [priorityFilter, searchTerm, statusFilter, tickets])

  function updateDraft<Key extends keyof TicketDraft>(
    key: Key,
    value: TicketDraft[Key],
  ) {
    setDraft((currentDraft) => ({ ...currentDraft, [key]: value }))
  }

  function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const ticket: Ticket = {
      id: `TK-${2401 + tickets.length}`,
      title: draft.title.trim(),
      requester: draft.requester.trim(),
      category: draft.category,
      priority: draft.priority,
      status: 'open',
      channel: draft.channel.trim() || 'Web portal',
      detail: draft.detail.trim(),
      createdAt: new Date().toISOString(),
      assignee: draft.priority === 'urgent' ? 'Incident Lead' : 'IT Support',
    }

    setTickets((currentTickets) => [ticket, ...currentTickets])
    setDraft(initialDraft)
    setStatusFilter('all')
  }

  function advanceTicket(id: string) {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === id
          ? { ...ticket, status: nextStatus[ticket.status] }
          : ticket,
      ),
    )
  }

  const canSubmit =
    draft.title.trim().length > 0 &&
    draft.requester.trim().length > 0 &&
    draft.detail.trim().length > 0

  return (
    <main className="app-shell">
      <header className="topbar" aria-label="Ticket Help">
        <a className="brand" href="#tickets" aria-label="Ticket Help home">
          <img src={heroImg} alt="" />
          <span>
            <strong>Ticket Help</strong>
            <small>ศูนย์รับแจ้งปัญหา</small>
          </span>
        </a>
        <nav aria-label="เมนูหลัก">
          <a href="#new-ticket">แจ้งปัญหา</a>
          <a href="#tickets">รายการ</a>
          <a href="#overview">ภาพรวม</a>
        </nav>
      </header>

      <section className="workspace">
        <section className="overview" id="overview" aria-label="ภาพรวม Ticket">
          <div className="overview-copy">
            <p className="eyebrow">Support Operations</p>
            <h1>รับเรื่องเร็ว เห็นลำดับงานชัด จบปัญหาได้เป็นระบบ</h1>
            <p>
              เปิด ticket ใหม่ ติดตามสถานะ และคัดกรองงานเร่งด่วนในหน้าเดียว
              เหมาะสำหรับทีม IT Support หรือ Helpdesk ภายในองค์กร
            </p>
          </div>

          <div className="metric-grid" aria-label="สรุปสถานะ">
            <article>
              <Icon name="ticket" />
              <span>Ticket ทั้งหมด</span>
              <strong>{summary.total}</strong>
            </article>
            <article>
              <Icon name="clock" />
              <span>เปิดใหม่</span>
              <strong>{summary.open}</strong>
            </article>
            <article>
              <Icon name="chart" />
              <span>รอตรวจสอบ</span>
              <strong>{summary.pending}</strong>
            </article>
            <article>
              <Icon name="check" />
              <span>แก้ไขแล้ว</span>
              <strong>{summary.resolved}</strong>
            </article>
          </div>
        </section>

        <section className="content-grid">
          <form className="ticket-form" id="new-ticket" onSubmit={createTicket}>
            <div className="section-heading">
              <span className="section-icon">
                <Icon name="plus" />
              </span>
              <div>
                <p className="eyebrow">New Ticket</p>
                <h2>แจ้งปัญหาใหม่</h2>
              </div>
            </div>

            <label>
              หัวข้อปัญหา
              <input
                value={draft.title}
                onChange={(event) => updateDraft('title', event.target.value)}
                placeholder="เช่น เข้าใช้งานระบบไม่ได้"
                required
              />
            </label>

            <div className="form-row">
              <label>
                ผู้แจ้ง
                <input
                  value={draft.requester}
                  onChange={(event) =>
                    updateDraft('requester', event.target.value)
                  }
                  placeholder="ชื่อผู้แจ้ง"
                  required
                />
              </label>
              <label>
                ช่องทาง
                <input
                  value={draft.channel}
                  onChange={(event) =>
                    updateDraft('channel', event.target.value)
                  }
                  placeholder="Web portal"
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                หมวดหมู่
                <select
                  value={draft.category}
                  onChange={(event) =>
                    updateDraft('category', event.target.value as TicketCategory)
                  }
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label>
                ความสำคัญ
                <select
                  value={draft.priority}
                  onChange={(event) =>
                    updateDraft(
                      'priority',
                      event.target.value as TicketPriority,
                    )
                  }
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              รายละเอียด
              <textarea
                value={draft.detail}
                onChange={(event) => updateDraft('detail', event.target.value)}
                placeholder="อธิบายอาการที่พบ ผลกระทบ และช่วงเวลาที่เกิดปัญหา"
                rows={5}
                required
              />
            </label>

            <button className="primary-action" type="submit" disabled={!canSubmit}>
              <Icon name="plus" />
              สร้าง Ticket
            </button>
          </form>

          <section className="ticket-board" id="tickets">
            <div className="board-header">
              <div className="section-heading">
                <span className="section-icon">
                  <Icon name="ticket" />
                </span>
                <div>
                  <p className="eyebrow">Queue</p>
                  <h2>รายการแจ้งปัญหา</h2>
                </div>
              </div>
              <div className="search-box">
                <Icon name="search" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ค้นหา ticket"
                  aria-label="ค้นหา ticket"
                />
              </div>
            </div>

            <div className="filter-bar" aria-label="ตัวกรอง Ticket">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as TicketStatus | 'all')
                }
                aria-label="กรองตามสถานะ"
              >
                <option value="all">ทุกสถานะ</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value as TicketPriority | 'all')
                }
                aria-label="กรองตามความสำคัญ"
              >
                <option value="all">ทุกความสำคัญ</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priorityLabels[priority]}
                  </option>
                ))}
              </select>
            </div>

            <div className="ticket-list">
              {filteredTickets.map((ticket) => (
                <article className="ticket-card" key={ticket.id}>
                  <div className="ticket-card-header">
                    <div>
                      <span className="ticket-id">{ticket.id}</span>
                      <h3>{ticket.title}</h3>
                    </div>
                    <span className={`status-pill ${ticket.status}`}>
                      {statusLabels[ticket.status]}
                    </span>
                  </div>

                  <p>{ticket.detail}</p>

                  <div className="ticket-meta">
                    <span>{ticket.requester}</span>
                    <span>{ticket.category}</span>
                    <span>{ticket.channel}</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                  </div>

                  <div className="ticket-footer">
                    <span className={`priority ${ticket.priority}`}>
                      {priorityLabels[ticket.priority]}
                    </span>
                    <span className="assignee">ผู้ดูแล: {ticket.assignee}</span>
                    <button type="button" onClick={() => advanceTicket(ticket.id)}>
                      <Icon name="check" />
                      อัปเดตสถานะ
                    </button>
                  </div>
                </article>
              ))}

              {filteredTickets.length === 0 && (
                <div className="empty-state">
                  <Icon name="search" />
                  <h3>ไม่พบ Ticket ที่ตรงกับตัวกรอง</h3>
                  <p>ลองปรับคำค้นหา สถานะ หรือความสำคัญอีกครั้ง</p>
                </div>
              )}
            </div>
          </section>
        </section>
      </section>
    </main>
  )
}

export default App
