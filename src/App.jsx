import { useEffect, useMemo, useState } from 'react'
import './App.css'

const categoryMeta = {
  Food: { color: '#FF9F43', accent: '#FFB84D', icon: '🍽️' },
  Shopping: { color: '#6C5CE7', accent: '#8376F2', icon: '🛍️' },
  Transport: { color: '#4D96FF', accent: '#7EB6FF', icon: '🚗' },
  Entertainment: { color: '#FF5C7A', accent: '#FF7F98', icon: '🎬' },
  Bills: { color: '#00C2A8', accent: '#51D9C4', icon: '💡' },
  Health: { color: '#59C3FF', accent: '#72D7FF', icon: '💊' },
  Education: { color: '#F7C948', accent: '#FFD977', icon: '🎓' },
  Other: { color: '#8A93B9', accent: '#AAB8E8', icon: '📦' },
}

const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const month = new Date(2024, index, 1)
  return { label: month.toLocaleDateString('en-US', { month: 'short' }), value: `${month.getFullYear()}-${String(index + 1).padStart(2, '0')}` }
})

const defaultBudgets = {
  Food: 800,
  Shopping: 720,
  Transport: 420,
  Entertainment: 380,
  Bills: 980,
  Health: 360,
  Education: 450,
  Other: 300,
}

const sampleTransactions = [
  { id: 1, date: '2024-01-03', description: 'Salary', category: 'Other', type: 'Income', amount: 4200 },
  { id: 2, date: '2024-01-05', description: 'Fresh Market', category: 'Food', type: 'Expense', amount: 86.1 },
  { id: 3, date: '2024-01-09', description: 'City Metro', category: 'Transport', type: 'Expense', amount: 42.5 },
  { id: 4, date: '2024-01-15', description: 'Electric Bill', category: 'Bills', type: 'Expense', amount: 132.4 },
  { id: 5, date: '2024-01-18', description: 'Gym Membership', category: 'Health', type: 'Expense', amount: 58 },
  { id: 6, date: '2024-02-02', description: 'Freelance Design', category: 'Other', type: 'Income', amount: 980 },
  { id: 7, date: '2024-02-06', description: 'Grocery Run', category: 'Food', type: 'Expense', amount: 92.8 },
  { id: 8, date: '2024-02-14', description: 'Uniqlo Haul', category: 'Shopping', type: 'Expense', amount: 128.4 },
  { id: 9, date: '2024-02-20', description: 'Streaming Bundle', category: 'Entertainment', type: 'Expense', amount: 18.99 },
  { id: 10, date: '2024-02-25', description: 'Fuel Top-Up', category: 'Transport', type: 'Expense', amount: 68.2 },
  { id: 11, date: '2024-03-01', description: 'Salary', category: 'Other', type: 'Income', amount: 4200 },
  { id: 12, date: '2024-03-07', description: 'Restaurant Night', category: 'Food', type: 'Expense', amount: 74.6 },
  { id: 13, date: '2024-03-12', description: 'Online Course', category: 'Education', type: 'Expense', amount: 220 },
  { id: 14, date: '2024-03-17', description: 'Water & Gas', category: 'Bills', type: 'Expense', amount: 146.7 },
  { id: 15, date: '2024-03-21', description: 'Pharmacy', category: 'Health', type: 'Expense', amount: 41.1 },
  { id: 16, date: '2024-04-03', description: 'Bonus', category: 'Other', type: 'Income', amount: 1200 },
  { id: 17, date: '2024-04-08', description: 'Weekly Groceries', category: 'Food', type: 'Expense', amount: 96.5 },
  { id: 18, date: '2024-04-13', description: 'New Headphones', category: 'Shopping', type: 'Expense', amount: 219 },
  { id: 19, date: '2024-04-22', description: 'Movie Night', category: 'Entertainment', type: 'Expense', amount: 36.4 },
  { id: 20, date: '2024-04-28', description: 'Mobile Plan', category: 'Bills', type: 'Expense', amount: 64.8 },
  { id: 21, date: '2024-05-02', description: 'Salary', category: 'Other', type: 'Income', amount: 4200 },
  { id: 22, date: '2024-05-09', description: 'Farmers Market', category: 'Food', type: 'Expense', amount: 118.7 },
  { id: 23, date: '2024-05-16', description: 'Flight Booking', category: 'Transport', type: 'Expense', amount: 180 },
  { id: 24, date: '2024-05-20', description: 'Doctor Visit', category: 'Health', type: 'Expense', amount: 88.4 },
  { id: 25, date: '2024-05-26', description: 'App Store', category: 'Entertainment', type: 'Expense', amount: 22.2 },
  { id: 26, date: '2024-06-01', description: 'Salary', category: 'Other', type: 'Income', amount: 4200 },
  { id: 27, date: '2024-06-05', description: 'Supplements', category: 'Health', type: 'Expense', amount: 62.9 },
  { id: 28, date: '2024-06-11', description: 'Home Depot', category: 'Shopping', type: 'Expense', amount: 210.5 },
  { id: 29, date: '2024-06-15', description: 'Workshop Fee', category: 'Education', type: 'Expense', amount: 145 },
  { id: 30, date: '2024-06-24', description: 'Family Dinner', category: 'Food', type: 'Expense', amount: 132.2 },
  { id: 31, date: '2024-07-03', description: 'Salary', category: 'Other', type: 'Income', amount: 4200 },
  { id: 32, date: '2024-07-07', description: 'Grocery Order', category: 'Food', type: 'Expense', amount: 96.9 },
  { id: 33, date: '2024-07-13', description: 'Internet Bill', category: 'Bills', type: 'Expense', amount: 74.2 },
  { id: 34, date: '2024-07-18', description: 'Concert Tickets', category: 'Entertainment', type: 'Expense', amount: 148.5 },
  { id: 35, date: '2024-07-25', description: 'Weekend Trip', category: 'Transport', type: 'Expense', amount: 224 },
  { id: 36, date: '2024-08-02', description: 'Salary', category: 'Other', type: 'Income', amount: 4200 },
  { id: 37, date: '2024-08-05', description: 'Fresh Produce', category: 'Food', type: 'Expense', amount: 84.6 },
  { id: 38, date: '2024-08-14', description: 'Clothing Purchase', category: 'Shopping', type: 'Expense', amount: 176.3 },
  { id: 39, date: '2024-08-21', description: 'Rent', category: 'Bills', type: 'Expense', amount: 1320 },
  { id: 40, date: '2024-08-27', description: 'Yoga Membership', category: 'Health', type: 'Expense', amount: 60 },
  { id: 41, date: '2024-09-01', description: 'Salary', category: 'Other', type: 'Income', amount: 4200 },
  { id: 42, date: '2024-09-04', description: 'Organic Groceries', category: 'Food', type: 'Expense', amount: 104.7 },
  { id: 43, date: '2024-09-12', description: 'Course Materials', category: 'Education', type: 'Expense', amount: 188 },
  { id: 44, date: '2024-09-18', description: 'Uber Rides', category: 'Transport', type: 'Expense', amount: 52.8 },
  { id: 45, date: '2024-09-24', description: 'Theater Show', category: 'Entertainment', type: 'Expense', amount: 98.1 },
  { id: 46, date: '2024-10-02', description: 'Salary', category: 'Other', type: 'Income', amount: 4200 },
  { id: 47, date: '2024-10-05', description: 'Weekly Groceries', category: 'Food', type: 'Expense', amount: 121.4 },
  { id: 48, date: '2024-10-07', description: 'Netflix Subscription', category: 'Entertainment', type: 'Expense', amount: 15.99 },
  { id: 49, date: '2024-10-08', description: 'Lounge Chair', category: 'Shopping', type: 'Expense', amount: 245 },
  { id: 50, date: '2024-10-11', description: 'Transport Pass', category: 'Transport', type: 'Expense', amount: 76.5 },
  { id: 51, date: '2024-10-16', description: 'Rent', category: 'Bills', type: 'Expense', amount: 1320 },
  { id: 52, date: '2024-10-19', description: 'Health Checkup', category: 'Health', type: 'Expense', amount: 140 },
  { id: 53, date: '2024-10-23', description: 'Design Course', category: 'Education', type: 'Expense', amount: 210 },
  { id: 54, date: '2024-11-03', description: 'Salary', category: 'Other', type: 'Income', amount: 4200 },
  { id: 55, date: '2024-11-08', description: 'Holiday Shopping', category: 'Shopping', type: 'Expense', amount: 340 },
  { id: 56, date: '2024-11-12', description: 'Grocery Delivery', category: 'Food', type: 'Expense', amount: 136 },
  { id: 57, date: '2024-11-18', description: 'Gas & Transit', category: 'Transport', type: 'Expense', amount: 94 },
  { id: 58, date: '2024-11-20', description: 'Clinic Visit', category: 'Health', type: 'Expense', amount: 74.2 },
  { id: 59, date: '2024-12-02', description: 'Salary', category: 'Other', type: 'Income', amount: 4200 },
  { id: 60, date: '2024-12-07', description: 'Holiday Groceries', category: 'Food', type: 'Expense', amount: 187.5 },
  { id: 61, date: '2024-12-09', description: 'Gift Shopping', category: 'Shopping', type: 'Expense', amount: 290 },
  { id: 62, date: '2024-12-14', description: 'Concert Tickets', category: 'Entertainment', type: 'Expense', amount: 220 },
  { id: 63, date: '2024-12-18', description: 'Rent', category: 'Bills', type: 'Expense', amount: 1320 },
]

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'categories', label: 'Categories' },
]

const formatCurrency = (value, compact = false) => {
  const amount = Math.abs(value)
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: compact ? 1 : 2,
  })

  return value >= 0 ? formatter.format(value) : `-${formatter.format(amount)}`
}

const parseMonth = (date) => date.slice(0, 7)

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

function App() {
  const [theme, setTheme] = useState('dark')
  const [activeSection, setActiveSection] = useState('dashboard')
  const [transactions, setTransactions] = useState(sampleTransactions)
  const [budgets, setBudgets] = useState(defaultBudgets)
  const [selectedMonth, setSelectedMonth] = useState('2024-10')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [hoveredMonth, setHoveredMonth] = useState('2024-10')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [analyticsRange, setAnalyticsRange] = useState('This Month')
  const [mobileNav, setMobileNav] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [budgetEditor, setBudgetEditor] = useState(null)
  const [toast, setToast] = useState(null)

  const [transactionForm, setTransactionForm] = useState({
    type: 'Expense',
    amount: '',
    description: '',
    category: 'Food',
    date: '2024-10-30',
    notes: '',
  })

  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timeout)
  }, [toast])

  const monthTotals = useMemo(() => {
    return monthOptions.map((month) => {
      const monthTx = transactions.filter((item) => parseMonth(item.date) === month.value)
      const income = monthTx.filter((item) => item.type === 'Income').reduce((sum, item) => sum + item.amount, 0)
      const expenses = monthTx.filter((item) => item.type === 'Expense').reduce((sum, item) => sum + item.amount, 0)
      const savings = income - expenses
      return {
        month: month.value,
        label: month.label,
        income,
        expenses,
        savings,
      }
    })
  }, [transactions])

  const categoryTotals = useMemo(() => {
    const totals = Object.keys(categoryMeta).reduce((accumulator, key) => {
      accumulator[key] = 0
      return accumulator
    }, {})

    transactions
      .filter((item) => item.type === 'Expense')
      .forEach((item) => {
        totals[item.category] += item.amount
      })

    return totals
  }, [transactions])

  const selectedMonthData = useMemo(
    () => monthTotals.find((item) => item.month === selectedMonth) ?? { income: 0, expenses: 0, savings: 0 },
    [monthTotals, selectedMonth],
  )

  const totalBalance = useMemo(
    () => transactions.reduce((sum, item) => sum + (item.type === 'Income' ? item.amount : -item.amount), 0),
    [transactions],
  )

  const monthlyIncome = selectedMonthData.income
  const monthlyExpenses = selectedMonthData.expenses
  const monthlySavings = selectedMonthData.savings
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0

  const categorySpendInMonth = useMemo(() => {
    const selected = Object.keys(categoryMeta).reduce((accumulator, category) => {
      accumulator[category] = 0
      return accumulator
    }, {})

    transactions
      .filter((item) => item.type === 'Expense' && parseMonth(item.date) === selectedMonth)
      .forEach((item) => {
        selected[item.category] += item.amount
      })

    return selected
  }, [transactions, selectedMonth])

  const budgetCards = useMemo(
    () =>
      Object.entries(categoryMeta).map(([category, meta]) => {
        const budget = budgets[category] ?? 0
        const spent = categorySpendInMonth[category] ?? 0
        const remaining = budget - spent
        const progress = budget > 0 ? (spent / budget) * 100 : 0
        const status = progress > 100 ? 'Budget exceeded' : progress >= 80 ? 'Near limit' : 'On track'

        return {
          category,
          budget,
          spent,
          remaining,
          progress: clamp(progress, 0, 140),
          status,
          color: meta.color,
          icon: meta.icon,
        }
      }),
    [budgets, categorySpendInMonth],
  )

  const totalSpending = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0)

  const donutSegments = useMemo(() => {
    const data = Object.entries(categoryTotals)
      .map(([category, value]) => ({ category, value, color: categoryMeta[category].color }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)

    return data.reduce((segments, item) => {
      const segmentLength = (item.value / totalSpending) * 100
      const previousSegment = segments.at(-1)
      segments.push({
        ...item,
        length: segmentLength,
        offset: previousSegment ? previousSegment.offset + previousSegment.length : 0,
      })
      return segments
    }, [])
  }, [categoryTotals, totalSpending])

  const filteredTransactions = useMemo(() => {
    const q = search.toLowerCase().trim()

    const list = transactions.filter((item) => {
      const matchesSearch = !q || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
      const matchesType = typeFilter === 'All' || item.type === typeFilter
      const matchesDate = !dateFilter || item.date === dateFilter

      return matchesSearch && matchesCategory && matchesType && matchesDate
    })

    return list.sort((a, b) => {
      const amountA = a.type === 'Income' ? a.amount : -a.amount
      const amountB = b.type === 'Income' ? b.amount : -b.amount
      return amountB - amountA
    })
  }, [transactions, search, categoryFilter, typeFilter, dateFilter])

  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize))
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const selectedRangeData = useMemo(() => {
    const now = new Date('2024-12-31T00:00:00')
    const ranges = {
      'This Week': 7,
      'This Month': 30,
      'Last 3 Months': 90,
      'Last 6 Months': 180,
      'This Year': 365,
    }

    const days = ranges[analyticsRange] || 30
    const data = Array.from({ length: Math.min(days, 12) }, (_, index) => {
      const date = new Date(now)
      date.setDate(now.getDate() - (Math.min(days, 12) - index - 1))
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const tx = transactions.filter((item) => {
        const itemDate = new Date(`${item.date}T00:00:00`)
        return itemDate >= new Date(date.setHours(0, 0, 0, 0)) && itemDate <= new Date(date.setHours(23, 59, 59, 999))
      })
      const value = tx.filter((item) => item.type === 'Expense').reduce((sum, item) => sum + item.amount, 0)
      return { label, value }
    })

    return data
  }, [analyticsRange, transactions])

  const balanceDelta = useMemo(() => {
    const currentIndex = monthTotals.findIndex((item) => item.month === selectedMonth)
    if (currentIndex <= 0) return 0
    const prev = monthTotals[currentIndex - 1]
    const current = monthTotals[currentIndex]
    return prev.expenses ? ((current.expenses - prev.expenses) / prev.expenses) * 100 : 0
  }, [monthTotals, selectedMonth])

  const score = useMemo(() => {
    const budgetAverage = budgetCards.reduce((accumulator, item) => accumulator + clamp(item.progress / 100, 0, 1), 0) / budgetCards.length
    const savingsNormalized = clamp(monthlyIncome ? monthlySavings / monthlyIncome : 0, 0, 1)
    const expenseRatio = monthlyIncome ? clamp(monthlyExpenses / monthlyIncome, 0, 1) : 0
    const health = Math.round((savingsNormalized * 0.45 + (1 - budgetAverage) * 0.35 + (1 - expenseRatio) * 0.2) * 100)
    return clamp(health, 0, 100)
  }, [budgetCards, monthlyExpenses, monthlyIncome, monthlySavings])

  const scoreLabel = score >= 85 ? 'Excellent' : score >= 70 ? 'Strong' : score >= 50 ? 'Improving' : 'Needs focus'
  const scoreText = score >= 85 ? 'You are doing great. Your savings rate improved by 6% this month.' : score >= 70 ? 'Your cash flow is healthy. Keep reducing variable spending.' : 'Your budget is a little stretched. Trim discretionary expenses.'

  const triggerToast = (message) => setToast(message)

  const openBudgetEditor = (category, value) => setBudgetEditor({ category, value })

  const updateBudget = () => {
    if (!budgetEditor) return
    const nextValue = Number(budgetEditor.value)
    if (Number.isNaN(nextValue) || nextValue <= 0) return
    setBudgets((prev) => ({ ...prev, [budgetEditor.category]: nextValue }))
    setBudgetEditor(null)
    triggerToast('Budget updated successfully')
  }

  const submitTransaction = (event) => {
    event.preventDefault()
    const amount = Number(transactionForm.amount)
    if (!transactionForm.description.trim() || !transactionForm.category || !transactionForm.date || !amount || amount <= 0) {
      triggerToast('Please complete all required fields')
      return
    }

    const newTransaction = {
      id: Date.now(),
      description: transactionForm.description.trim(),
      category: transactionForm.category,
      type: transactionForm.type,
      amount,
      date: transactionForm.date,
      notes: transactionForm.notes,
    }

    setTransactions((prev) => [newTransaction, ...prev])
    setSelectedMonth(parseMonth(transactionForm.date))
    setIsModalOpen(false)
    setTransactionForm({
      type: 'Expense',
      amount: '',
      description: '',
      category: 'Food',
      date: '2024-10-30',
      notes: '',
    })
    triggerToast('Transaction added successfully')
  }

  const metricCards = [
    {
      title: 'Total Balance',
      value: formatCurrency(totalBalance),
      change: '+8.4% this month',
      trend: [40, 55, 44, 70, 64, 92, 80],
      positive: true,
      accent: '#6C5CE7',
    },
    {
      title: 'Monthly Income',
      value: formatCurrency(monthlyIncome),
      change: `${monthlyIncome > 0 ? '+' : ''}${((monthlySavings / Math.max(monthlyIncome, 1)) * 100).toFixed(1)}% vs avg`,
      trend: [25, 40, 39, 60, 80, 76, 92],
      positive: true,
      accent: '#00C2A8',
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(monthlyExpenses),
      change: `${balanceDelta >= 0 ? '+' : ''}${balanceDelta.toFixed(1)}% this period`,
      trend: [78, 68, 72, 56, 60, 65, 74],
      positive: false,
      accent: '#FF5C7A',
    },
    {
      title: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      change: monthlySavings >= 0 ? 'Healthy cushion' : 'Needs review',
      trend: [26, 32, 28, 41, 52, 55, 63],
      positive: true,
      accent: '#FFB84D',
    },
  ]

  const chartBars = monthTotals.map((month) => ({ ...month, x: 80 + monthOptions.findIndex((item) => item.value === month.month) * 52 }))

  const renderSparkline = (values, accent) => (
    <svg viewBox="0 0 100 32" className="sparkline" aria-label="Mini trend chart">
      <path d={values.map((value, index) => `${index === 0 ? 'M' : 'L'} ${index * 16},${32 - value}`).join(' ')} stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand-box">
          <div className="brand-mark">F</div>
          <div>
            <div className="brand-name">Fintura</div>
            <small>Finance OS</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(item.id)
                setMobileNav(false)
              }}
            >
              <span className="nav-bullet" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-card">
          <div className="card-label">Financial Health</div>
          <div className="health-ring" style={{ '--progress': `${score}%` }}>
            <div className="health-ring-inner">
              <strong>{score}</strong>
              <span>/ 100</span>
            </div>
          </div>
          <div className="health-title">{scoreLabel}</div>
          <p>{scoreText}</p>
        </div>

        <button type="button" className="theme-toggle" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
          {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
        </button>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="header-left">
            <button type="button" className="mobile-menu" onClick={() => setMobileNav((v) => !v)}>☰</button>
            <div>
              <div className="eyebrow">Overview</div>
              <h1>{activeSection === 'analytics' ? 'Analytics' : activeSection === 'transactions' ? 'Transactions' : activeSection === 'budgets' ? 'Monthly Budgets' : activeSection === 'categories' ? 'Spending Trends' : 'Dashboard'}</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} aria-label="Select month">
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>{month.label} 2024</option>
              ))}
            </select>

            <label className="search-box">
              <span>⌕</span>
              <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1) }} placeholder="Search transactions" />
            </label>

            <button type="button" className="icon-btn" aria-label="Notifications">🔔</button>
            <div className="user-pill">
              <div className="avatar">AR</div>
              <div>
                <strong>Alex Ross</strong>
                <small>Premium</small>
              </div>
            </div>
            <button type="button" className="primary-btn" onClick={() => setIsModalOpen(true)}>+ Add Transaction</button>
          </div>
        </header>

        {activeSection === 'dashboard' && (
          <>
            <section className="metrics-grid">
              {metricCards.map((card) => (
                <article key={card.title} className="metric-card" style={{ '--metric-color': card.accent }}>
                  <div className="metric-top">
                    <span>{card.title}</span>
                    <span className={`metric-status ${card.positive ? 'up' : 'down'}`}>{card.positive ? '↗' : '↘'}</span>
                  </div>
                  <div className="metric-value">{card.value}</div>
                  <div className="metric-meta">
                    <strong>{card.change}</strong>
                    {renderSparkline(card.trend, card.accent)}
                  </div>
                </article>
              ))}
            </section>

            <section className="main-grid">
              <article className="panel panel-chart wide-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-kicker">Cash flow</div>
                    <h2>Monthly Cash Flow</h2>
                  </div>
                  <div className="legend">
                    <span><i className="legend-dot income" /> Income</span>
                    <span><i className="legend-dot expense" /> Expenses</span>
                  </div>
                </div>

                <div className="cashflow-chart-container">
                  <svg viewBox="0 0 760 270" className="cashflow-svg" aria-label="Monthly cash flow chart">
                    {[0, 1, 2, 3].map((line) => (
                      <line key={line} x1="40" y1={40 + line * 55} x2="720" y2={40 + line * 55} stroke="rgba(143, 161, 204, 0.2)" strokeDasharray="5 5" />
                    ))}

                    {chartBars.map((bar) => {
                      const incomeHeight = (bar.income / 5200) * 160
                      const expenseHeight = (bar.expenses / 5200) * 160
                      const isActive = bar.month === hoveredMonth

                      return (
                        <g key={bar.month} onMouseEnter={() => setHoveredMonth(bar.month)}>
                          <rect x={bar.x - 18} y={170 - incomeHeight} width="16" height={incomeHeight} rx="8" fill="#00C2A8" opacity={isActive ? 1 : 0.82} />
                          <rect x={bar.x + 6} y={170 - expenseHeight} width="16" height={expenseHeight} rx="8" fill="#FF5C7A" opacity={isActive ? 1 : 0.82} />
                          <text x={bar.x + 2} y="240" fill="var(--muted)" fontSize="11" textAnchor="middle">{bar.label}</text>
                        </g>
                      )
                    })}
                  </svg>

                  <div className="chart-hover-card">
                    <div className="hover-label">{new Date(`${hoveredMonth}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
                    <div className="hover-row"><span>Income</span><strong>{formatCurrency(monthTotals.find((month) => month.month === hoveredMonth)?.income ?? 0)}</strong></div>
                    <div className="hover-row"><span>Expenses</span><strong>{formatCurrency(monthTotals.find((month) => month.month === hoveredMonth)?.expenses ?? 0)}</strong></div>
                    <div className="hover-row"><span>Savings</span><strong>{formatCurrency(monthTotals.find((month) => month.month === hoveredMonth)?.savings ?? 0)}</strong></div>
                    <div className="hover-row"><span>Savings %</span><strong>{((monthTotals.find((month) => month.month === hoveredMonth)?.savings ?? 0) / Math.max(monthTotals.find((month) => month.month === hoveredMonth)?.income ?? 1, 1) * 100).toFixed(1)}%</strong></div>
                  </div>
                </div>
              </article>

              <article className="panel donut-panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">Spend breakdown</div>
                    <h2>Where Your Money Goes</h2>
                  </div>
                </div>

                <div className="donut-wrap">
                  <svg viewBox="0 0 220 220" className="donut-svg">
                    <circle cx="110" cy="110" r="54" fill="none" stroke="var(--panel-alt)" strokeWidth="18" />
                    {donutSegments.map((segment) => (
                      <circle
                        key={segment.category}
                        cx="110"
                        cy="110"
                        r="54"
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={`${(segment.length / 100) * 339} 339`}
                        strokeDashoffset={-((segment.offset / 100) * 339)}
                        transform="rotate(-90 110 110)"
                        className="donut-segment"
                        onClick={() => setSelectedCategory(selectedCategory === segment.category ? 'All' : segment.category)}
                      />
                    ))}
                    <text x="110" y="96" textAnchor="middle" className="donut-total-label">Total Spending</text>
                    <text x="110" y="128" textAnchor="middle" className="donut-total-value">{formatCurrency(totalSpending)}</text>
                  </svg>
                </div>

                <div className="category-rankings">
                  {Object.entries(categoryMeta)
                    .map(([category, meta]) => {
                      const amount = categoryTotals[category] ?? 0
                      const percent = totalSpending > 0 ? (amount / totalSpending) * 100 : 0
                      return (
                        <button key={category} type="button" className={`ranking-row ${selectedCategory === category ? 'selected' : ''}`} onClick={() => { setSelectedCategory(selectedCategory === category ? 'All' : category); setCategoryFilter(selectedCategory === category ? 'All' : category) }}>
                          <span className="row-left"><i style={{ background: meta.color }} /> {meta.icon} {category}</span>
                          <span className="row-amount">{formatCurrency(amount)}</span>
                          <span className="row-percent">{percent.toFixed(0)}%</span>
                          <span className="row-progress"><i style={{ width: `${Math.min(percent, 100)}%`, background: meta.color }} /></span>
                        </button>
                      )
                    })
                    .slice(0, 6)}
                </div>
              </article>
            </section>

            <section className="bottom-grid">
              <article className="panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">Monthly budgets</div>
                    <h2>Monthly Budgets</h2>
                  </div>
                </div>

                <div className="budget-list">
                  {budgetCards.map((card) => (
                    <div key={card.category} className="budget-item">
                      <div className="budget-row">
                        <div className="budget-label-group">
                          <span className="budget-dot" style={{ background: card.color }} />
                          <span>{card.icon} {card.category}</span>
                        </div>
                        <button type="button" className="text-btn" onClick={() => openBudgetEditor(card.category, card.budget)}>Edit Budget</button>
                      </div>

                      <div className="budget-stats">
                        <span>Budget: {formatCurrency(card.budget)}</span>
                        <span>Spent: {formatCurrency(card.spent)}</span>
                        <span>Remaining: {formatCurrency(card.remaining)}</span>
                      </div>

                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${Math.min(card.progress, 120)}%`, background: card.progress >= 100 ? '#FF5C7A' : card.progress >= 80 ? '#FFB84D' : '#00C2A8' }} />
                      </div>

                      <div className="budget-footer">
                        <strong>{card.progress.toFixed(1)}%</strong>
                        <span className={card.progress > 100 ? 'danger' : card.progress >= 80 ? 'warning' : 'success'}>{card.progress > 100 ? 'Budget exceeded' : card.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel transactions-panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">Recent activity</div>
                    <h2>Transactions</h2>
                  </div>
                </div>

                <div className="filter-bar">
                  <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setCurrentPage(1) }}>
                    <option value="All">All categories</option>
                    {Object.keys(categoryMeta).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setCurrentPage(1) }}>
                    <option value="All">All types</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                  <input type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setCurrentPage(1) }} />
                  <button type="button" className="clear-btn" onClick={() => { setCategoryFilter('All'); setTypeFilter('All'); setDateFilter(''); setSearch(''); setCurrentPage(1) }}>Reset</button>
                </div>

                <div className="transaction-list">
                  {paginatedTransactions.length === 0 ? (
                    <div className="empty-state">
                      <h3>No matching transactions</h3>
                      <p>Try changing your filters or search.</p>
                    </div>
                  ) : (
                    paginatedTransactions.map((item) => (
                      <div key={item.id} className="transaction-row">
                        <div className="transaction-date">
                          <strong>{new Date(`${item.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
                          <small>{new Date(`${item.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })}</small>
                        </div>
                        <div className="transaction-main">
                          <strong>{item.description}</strong>
                          <span>{item.notes || 'No notes'}</span>
                        </div>
                        <div className="category-badge" style={{ background: `${categoryMeta[item.category]?.color}22`, color: categoryMeta[item.category]?.color }}>
                          {categoryMeta[item.category]?.icon} {item.category}
                        </div>
                        <div className={`type-pill ${item.type === 'Income' ? 'income' : 'expense'}`}>{item.type}</div>
                        <div className={`amount ${item.type === 'Income' ? 'income' : 'expense'}`}>{item.type === 'Income' ? '+' : '-'}{formatCurrency(item.amount)}</div>
                        <button type="button" className="table-action">View</button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pagination">
                  <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>Prev</button>
                  <span>{currentPage} / {totalPages}</span>
                  <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>Next</button>
                </div>
              </article>
            </section>
          </>
        )}

        {activeSection === 'analytics' && (
          <section className="analytics-page">
            <div className="range-toolbar">
              {['This Week', 'This Month', 'Last 3 Months', 'Last 6 Months', 'This Year'].map((range) => (
                <button key={range} type="button" className={analyticsRange === range ? 'range-btn active' : 'range-btn'} onClick={() => setAnalyticsRange(range)}>{range}</button>
              ))}
            </div>

            <div className="analytics-grid">
              <article className="panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">Spending</div>
                    <h2>Monthly Spending</h2>
                  </div>
                </div>
                <svg viewBox="0 0 360 180" className="mini-chart">
                  {selectedRangeData.map((point, index) => (
                    <g key={point.label}>
                      <rect x={18 + index * 28} y={150 - (point.value / 300) * 100} width="16" height={(point.value / 300) * 100} rx="6" fill="#FF5C7A" opacity="0.9" />
                      <text x={26 + index * 28} y="170" textAnchor="middle" fontSize="8" fill="var(--muted)">{point.label.split(' ')[0]}</text>
                    </g>
                  ))}
                </svg>
              </article>

              <article className="panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">Performance</div>
                    <h2>Income vs Expense</h2>
                  </div>
                </div>
                <svg viewBox="0 0 360 180" className="mini-chart">
                  <path d="M 20 130 L 60 110 L 120 96 L 180 90 L 240 112 L 300 60 L 340 70" fill="none" stroke="#00C2A8" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 20 145 L 60 128 L 120 116 L 180 100 L 240 120 L 300 90 L 340 118" fill="none" stroke="#FF5C7A" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </article>

              <article className="panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">Category mix</div>
                    <h2>Category Donut</h2>
                  </div>
                </div>
                <div className="analytics-donut">
                  <svg viewBox="0 0 180 180">
                    <circle cx="90" cy="90" r="52" fill="none" stroke="var(--panel-alt)" strokeWidth="16" />
                    {donutSegments.slice(0, 5).map((segment, index) => (
                      <circle key={segment.category} cx="90" cy="90" r="52" fill="none" stroke={segment.color} strokeWidth="16" strokeDasharray={`${(segment.length / 100) * 326} 326`} strokeDashoffset={-((segment.offset / 100) * 326) + index * 10} transform="rotate(-90 90 90)" />
                    ))}
                  </svg>
                </div>
              </article>

              <article className="panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">Daily spend</div>
                    <h2>Daily Spending</h2>
                  </div>
                </div>
                <svg viewBox="0 0 360 180" className="mini-chart">
                  <path d="M 20 140 C 50 120, 80 110, 100 100 S 170 80, 210 90 S 290 40, 340 65" fill="none" stroke="#4D96FF" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </article>

              <article className="panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">Savings</div>
                    <h2>Savings Trend</h2>
                  </div>
                </div>
                <svg viewBox="0 0 360 180" className="mini-chart">
                  <path d="M 20 120 L 60 98 L 110 104 L 170 86 L 220 70 L 280 60 L 340 40" fill="none" stroke="#00C2A8" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </article>

              <article className="panel">
                <div className="panel-header compact">
                  <div>
                    <div className="panel-kicker">Top categories</div>
                    <h2>Spend Leaders</h2>
                  </div>
                </div>
                <div className="leader-list">
                  {Object.entries(categoryTotals)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, value]) => (
                      <div key={category} className="leader-item">
                        <span>{categoryMeta[category]?.icon} {category}</span>
                        <strong>{formatCurrency(value)}</strong>
                      </div>
                    ))}
                </div>
              </article>
            </div>
          </section>
        )}

        {activeSection === 'transactions' && (
          <section className="panel section-panel">
            <div className="panel-header compact">
              <div>
                <div className="panel-kicker">Filtered view</div>
                <h2>Transaction History</h2>
              </div>
              <button type="button" className="primary-btn" onClick={() => setIsModalOpen(true)}>+ Add Transaction</button>
            </div>

            <div className="filter-bar large">
              <select value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setCurrentPage(1) }}>
                <option value="All">All categories</option>
                {Object.keys(categoryMeta).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select value={typeFilter} onChange={(event) => { setTypeFilter(event.target.value); setCurrentPage(1) }}>
                <option value="All">All types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
              <input type="date" value={dateFilter} onChange={(event) => { setDateFilter(event.target.value); setCurrentPage(1) }} />
              <select value="amount-desc" aria-label="Sort amount">
                <option value="amount-desc">Amount: Highest</option>
              </select>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="empty-state large">
                <h3>No matching transactions</h3>
                <p>Try changing your filters or search.</p>
                <button type="button" className="primary-btn" onClick={() => setIsModalOpen(true)}>+ Add Transaction</button>
              </div>
            ) : (
              <div className="transaction-list full-width">
                {filteredTransactions.slice(0, 8).map((item) => (
                  <div key={item.id} className="transaction-card">
                    <div className="transaction-card-header">
                      <strong>{item.description}</strong>
                      <div className={`amount ${item.type === 'Income' ? 'income' : 'expense'}`}>{item.type === 'Income' ? '+' : '-'}{formatCurrency(item.amount)}</div>
                    </div>
                    <div className="transaction-card-meta">
                      <span>{new Date(`${item.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>{item.type}</span>
                      <span>{item.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === 'budgets' && (
          <section className="panel section-panel">
            <div className="panel-header compact">
              <div>
                <div className="panel-kicker">Category planning</div>
                <h2>Budget Adjustments</h2>
              </div>
            </div>
            <div className="budget-grid-full">
              {budgetCards.map((card) => (
                <div key={card.category} className="budget-card full">
                  <div className="budget-card-header">
                    <div className="budget-label-group"><span className="budget-dot" style={{ background: card.color }} />{card.icon} {card.category}</div>
                    <button type="button" className="text-btn" onClick={() => openBudgetEditor(card.category, card.budget)}>Edit Budget</button>
                  </div>
                  <div className="budget-total">{formatCurrency(card.budget)}</div>
                  <div className="budget-stat-line"><span>Spent</span><strong>{formatCurrency(card.spent)}</strong></div>
                  <div className="budget-stat-line"><span>Remaining</span><strong>{formatCurrency(card.remaining)}</strong></div>
                  <div className="progress-track large"><div className="progress-fill" style={{ width: `${Math.min(card.progress, 120)}%`, background: card.progress >= 100 ? '#FF5C7A' : card.progress >= 80 ? '#FFB84D' : '#00C2A8' }} /></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'categories' && (
          <section className="panel section-panel">
            <div className="panel-header compact">
              <div>
                <div className="panel-kicker">Breakdown</div>
                <h2>Category Insights</h2>
              </div>
            </div>
            <div className="category-insight-grid">
              {Object.entries(categoryMeta).map(([category, meta]) => (
                <div key={category} className="insight-card" style={{ borderColor: `${meta.color}66` }}>
                  <div className="insight-top"><span className="budget-dot" style={{ background: meta.color }} /> {meta.icon} {category}</div>
                  <div className="insight-value">{formatCurrency(categoryTotals[category] ?? 0)}</div>
                  <div className="insight-foot"><span>{((categoryTotals[category] ?? 0) / Math.max(totalSpending, 1) * 100).toFixed(0)}% of spend</span></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="transaction-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="panel-kicker">New entry</div>
                <h3>Add New Transaction</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={submitTransaction} className="transaction-form">
              <div className="field-row">
                <label>
                  <span>Transaction Type</span>
                  <select value={transactionForm.type} onChange={(event) => setTransactionForm((prev) => ({ ...prev, type: event.target.value }))}>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </label>
                <label>
                  <span>Amount</span>
                  <input type="number" min="0.01" step="0.01" value={transactionForm.amount} onChange={(event) => setTransactionForm((prev) => ({ ...prev, amount: event.target.value }))} placeholder="0.00" />
                </label>
              </div>

              <label>
                <span>Description</span>
                <input type="text" value={transactionForm.description} onChange={(event) => setTransactionForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="e.g. Grocery delivery" />
              </label>

              <div className="field-row">
                <label>
                  <span>Category</span>
                  <select value={transactionForm.category} onChange={(event) => setTransactionForm((prev) => ({ ...prev, category: event.target.value }))}>
                    {Object.keys(categoryMeta).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Date</span>
                  <input type="date" value={transactionForm.date} onChange={(event) => setTransactionForm((prev) => ({ ...prev, date: event.target.value }))} />
                </label>
              </div>

              <label>
                <span>Notes</span>
                <textarea value={transactionForm.notes} onChange={(event) => setTransactionForm((prev) => ({ ...prev, notes: event.target.value }))} rows="3" placeholder="Optional notes" />
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {budgetEditor && (
        <div className="modal-backdrop" onClick={() => setBudgetEditor(null)}>
          <div className="mini-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="panel-kicker">Update budget</div>
                <h3>{budgetEditor.category}</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setBudgetEditor(null)}>✕</button>
            </div>

            <label>
              <span>Monthly Budget</span>
              <input type="number" min="0" step="10" value={budgetEditor.value} onChange={(event) => setBudgetEditor((prev) => ({ ...prev, value: event.target.value }))} />
            </label>

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setBudgetEditor(null)}>Cancel</button>
              <button type="button" className="primary-btn" onClick={updateBudget}>Save Budget</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
