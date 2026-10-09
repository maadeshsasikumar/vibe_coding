import { useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  ChartColumnBig,
  ChevronDown,
  CreditCard,
  Download,
  DollarSign,
  Filter,
  FolderKanban,
  GraduationCap,
  House,
  Landmark,
  LayoutDashboard,
  Moon,
  MoreHorizontal,
  PiggyBank,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Truck,
  Wallet,
  X,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ThemeName = 'dark' | 'light'
type TransactionType = 'income' | 'expense'
type CategoryType = 'income' | 'expense' | 'all'

type Transaction = {
  id: string
  title: string
  amount: number
  type: TransactionType
  category: string
  subcategory?: string
  date: string
  paymentMethod: string
  notes: string
  recurring: boolean
}

type Budget = {
  id: string
  category: string
  month: string
  limit: number
}

type Category = {
  id: string
  name: string
  type: CategoryType
  color: string
  icon: string
}

type SavingsGoal = {
  id: string
  name: string
  target: number
  saved: number
  dueDate: string
  color: string
}

type TransactionFormValues = {
  title: string
  amount: number
  type: TransactionType
  category: string
  subcategory: string
  date: string
  paymentMethod: string
  notes: string
  recurring: boolean
}

const CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', type: 'expense', color: '#FB7185', icon: '🍽️' },
  { id: 'transport', name: 'Transportation', type: 'expense', color: '#3B82F6', icon: '🚗' },
  { id: 'shopping', name: 'Shopping', type: 'expense', color: '#8B5CF6', icon: '🛍️' },
  { id: 'housing', name: 'Housing', type: 'expense', color: '#10B981', icon: '🏠' },
  { id: 'utilities', name: 'Utilities', type: 'expense', color: '#22D3EE', icon: '💡' },
  { id: 'healthcare', name: 'Healthcare', type: 'expense', color: '#F59E0B', icon: '💊' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense', color: '#EC4899', icon: '🎬' },
  { id: 'education', name: 'Education', type: 'expense', color: '#14B8A6', icon: '🎓' },
  { id: 'travel', name: 'Travel', type: 'expense', color: '#F97316', icon: '✈️' },
  { id: 'salary', name: 'Salary', type: 'income', color: '#10B981', icon: '💰' },
  { id: 'freelance', name: 'Freelance', type: 'income', color: '#3B82F6', icon: '💼' },
  { id: 'investments', name: 'Investments', type: 'income', color: '#8B5CF6', icon: '📈' },
  { id: 'other', name: 'Other', type: 'all', color: '#94A3B8', icon: '📦' },
]

const DEFAULT_BUDGETS: Budget[] = [
  { id: 'food', category: 'Food & Dining', month: '2026-10', limit: 900 },
  { id: 'transport', category: 'Transportation', month: '2026-10', limit: 550 },
  { id: 'shopping', category: 'Shopping', month: '2026-10', limit: 700 },
  { id: 'housing', category: 'Housing', month: '2026-10', limit: 1800 },
  { id: 'utilities', category: 'Utilities', month: '2026-10', limit: 420 },
  { id: 'healthcare', category: 'Healthcare', month: '2026-10', limit: 300 },
  { id: 'entertainment', category: 'Entertainment', month: '2026-10', limit: 450 },
  { id: 'education', category: 'Education', month: '2026-10', limit: 350 },
  { id: 'travel', category: 'Travel', month: '2026-10', limit: 550 },
]

const DEFAULT_GOALS: SavingsGoal[] = [
  { id: 'house', name: 'Emergency Fund', target: 50000, saved: 31000, dueDate: '2027-06-01', color: '#10B981' },
  { id: 'travel', name: 'Himalayan Trip', target: 18000, saved: 9300, dueDate: '2027-02-15', color: '#8B5CF6' },
  { id: 'device', name: 'Laptop Upgrade', target: 120000, saved: 56000, dueDate: '2027-04-14', color: '#3B82F6' },
]

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'txn-1', title: 'Salary Deposit', amount: 85000, type: 'income', category: 'Salary', subcategory: 'Primary', date: '2026-10-01', paymentMethod: 'Bank Transfer', notes: 'Monthly salary', recurring: true },
  { id: 'txn-2', title: 'Freelance Retainer', amount: 23500, type: 'income', category: 'Freelance', subcategory: 'Design', date: '2026-10-04', paymentMethod: 'UPI', notes: 'Project milestone', recurring: false },
  { id: 'txn-3', title: 'Fresh Market', amount: 4200, type: 'expense', category: 'Food & Dining', subcategory: 'Groceries', date: '2026-10-03', paymentMethod: 'UPI', notes: 'Weekly groceries', recurring: false },
  { id: 'txn-4', title: 'Metro Pass', amount: 2550, type: 'expense', category: 'Transportation', subcategory: 'Transit', date: '2026-10-08', paymentMethod: 'Debit Card', notes: 'Monthly travel card', recurring: true },
  { id: 'txn-5', title: 'Electricity Bill', amount: 3800, type: 'expense', category: 'Utilities', subcategory: 'Power', date: '2026-10-09', paymentMethod: 'Bank Transfer', notes: 'October bill', recurring: true },
  { id: 'txn-6', title: 'Rent', amount: 25000, type: 'expense', category: 'Housing', subcategory: 'Apartment', date: '2026-10-05', paymentMethod: 'Bank Transfer', notes: 'Monthly rent', recurring: true },
  { id: 'txn-7', title: 'Streaming Bundle', amount: 799, type: 'expense', category: 'Entertainment', subcategory: 'Streaming', date: '2026-10-12', paymentMethod: 'Credit Card', notes: 'Netflix + Prime', recurring: true },
  { id: 'txn-8', title: 'Pharmacy Purchase', amount: 1800, type: 'expense', category: 'Healthcare', subcategory: 'Medicine', date: '2026-10-16', paymentMethod: 'UPI', notes: 'Prescription refill', recurring: false },
  { id: 'txn-9', title: 'Laptop Accessories', amount: 9800, type: 'expense', category: 'Shopping', subcategory: 'Electronics', date: '2026-10-18', paymentMethod: 'Credit Card', notes: 'Dock and mouse', recurring: false },
  { id: 'txn-10', title: 'Weekend Trip', amount: 14500, type: 'expense', category: 'Travel', subcategory: 'Leisure', date: '2026-10-21', paymentMethod: 'Credit Card', notes: 'Rail + stay', recurring: false },
  { id: 'txn-11', title: 'Course Fee', amount: 6400, type: 'expense', category: 'Education', subcategory: 'Bootcamp', date: '2026-10-22', paymentMethod: 'UPI', notes: 'AI workshop', recurring: false },
  { id: 'txn-12', title: 'Investment SIP', amount: 10000, type: 'expense', category: 'Investments', subcategory: 'Mutual funds', date: '2026-10-25', paymentMethod: 'Bank Transfer', notes: 'Monthly SIP', recurring: true },
  { id: 'txn-13', title: 'Bonus', amount: 30000, type: 'income', category: 'Other', subcategory: 'Performance', date: '2026-09-29', paymentMethod: 'Bank Transfer', notes: 'Quarterly bonus', recurring: false },
]

const navItems = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Transactions', path: '/transactions', icon: ReceiptText },
  { label: 'Analytics', path: '/analytics', icon: ChartColumnBig },
  { label: 'Budgets', path: '/budgets', icon: Wallet },
  { label: 'Categories', path: '/categories', icon: FolderKanban },
  { label: 'Savings Goals', path: '/savings', icon: PiggyBank },
  { label: 'Reports', path: '/reports', icon: TrendingUp },
  { label: 'Settings', path: '/settings', icon: Settings },
]

const currencyDetails = [
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
]

const formatCurrency = (value: number, currency = 'INR') => {
  const currencySymbol = currencyDetails.find((item) => item.value === currency)?.symbol ?? '₹'
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })

  if (currency === 'INR') {
    return `${currencySymbol}${formatter.format(value).replace(/^₹\s?/, '').trim()}`
  }

  return formatter.format(value)
}

const sumTransactions = (items: Transaction[], type: TransactionType) =>
  items.filter((item) => item.type === type).reduce((total, item) => total + item.amount, 0)

const getMonthLabel = (date: string) =>
  new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

const buildMonthlyChartData = (transactions: Transaction[]) => {
  const monthlyMap = new Map<string, { month: string; income: number; expense: number }>()

  transactions.forEach((item) => {
    const month = item.date.slice(0, 7)
    const existing = monthlyMap.get(month) ?? { month: getMonthLabel(item.date), income: 0, expense: 0 }

    if (item.type === 'income') {
      existing.income += item.amount
    } else {
      existing.expense += item.amount
    }

    monthlyMap.set(month, existing)
  })

  return Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([_, value]) => value)
}

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const item = window.localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

const transactionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Choose a category'),
  subcategory: z.string().optional(),
  date: z.string().min(1, 'Choose a date'),
  paymentMethod: z.string().min(1, 'Choose a payment method'),
  notes: z.string().optional(),
  recurring: z.boolean().default(false),
})

function App() {
  const [theme, setTheme] = useState<ThemeName>(() => readStorage('finance-theme', 'dark'))
  const [currency, setCurrency] = useState<string>(() => readStorage('finance-currency', 'INR'))
  const [transactions, setTransactions] = useState<Transaction[]>(() => readStorage('finance-transactions', DEFAULT_TRANSACTIONS))
  const [budgets, setBudgets] = useState<Budget[]>(() => readStorage('finance-budgets', DEFAULT_BUDGETS))
  const [categories, setCategories] = useState<Category[]>(() => readStorage('finance-categories', CATEGORIES))
  const [goals, setGoals] = useState<SavingsGoal[]>(() => readStorage('finance-goals', DEFAULT_GOALS))
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    window.localStorage.setItem('finance-theme', JSON.stringify(theme))
    document.body.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('finance-currency', JSON.stringify(currency))
  }, [currency])

  useEffect(() => {
    window.localStorage.setItem('finance-transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    window.localStorage.setItem('finance-budgets', JSON.stringify(budgets))
  }, [budgets])

  useEffect(() => {
    window.localStorage.setItem('finance-categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    window.localStorage.setItem('finance-goals', JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const incomeTotal = useMemo(() => sumTransactions(transactions, 'income'), [transactions])
  const expenseTotal = useMemo(() => sumTransactions(transactions, 'expense'), [transactions])
  const netBalance = incomeTotal - expenseTotal
  const savingsRate = incomeTotal > 0 ? (netBalance / incomeTotal) * 100 : 0

  const monthlySummary = useMemo(() => buildMonthlyChartData(transactions), [transactions])

  const categorySpend = useMemo(() => {
    const totals = new Map<string, number>()

    transactions.forEach((item) => {
      if (item.type === 'expense') {
        totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount)
      }
    })

    return Array.from(totals.entries())
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }, [transactions])

  const handleSaveTransaction = (values: TransactionFormValues, existingId?: string) => {
    const payload: Transaction = {
      id: existingId ?? crypto.randomUUID(),
      title: values.title,
      amount: Number(values.amount),
      type: values.type,
      category: values.category,
      subcategory: values.subcategory || undefined,
      date: values.date,
      paymentMethod: values.paymentMethod,
      notes: values.notes || '',
      recurring: values.recurring,
    }

    if (existingId) {
      setTransactions((current) => current.map((item) => (item.id === existingId ? payload : item)))
      setToast('Transaction updated successfully.')
      return
    }

    setTransactions((current) => [payload, ...current])
    setToast('Transaction added successfully.')
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions((current) => current.filter((item) => item.id !== id))
    setToast('Transaction removed.')
  }

  const handleResetDemoData = () => {
    setTransactions(DEFAULT_TRANSACTIONS)
    setBudgets(DEFAULT_BUDGETS)
    setCategories(CATEGORIES)
    setGoals(DEFAULT_GOALS)
    setToast('Demo data restored.')
  }

  return (
    <BrowserRouter>
      <div className={`app-shell ${theme}`}>
        <div className="app-bg" />
        <DashboardLayout
          theme={theme}
          currency={currency}
          setTheme={setTheme}
          setCurrency={setCurrency}
          transactions={transactions}
          budgets={budgets}
          categories={categories}
          goals={goals}
          onSaveTransaction={handleSaveTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onResetDemoData={handleResetDemoData}
          incomeTotal={incomeTotal}
          expenseTotal={expenseTotal}
          netBalance={netBalance}
          savingsRate={savingsRate}
          monthlySummary={monthlySummary}
          categorySpend={categorySpend}
          toast={toast}
          setToast={setToast}
          setBudgets={setBudgets}
          setCategories={setCategories}
          setGoals={setGoals}
        />
      </div>
    </BrowserRouter>
  )
}

type DashboardLayoutProps = {
  theme: ThemeName
  currency: string
  setTheme: (theme: ThemeName) => void
  setCurrency: (currency: string) => void
  transactions: Transaction[]
  budgets: Budget[]
  categories: Category[]
  goals: SavingsGoal[]
  onSaveTransaction: (values: TransactionFormValues, existingId?: string) => void
  onDeleteTransaction: (id: string) => void
  onResetDemoData: () => void
  incomeTotal: number
  expenseTotal: number
  netBalance: number
  savingsRate: number
  monthlySummary: { month: string; income: number; expense: number }[]
  categorySpend: { label: string; amount: number }[]
  toast: string | null
  setToast: (message: string | null) => void
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
  setGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>
}

function DashboardLayout(props: DashboardLayoutProps) {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-icon">F</div>
          <div>
            <p className="eyebrow">Finance</p>
            <h2>Nova Ledger</h2>
          </div>
        </div>

        <nav className="nav-stack">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">This month</p>
          <h3>{formatCurrency(props.netBalance, props.currency)}</h3>
          <div className="meter-row">
            <span>Budget health</span>
            <strong>{Math.max(0, Math.min(100, Math.round((props.netBalance / Math.max(props.incomeTotal, 1)) * 100 + 50)))}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.min(100, Math.round((props.netBalance / Math.max(props.incomeTotal, 1)) * 100 + 50))}%` }} />
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Hello, Aisha</p>
            <h1>{currentDate}</h1>
          </div>

          <div className="topbar-actions">
            <label className="search-wrap">
              <Search size={16} />
              <input
                type="text"
                value={search}
                placeholder="Search transactions"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <button className="chip-button">
              <span>Oct 2026</span>
              <ChevronDown size={15} />
            </button>

            <button className="icon-button" aria-label="Notifications">
              <Bell size={17} />
            </button>

            <button
              className="icon-button"
              aria-label="Toggle theme"
              onClick={() => props.setTheme(props.theme === 'dark' ? 'light' : 'dark')}
            >
              {props.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className="user-pill">
              <div className="avatar">AD</div>
              <div>
                <strong>Aisha D.</strong>
                <small>Premium</small>
              </div>
            </div>

            <button className="primary-button" onClick={() => setAddModalOpen(true)}>
              <Plus size={16} />
              Add Transaction
            </button>
          </div>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <OverviewPage
                currency={props.currency}
                transactions={props.transactions}
                budgets={props.budgets}
                incomeTotal={props.incomeTotal}
                expenseTotal={props.expenseTotal}
                netBalance={props.netBalance}
                savingsRate={props.savingsRate}
                monthlySummary={props.monthlySummary}
                categorySpend={props.categorySpend}
                categories={props.categories}
                goals={props.goals}
              />
            }
          />
          <Route
            path="/transactions"
            element={
              <TransactionsPage
                currency={props.currency}
                transactions={props.transactions}
                categories={props.categories}
                onDeleteTransaction={props.onDeleteTransaction}
                onSaveTransaction={props.onSaveTransaction}
                setToast={props.setToast}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <AnalyticsPage
                currency={props.currency}
                transactions={props.transactions}
                categories={props.categories}
              />
            }
          />
          <Route
            path="/budgets"
            element={
              <BudgetsPage
                currency={props.currency}
                transactions={props.transactions}
                budgets={props.budgets}
                setBudgets={props.setBudgets}
              />
            }
          />
          <Route
            path="/categories"
            element={<CategoriesPage categories={props.categories} setCategories={props.setCategories} />}
          />
          <Route
            path="/savings"
            element={<SavingsPage goals={props.goals} setGoals={props.setGoals} currency={props.currency} />}
          />
          <Route
            path="/reports"
            element={
              <ReportsPage
                currency={props.currency}
                transactions={props.transactions}
                budgets={props.budgets}
                goals={props.goals}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                theme={props.theme}
                currency={props.currency}
                setTheme={props.setTheme}
                setCurrency={props.setCurrency}
                onResetDemoData={props.onResetDemoData}
              />
            }
          />
        </Routes>

        <Outlet />
      </main>

      {addModalOpen && (
        <TransactionModal
          categories={props.categories}
          onClose={() => setAddModalOpen(false)}
          onSubmit={(values) => props.onSaveTransaction(values)}
        />
      )}

      {props.toast && <div className="toast">{props.toast}</div>}
    </>
  )
}

type MetricCardProps = {
  title: string
  value: string
  delta: string
  tone: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}

function MetricCard({ title, value, delta, tone, icon }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon" data-tone={tone}>{icon}</div>
        <div className="metric-trend" data-tone={tone}>{delta}</div>
      </div>
      <p className="eyebrow muted">{title}</p>
      <h3>{value}</h3>
    </div>
  )
}

function OverviewPage({
  currency,
  transactions,
  budgets,
  incomeTotal,
  expenseTotal,
  netBalance,
  savingsRate,
  monthlySummary,
  categorySpend,
  categories,
  goals,
}: {
  currency: string
  transactions: Transaction[]
  budgets: Budget[]
  incomeTotal: number
  expenseTotal: number
  netBalance: number
  savingsRate: number
  monthlySummary: { month: string; income: number; expense: number }[]
  categorySpend: { label: string; amount: number }[]
  categories: Category[]
  goals: SavingsGoal[]
}) {
  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const categoryColorMap = Object.fromEntries(categories.map((category) => [category.name, category.color]))

  return (
    <div className="content-stack">
      <section className="stats-grid">
        <MetricCard
          title="Total Balance"
          value={formatCurrency(netBalance, currency)}
          delta="+12.4%"
          tone="positive"
          icon={<Wallet size={18} />}
        />
        <MetricCard
          title="Total Income"
          value={formatCurrency(incomeTotal, currency)}
          delta="+8.1%"
          tone="positive"
          icon={<ArrowDownRight size={18} />}
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(expenseTotal, currency)}
          delta="-3.6%"
          tone="negative"
          icon={<ArrowUpRight size={18} />}
        />
        <MetricCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          delta="+2.2%"
          tone="neutral"
          icon={<PiggyBank size={18} />}
        />
      </section>

      <section className="chart-grid">
        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Cash flow</p>
              <h3>Income vs expenses</h3>
            </div>
            <button className="ghost-button">This year</button>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="month" stroke="#94A3B8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(Number(value), currency)} />
                <Legend />
                <Bar dataKey="income" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#22D3EE" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Budget usage</p>
              <h3>Spend by category</h3>
            </div>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categorySpend} dataKey="amount" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {categorySpend.map((entry, index) => (
                    <Cell key={entry.label} fill={Object.values(categoryColorMap)[index % Object.values(categoryColorMap).length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(Number(value), currency)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-total">
              <strong>{formatCurrency(categorySpend.reduce((acc, item) => acc + item.amount, 0), currency)}</strong>
              <span>Spent</span>
            </div>
          </div>
          <div className="legend-stack">
            {categorySpend.map((item) => (
              <div key={item.label} className="legend-item">
                <span className="dot" style={{ background: categoryColorMap[item.label] || '#8B5CF6' }} />
                <span>{item.label}</span>
                <strong>{formatCurrency(item.amount, currency)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Monthly view</p>
              <h3>Expense trend</h3>
            </div>
          </div>
          <div className="chart-box chart-box-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySummary}>
                <defs>
                  <linearGradient id="flowFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="month" stroke="#94A3B8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(Number(value), currency)} />
                <Area type="monotone" dataKey="expense" stroke="#22D3EE" fill="url(#flowFill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Recent</p>
              <h3>Transactions</h3>
            </div>
          </div>
          <div className="mini-list">
            {recentTransactions.map((item) => (
              <div key={item.id} className="list-row">
                <div className="list-meta">
                  <span className="list-icon" style={{ background: `${getCategoryColor(item.category, categories)}22`, color: getCategoryColor(item.category, categories) }}>
                    {getCategoryDetails(item.category, categories)?.icon ?? '•'}
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{getMonthLabel(item.date)}</small>
                  </div>
                </div>
                <div className={`money ${item.type === 'income' ? 'income' : 'expense'}`}>
                  {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Progress</p>
            <h3>Savings goals</h3>
          </div>
        </div>
        <div className="goals-list">
          {goals.map((goal) => {
            const progress = Math.min(100, (goal.saved / goal.target) * 100)
            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-topline">
                  <div>
                    <strong>{goal.name}</strong>
                    <small>{goal.dueDate}</small>
                  </div>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%`, background: goal.color }} />
                </div>
                <div className="goal-footer">
                  <span>{formatCurrency(goal.saved, currency)}</span>
                  <span>{formatCurrency(goal.target, currency)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function TransactionsPage({
  currency,
  transactions,
  categories,
  onDeleteTransaction,
  onSaveTransaction,
  setToast,
}: {
  currency: string
  transactions: Transaction[]
  categories: Category[]
  onDeleteTransaction: (id: string) => void
  onSaveTransaction: (values: TransactionFormValues, existingId?: string) => void
  setToast: (message: string | null) => void
}) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const items = transactions.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.notes.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch)
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      const matchesPayment = paymentFilter === 'all' || item.paymentMethod === paymentFilter
      return matchesSearch && matchesType && matchesCategory && matchesPayment
    })

    return [...items].sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      return b.date.localeCompare(a.date)
    })
  }, [transactions, search, typeFilter, categoryFilter, paymentFilter, sortBy])

  const categoryOptions = categories.map((category) => category.name)
  const paymentOptions = ['UPI', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Cash']

  const openNewTransaction = () => {
    setEditingId(null)
    setModalOpen(true)
  }

  const openEditTransaction = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setModalOpen(true)
  }

  return (
    <div className="content-stack">
      <div className="panel">
        <div className="panel-header row-spread">
          <div>
            <p className="eyebrow">Transactions</p>
            <h3>Cash movement</h3>
          </div>
          <button className="primary-button" onClick={openNewTransaction}>
            <Plus size={16} />
            Add transaction
          </button>
        </div>

        <div className="toolbar-grid">
          <label className="search-wrap wide">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, notes, category"
            />
          </label>

          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'all' | TransactionType)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
            <option value="all">All payment methods</option>
            {paymentOptions.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'date' | 'amount' | 'title')}>
            <option value="date">Sort: Date</option>
            <option value="amount">Sort: Amount</option>
            <option value="title">Sort: Name</option>
          </select>
        </div>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Method</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="cell-head">
                        <div className="list-icon" style={{ background: `${getCategoryColor(transaction.category, categories)}22`, color: getCategoryColor(transaction.category, categories) }}>
                          {getCategoryDetails(transaction.category, categories)?.icon ?? '•'}
                        </div>
                        <div>
                          <strong>{transaction.title}</strong>
                          <small>{transaction.notes || 'No notes added'}</small>
                        </div>
                      </div>
                    </td>
                    <td>{transaction.category}</td>
                    <td>{new Date(transaction.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td>
                      <span className={`tag ${transaction.type === 'income' ? 'income' : 'expense'}`}>{transaction.type}</span>
                    </td>
                    <td className={transaction.type === 'income' ? 'money income' : 'money expense'}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="icon-button small" onClick={() => {
                          setEditingId(transaction.id)
                          setModalOpen(true)
                        }}>
                          <Sparkles size={14} />
                        </button>
                        <button className="icon-button small danger" onClick={() => onDeleteTransaction(transaction.id)}>
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <h4>No transactions match your filters.</h4>
                      <button className="primary-button" onClick={openNewTransaction}>Add one</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <TransactionModal
          categories={categories}
          initialValues={
            editingId
              ? transactions.find((item) => item.id === editingId) ?? undefined
              : undefined
          }
          onSubmit={(values) => {
            onSaveTransaction(values, editingId ?? undefined)
            setModalOpen(false)
          }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}

function AnalyticsPage({ currency, transactions, categories }: { currency: string; transactions: Transaction[]; categories: Category[] }) {
  const monthlyData = buildMonthlyChartData(transactions)
  const categorySpend = useMemo(() => {
    const totals = new Map<string, number>()
    transactions.forEach((transaction) => {
      if (transaction.type === 'expense') {
        totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount)
      }
    })
    return Array.from(totals.entries()).map(([name, value]) => ({ name, value }))
  }, [transactions])

  return (
    <div className="content-stack">
      <section className="chart-grid">
        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Analytics</p>
              <h3>Expense trend</h3>
            </div>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="month" stroke="#94A3B8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(Number(value), currency)} />
                <Area type="monotone" dataKey="expense" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.18} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Category</p>
              <h3>Top spenders</h3>
            </div>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySpend.slice(0, 6)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                <XAxis type="number" stroke="#94A3B8" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={90} stroke="#94A3B8" tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(Number(value), currency)} />
                <Bar dataKey="value" fill="#10B981" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Distribution</p>
            <h3>Payment methods</h3>
          </div>
        </div>
        <div className="chart-box chart-box-sm">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={['UPI', 'Debit Card', 'Credit Card', 'Bank Transfer'].map((method) => ({ name: method, value: transactions.filter((item) => item.paymentMethod === method && item.type === 'expense').reduce((total, item) => total + item.amount, 0) }))} dataKey="value" nameKey="name" innerRadius={40} outerRadius={90} fill="#8B5CF6">
                {['#8B5CF6', '#22D3EE', '#10B981', '#FB7185'].map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(Number(value), currency)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

function BudgetsPage({
  currency,
  transactions,
  budgets,
  setBudgets,
}: {
  currency: string
  transactions: Transaction[]
  budgets: Budget[]
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>
}) {
  const updatedBudgets = budgets.map((budget) => {
    const spent = transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
      .reduce((total, item) => total + item.amount, 0)
    const ratio = Math.min(100, (spent / budget.limit) * 100)
    return { ...budget, spent, ratio }
  })

  const onUpdateLimit = (id: string, nextLimit: number) => {
    setBudgets((current) => current.map((budget) => (budget.id === id ? { ...budget, limit: nextLimit } : budget)))
  }

  return (
    <div className="content-stack">
      <div className="panel">
        <div className="panel-header"><div><p className="eyebrow">Budgets</p><h3>Monthly spend guardrails</h3></div></div>
        <div className="budget-list">
          {updatedBudgets.map((budget) => (
            <div key={budget.id} className="budget-card">
              <div className="budget-head">
                <div>
                  <h4>{budget.category}</h4>
                  <small>{budget.month}</small>
                </div>
                <div className="budget-pill" data-state={budget.ratio > 100 ? 'danger' : budget.ratio > 80 ? 'warning' : 'safe'}>
                  {budget.ratio > 100 ? 'Over budget' : budget.ratio > 80 ? 'Watchlist' : 'Healthy'}
                </div>
              </div>
              <div className="budget-meta">
                <span>{formatCurrency(budget.spent, currency)}</span>
                <span>/ {formatCurrency(budget.limit, currency)}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${budget.ratio}%`, background: budget.ratio > 100 ? '#F87171' : budget.ratio > 80 ? '#FBBF24' : '#10B981' }} />
              </div>
              <div className="budget-actions">
                <label>
                  <span>Limit</span>
                  <input
                    type="number"
                    value={budget.limit}
                    min={0}
                    onChange={(event) => onUpdateLimit(budget.id, Number(event.target.value || 0))}
                  />
                </label>
                <button className="ghost-button">Save</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoriesPage({
  categories,
  setCategories,
}: {
  categories: Category[]
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#8B5CF6')

  const addCategory = () => {
    if (!name.trim()) return
    setCategories((current) => [...current, { id: crypto.randomUUID(), name: name.trim(), type: 'expense', color, icon: '✨' }])
    setName('')
  }

  return (
    <div className="content-stack">
      <div className="panel">
        <div className="panel-header row-spread">
          <div>
            <p className="eyebrow">Categories</p>
            <h3>Custom spending groups</h3>
          </div>
          <div className="category-form">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="New category" />
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
            <button className="primary-button" onClick={addCategory}>Add</button>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="list-icon" style={{ background: `${category.color}22`, color: category.color }}>
                {category.icon}
              </div>
              <div>
                <strong>{category.name}</strong>
                <small>{category.type}</small>
              </div>
              <button className="icon-button small danger" onClick={() => setCategories((current) => current.filter((item) => item.id !== category.id))}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SavingsPage({ goals, setGoals, currency }: { goals: SavingsGoal[]; setGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>; currency: string }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState(5000)
  const [saved, setSaved] = useState(1000)

  const addGoal = () => {
    if (!name.trim()) return
    setGoals((current) => [...current, { id: crypto.randomUUID(), name: name.trim(), target, saved, dueDate: '2027-03-01', color: '#8B5CF6' }])
    setName('')
    setTarget(5000)
    setSaved(1000)
  }

  return (
    <div className="content-stack">
      <div className="panel">
        <div className="panel-header row-spread">
          <div>
            <p className="eyebrow">Savings</p>
            <h3>Target progress</h3>
          </div>
        </div>
        <div className="goal-form">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Goal name" />
          <input type="number" value={target} min={0} onChange={(event) => setTarget(Number(event.target.value || 0))} />
          <input type="number" value={saved} min={0} onChange={(event) => setSaved(Number(event.target.value || 0))} />
          <button className="primary-button" onClick={addGoal}>Add goal</button>
        </div>
        <div className="goals-list">
          {goals.map((goal) => {
            const progress = Math.min(100, (goal.saved / goal.target) * 100)
            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-topline">
                  <div>
                    <strong>{goal.name}</strong>
                    <small>{goal.dueDate}</small>
                  </div>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%`, background: goal.color }} />
                </div>
                <div className="goal-footer">
                  <span>{formatCurrency(goal.saved, currency)}</span>
                  <span>{formatCurrency(goal.target, currency)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ReportsPage({ currency, transactions, budgets, goals }: { currency: string; transactions: Transaction[]; budgets: Budget[]; goals: SavingsGoal[] }) {
  const totalIncome = sumTransactions(transactions, 'income')
  const totalExpenses = sumTransactions(transactions, 'expense')
  const netSavings = totalIncome - totalExpenses
  const highestCategory = [...transactions.filter((item) => item.type === 'expense')].sort((a, b) => b.amount - a.amount)[0]

  return (
    <div className="content-stack">
      <div className="stats-grid three-columns">
        <MetricCard title="Net savings" value={formatCurrency(netSavings, currency)} delta="+9.4%" tone="positive" icon={<PiggyBank size={18} />} />
        <MetricCard title="Income" value={formatCurrency(totalIncome, currency)} delta="+6.2%" tone="positive" icon={<DollarSign size={18} />} />
        <MetricCard title="Expenses" value={formatCurrency(totalExpenses, currency)} delta="-2.1%" tone="negative" icon={<CreditCard size={18} />} />
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Summary</p>
            <h3>Monthly financial report</h3>
          </div>
          <button className="primary-button" onClick={() => window.print()}>
            <Download size={16} />
            Print summary
          </button>
        </div>
        <div className="report-grid">
          <div className="report-box">
            <span>Best month</span>
            <strong>{getMonthLabel((transactions.filter((item) => item.type === 'income').sort((a, b) => b.amount - a.amount)[0] ?? transactions[0]).date)}</strong>
          </div>
          <div className="report-box">
            <span>Highest spend</span>
            <strong>{highestCategory ? highestCategory.title : 'N/A'}</strong>
          </div>
          <div className="report-box">
            <span>Budget health</span>
            <strong>{budgets.length} active budgets</strong>
          </div>
          <div className="report-box">
            <span>Savings goals</span>
            <strong>{goals.length} active goals</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsPage({
  theme,
  currency,
  setTheme,
  setCurrency,
  onResetDemoData,
}: {
  theme: ThemeName
  currency: string
  setTheme: (theme: ThemeName) => void
  setCurrency: (currency: string) => void
  onResetDemoData: () => void
}) {
  return (
    <div className="content-stack">
      <div className="panel">
        <div className="panel-header"><div><p className="eyebrow">Preferences</p><h3>App settings</h3></div></div>
        <div className="settings-grid">
          <div className="setting-card">
            <span>Theme</span>
            <button className="ghost-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            </button>
          </div>
          <div className="setting-card">
            <span>Default currency</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
              {currencyDetails.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="setting-card full-width">
            <span>Demo data</span>
            <button className="ghost-button" onClick={onResetDemoData}>Reset demo data</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TransactionModal({
  categories,
  initialValues,
  onSubmit,
  onClose,
}: {
  categories: Category[]
  initialValues?: Transaction
  onSubmit: (values: TransactionFormValues) => void
  onClose: () => void
}) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      amount: initialValues?.amount ?? 0,
      type: initialValues?.type ?? 'expense',
      category: initialValues?.category ?? categories[0]?.name ?? 'Food & Dining',
      subcategory: initialValues?.subcategory ?? '',
      date: initialValues?.date ?? new Date().toISOString().slice(0, 10),
      paymentMethod: initialValues?.paymentMethod ?? 'UPI',
      notes: initialValues?.notes ?? '',
      recurring: initialValues?.recurring ?? false,
    },
  })

  const onFormSubmit = (values: TransactionFormValues) => {
    onSubmit(values)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Transaction</p>
            <h3>{initialValues ? 'Edit entry' : 'Add entry'}</h3>
          </div>
          <button className="icon-button small" onClick={onClose}><X size={15} /></button>
        </div>

        <form className="modal-form" onSubmit={form.handleSubmit(onFormSubmit)}>
          <div className="field-row two-columns">
            <div className="field">
              <label>Title</label>
              <input {...form.register('title')} placeholder="Groceries, rent, bonus" />
              {form.formState.errors.title && <span className="error-text">{form.formState.errors.title.message}</span>}
            </div>
            <div className="field">
              <label>Amount</label>
              <input type="number" step="0.01" {...form.register('amount')} />
              {form.formState.errors.amount && <span className="error-text">{form.formState.errors.amount.message}</span>}
            </div>
          </div>

          <div className="field-row two-columns">
            <div className="field">
              <label>Type</label>
              <select {...form.register('type')}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="field">
              <label>Category</label>
              <select {...form.register('category')}>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row two-columns">
            <div className="field">
              <label>Payment method</label>
              <select {...form.register('paymentMethod')}>
                <option value="UPI">UPI</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" {...form.register('date')} />
            </div>
          </div>

          <div className="field">
            <label>Notes</label>
            <textarea rows={3} {...form.register('notes')} placeholder="Optional context" />
          </div>

          <label className="checkbox-row">
            <input type="checkbox" {...form.register('recurring')} />
            <span>Recurring transaction</span>
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Save transaction</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getCategoryColor(name: string, categories: Category[]) {
  return categories.find((category) => category.name === name)?.color ?? '#8B5CF6'
}

function getCategoryDetails(name: string, categories: Category[]) {
  return categories.find((category) => category.name === name)
}

export default App
