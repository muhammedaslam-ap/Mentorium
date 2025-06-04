import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarDays, CreditCard, Search, ShoppingBag, Menu } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { authAxiosInstance } from "@/api/authAxiosInstance"
import Header from "../components/header"
import Sidebar from "../components/sidebar"

interface PurchaseHistoryItem {
  courseId: string
  courseName: string
  amount: number
  orderId: string
  status: string
  createdAt: string
}

interface ApiResponse {
  success: boolean
  message: string
  history: PurchaseHistoryItem[]
}

export default function PurchaseHistoryPage() {
  const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([])
  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    fetchPurchaseHistory()
  }, [])

  useEffect(() => {
    const filtered = purchases.filter(
      (purchase) =>
        purchase.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPurchases(filtered)
  }, [purchases, searchTerm])

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true)
      const response = await authAxiosInstance.get<ApiResponse>("/purchase/Purchase-history")
      console.log("Purchase history response:", response.data)
      if (response.data.success) {
        const history = response.data.history.map((item) => ({
          ...item,
          amount: Number(item.amount) || 0,
          status: item.status || "unknown",
        }))
        console.log("Processed purchases:", history.map(p => ({
          courseName: p.courseName,
          amount: p.amount,
          status: p.status,
          orderId: p.orderId
        })))

        const total = history.reduce((sum, p) => sum + p.amount, 0)
            setTotalAmount(total)
         console.log("Total amount:", total)

        setPurchases(history)
        setFilteredPurchases(history)
      } else {
        setError(response.data.message)
        console.warn("API success false:", response.data.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Fetch purchase history error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "completed" || statusLower === "success") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
    } else if (statusLower === "pending") {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    } else if (statusLower === "failed" || statusLower === "cancelled") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
    }
    return <Badge variant="secondary">{status}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar sidebarOpen={isSidebarOpen} />
          <div className="flex-1 container mx-auto p-6 space-y-6 md:ml-64">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Card>
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar sidebarOpen={isSidebarOpen} />
          <div className="flex-1 container mx-auto p-6 md:ml-64">
            <Card className="border-red-200">
              <CardHeader className="p-4">
                <CardTitle className="text-red-600">Error</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <Button onClick={fetchPurchaseHistory} variant="outline">Try Again</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }
      `}</style>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar sidebarOpen={isSidebarOpen} />
        <div className="flex-1 container mx-auto p-6 space-y-6 md:ml-64">
          <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-700/80 px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-4">
              <button
                className="md:hidden text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100/80 dark:bg-gray-700/80 p-2 rounded-full"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Purchase History</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">View all your course purchases and transaction details</p>
              </div>
            </div>
          </header>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white/95 dark:bg-gray-800/95 border-gray-200/80 dark:border-gray-700/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Purchases</CardTitle>
                <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{purchases.length}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">All time purchases</p>
              </CardContent>
            </Card>
            <Card className="bg-white/95 dark:bg-gray-800/95 border-gray-200/80 dark:border-gray-700/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Spent</CardTitle>
                <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100" title={totalAmount  === 0 ? "No completed purchases" : undefined}>
                  {totalAmount}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed purchases only</p>
              </CardContent>
            </Card>
            <Card className="bg-white/95 dark:bg-gray-800/95 border-gray-200/80 dark:border-gray-700/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">This Month</CardTitle>
                <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {
                    purchases.filter((p) => {
                      const purchaseDate = new Date(p.createdAt)
                      const now = new Date()
                      return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear()
                    }).length
                  }
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Purchases this month</p>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-white/95 dark:bg-gray-800/95 border-gray-200/80 dark:border-gray-700/80">
            <CardHeader className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Purchase History</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">A complete list of all your course purchases</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    placeholder="Search courses or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-100/80 dark:bg-gray-700/80 border-gray-300/60 dark:border-gray-600/60 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {filteredPurchases.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-500 dark:text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No purchases found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm ? "Try adjusting your search terms" : "You haven't made any purchases yet"}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-gray-200/80 dark:border-gray-700/80">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                        <TableHead className="text-gray-700 dark:text-gray-300">Course</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Order ID</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Amount</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchases.map((purchase, index) => (
                        <TableRow key={`${purchase.orderId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">{purchase.courseName}</TableCell>
                          <TableCell className="font-mono text-sm text-gray-700 dark:text-gray-300">{purchase.orderId}</TableCell>
                          <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{formatAmount(purchase.amount)}</TableCell>
                          <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">{formatDate(purchase.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}