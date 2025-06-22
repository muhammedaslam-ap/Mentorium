import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, TrendingUp, Search, Download, RefreshCw, CreditCard, Activity, Calendar as CalendarIcon } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { walletService, type Transaction, type WalletData } from "@/services/walletServices/walletService"
import type { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AdminLayout } from "../componets/AdminLayout"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminWalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    fetchWalletData()
  }, [])

  useEffect(() => {
    if (walletData) applyFilters()
  }, [walletData, searchTerm, typeFilter, dateRange])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await walletService.getAdminWalletData()
      setWalletData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch wallet data")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    if (!walletData) return
    let filtered = [...walletData.transactions]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (tx) =>
          tx.transactionId.toLowerCase().includes(term) ||
          tx.courseName?.toLowerCase().includes(term) ||
          tx.tutorName?.toLowerCase().includes(term) ||
          tx.description?.toLowerCase().includes(term)
      )
    }

    if (typeFilter !== "all") {
      filtered = walletService.getTransactionsByType(filtered, typeFilter)
    }

    if (dateRange?.from && dateRange?.to) {
      filtered = walletService.getTransactionsByDateRange(filtered, dateRange.from, dateRange.to)
    }

    setFilteredTransactions(filtered)
  }

  const getTransactionStats = () => {
    if (!walletData) return { totalCredit: 0, totalDebit: 0, totalTransactions: 0 }
    const totalCredit = walletService.calculateTotalByType(walletData.transactions, "credit")
    const totalDebit = walletService.calculateTotalByType(walletData.transactions, "debit")
    return { totalCredit, totalDebit, totalTransactions: walletData.transactions.length }
  }

  const getTransactionTypeBadge = (type: string) => {
    const typeLower = type.toLowerCase()
    if (typeLower === "credit") return <Badge className="bg-green-100 text-green-800">Credit</Badge>
    if (typeLower === "debit") return <Badge className="bg-red-100 text-red-800">Debit</Badge>
    return <Badge variant="secondary">{type}</Badge>
  }

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const exportTransactions = () => walletService.exportTransactionsToCSV(filteredTransactions)

  const stats = getTransactionStats()

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent>{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</CardContent></Card>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <Card className="border-red-200">
          <CardHeader><CardTitle className="text-red-600">Error</CardTitle><CardDescription>{error}</CardDescription></CardHeader>
          <CardContent><Button onClick={fetchWalletData} variant="outline"><RefreshCw className="mr-2 h-4 w-4" />Try Again</Button></CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Admin Wallet</h1>
            <p className="text-muted-foreground">Manage and monitor platform financial transactions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchWalletData} variant="outline" size="sm"><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
            <Button onClick={exportTransactions} variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Current Balance</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatAmount(walletData?.balance || 0)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Credits</CardTitle><TrendingUp className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{formatAmount(stats.totalCredit)}</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Transactions</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalTransactions}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div><CardTitle>Transaction History</CardTitle><CardDescription>Complete record of all wallet transactions</CardDescription></div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full sm:w-64" />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex gap-2 w-full sm:w-52 justify-start text-left">
                      <CalendarIcon className="h-4 w-4" />
                      {dateRange?.from ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString() || "…"}` : "Select Date Range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== "all" ? "Try adjusting your filters" : "No transactions available"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx, i) => (
                      <TableRow key={`${tx.transactionId}-${i}`}>
                        <TableCell className="font-mono text-sm">{tx.transactionId}</TableCell>
                        <TableCell className="font-semibold">
                          <span className={tx.transaction_type.toLowerCase() === "credit" ? "text-green-600" : "text-red-600"}>
                            {tx.transaction_type.toLowerCase() === "credit" ? "+" : "-"}{formatAmount(Math.abs(tx.amount))}
                          </span>
                        </TableCell>
                        <TableCell>{getTransactionTypeBadge(tx.transaction_type)}</TableCell>
                        <TableCell className="max-w-48 truncate">{tx.description}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(tx.transaction_date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}