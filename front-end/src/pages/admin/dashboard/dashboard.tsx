"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  DollarSign,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Eye,
  Search,
  BarChart3,
  GraduationCap,
  LogOut,
  Menu,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link, useNavigate } from "react-router-dom"
import { authAxiosInstance } from "@/api/authAxiosInstance"
import { toast } from "sonner"
import { adminService } from "@/services/adminServices/adminAuthService"

interface User {
  _id: string
  name: string
  email: string
}

interface Transaction {
  transactionId: string
  amount: number
  transaction_type: string
  description: string
  date: string
  user: User
}

interface SalesData {
  month: string
  revenue: number
  count: number
}

interface AdminDashboardData {
  totalRevenue: number
  totalPurchases: number
  totalTransactions: number
  salesByMonth: SalesData[]
  recentTransactions: Transaction[]
}

interface ApiResponse {
  success: boolean
  data: AdminDashboardData
  message?: string
}

const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
      <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
    </div>
    <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
  </div>
)

const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = "gray",
}: {
  title: string
  value: string | number
  change?: string
  changeType?: "increase" | "decrease"
  icon: any
  color?: string
}) => {
  const colorClasses = {
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  }

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {change && (
              <div className="flex items-center gap-1">
                {changeType === "increase" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${changeType === "increase" ? "text-green-600" : "text-red-600"}`}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-full ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "credit":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "debit":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder.svg" alt={transaction.user.name} />
          <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            {transaction.user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-white">{transaction.user.name}</p>
            <Badge className={`text-xs ${getTransactionTypeColor(transaction.transaction_type)}`}>
              {transaction.transaction_type}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {new Date(transaction.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900 dark:text-white">₹{transaction.amount.toLocaleString()}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">ID: {transaction.transactionId}</p>
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [transactionFilter, setTransactionFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const navigate = useNavigate()

  const fetchDashboardData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true)
      else setLoading(true)

      const response = await authAxiosInstance.get<ApiResponse>("/transaction/dashBoard")
      if (response.data.success) {
        setDashboardData(response.data.data)
      } else {
        throw new Error(response.data.message || "Failed to fetch dashboard data")
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      toast.error(error.response?.data?.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  const handleExportData = () => {
    if (!dashboardData) return

    const dataToExport = {
      summary: {
        totalRevenue: dashboardData.totalRevenue,
        totalPurchases: dashboardData.totalPurchases,
        totalTransactions: dashboardData.totalTransactions,
      },
      salesByMonth: dashboardData.salesByMonth,
      recentTransactions: dashboardData.recentTransactions,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Dashboard data exported successfully!")
  }

  const handleLogout = async () => {
    try {
      await adminService.logoutAdmin()
      toast.success("Logged out successfully")
      navigate("/admin/login")
    } catch (error) {
      console.error("Failed to logout:", error)
      toast.error("Failed to logout")
    }
  }

  const filteredTransactions =
    dashboardData?.recentTransactions.filter((transaction) => {
      const matchesSearch =
        transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        transactionFilter === "all" || transaction.transaction_type.toLowerCase() === transactionFilter.toLowerCase()

      return matchesSearch && matchesFilter
    }) || []

  // Prepare chart data
  const chartData =
    dashboardData?.salesByMonth.map((item) => ({
      month: new Date(item.month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      revenue: item.revenue,
      count: item.count,
    })) || []

  const transactionTypeData = dashboardData?.recentTransactions.reduce(
    (acc, transaction) => {
      const type = transaction.transaction_type
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(transactionTypeData || {}).map(([type, count]) => ({
    name: type,
    value: count,
  }))

  const COLORS = ["#000000", "#666666", "#999999", "#cccccc"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-violet-900">Failed to Load Dashboard</h2>
            <p className="text-violet-600">Unable to fetch dashboard data. Please try again.</p>
            <Button
              onClick={() => fetchDashboardData()}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-violet-100 bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-violet-600"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">
                Admin Portal
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            className="flex items-center gap-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "block" : "hidden"
          } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r border-violet-100 bg-gradient-to-b from-violet-50 to-white pt-4 md:block shadow-sm`}
        >
          <div className="flex h-full flex-col">
            <div className="px-4 py-2">
              <h2 className="text-sm font-semibold text-violet-800">MENU</h2>
            </div>
            <nav className="mt-2 grid gap-1 px-2">
              <Link to="/admin/dashboard">
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/admin/tutors">
                <Button variant="ghost" className="w-full justify-start hover:bg-violet-100 hover:text-violet-700">
                  <GraduationCap className="mr-2 h-4 w-4 text-violet-600" />
                  Tutors
                </Button>
              </Link>
              <Link to="/admin/students">
                <Button variant="ghost" className="w-full justify-start hover:bg-violet-100 hover:text-violet-700">
                  <Users className="mr-2 h-4 w-4 text-violet-600" />
                  Students
                </Button>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${isSidebarOpen ? "md:ml-64" : ""} p-4 md:p-8`}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-violet-900">Admin Dashboard</h1>
            <p className="text-violet-600 mt-1">Monitor your platform's performance and transactions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Revenue"
              value={`₹${dashboardData.totalRevenue.toLocaleString()}`}
              change="+12.5%"
              changeType="increase"
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Total Purchases"
              value={dashboardData.totalPurchases}
              change="+8.2%"
              changeType="increase"
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard
              title="Total Transactions"
              value={dashboardData.totalTransactions}
              change="+15.3%"
              changeType="increase"
              icon={CreditCard}
              color="purple"
            />
            <StatCard
              title="Avg. Transaction"
              value={`₹${Math.round(dashboardData.totalRevenue / dashboardData.totalTransactions || 0).toLocaleString()}`}
              change="-2.1%"
              changeType="decrease"
              icon={TrendingUp}
              color="gray"
            />
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white rounded-xl p-1 shadow-lg border border-violet-200">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg font-medium transition-all duration-300"
              >
                Transactions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-violet-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Monthly Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Transaction Types */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-violet-900 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Transaction Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions Preview */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-violet-900 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Recent Transactions
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("transactions")}
                      className="border-violet-200 text-violet-700 hover:bg-violet-100"
                    >
                      View All
                      <Eye className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboardData.recentTransactions.slice(0, 5).map((transaction) => (
                      <TransactionRow key={transaction.transactionId} transaction={transaction} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Trend */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-violet-900">Sales Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#000000"
                          strokeWidth={3}
                          dot={{ fill: "#000000", strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Purchase Count */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-violet-900">Purchase Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="count" fill="#666666" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              {/* Filters */}
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-violet-400" />
                        <Input
                          placeholder="Search by name, email, or transaction ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-violet-200"
                        />
                      </div>
                    </div>
                    <Select value={transactionFilter} onValueChange={setTransactionFilter}>
                      <SelectTrigger className="w-full md:w-48 border-violet-200">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                        <SelectItem value="debit">Debit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Transactions List */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-violet-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    All Transactions ({filteredTransactions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-violet-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-violet-900">No Transactions Found</h3>
                      <p className="text-violet-600">
                        {searchTerm || transactionFilter !== "all"
                          ? "Try adjusting your search or filter criteria."
                          : "No transactions available at the moment."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredTransactions.map((transaction) => (
                        <TransactionRow key={transaction.transactionId} transaction={transaction} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard