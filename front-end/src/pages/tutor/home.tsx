import { useState, useEffect } from "react";
import { Users, BarChart3, Wallet, History, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { useSelector } from "react-redux";
import { Header } from "./components/header";
import SideBar from "./components/sideBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

// Reusable Table Component
type Column<T> = {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
};

type ReusableTableProps<T> = {
  columns: Column<T>[];
  data: T[];
};

function ReusableTable<T>({ columns, data }: ReusableTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} className="text-sm whitespace-nowrap">
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center py-4">
              No data available
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, colIndex) => {
                const displayValue =
                  typeof column.accessor === "function"
                    ? column.accessor(item)
                    : item[column.accessor as keyof T] instanceof Date
                    ? (item[column.accessor as keyof T] as Date).toLocaleDateString()
                    : String(item[column.accessor as keyof T] ?? "-");
                return (
                  <TableCell key={colIndex} className="text-sm whitespace-nowrap">
                    {displayValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

interface TStudent {
  _id: string;
  name: string;
  email: string;
  role: string;
  course: string;
  purchaseDate: Date;
  amount: number;
}

interface Stat {
  title: string;
  value: string;
  icon: React.ReactNode;
}

interface CourseStat {
  course: string;
  students: number;
  revenue: string;
}

interface Transaction {
  _id: string;
  amount: number;
  type: "credit" | "debit" | "pending"; // Map transaction_type to type
  description: string;
  courseTitle?: string; // Extract from description
  studentName?: string; // Not provided, set to "N/A"
  createdAt: string; // Map transaction_date to createdAt
  status: "completed" | "pending" | "failed"; // Not in data, assume "completed"
}

export function TutorHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<TStudent[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);
  const user = useSelector((state: any) => state.tutor.tutorDatas);
  const userId = user?.id || user?._id;
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    console.log("fetchDashboardData called, userId:", userId, "user:", JSON.stringify(user, null, 2));

    if (!userId) {
      console.warn("No userId, cannot fetch data");
      setError("User not authenticated. Please log in.");
      setLoading(false);
      toast.error("Please log in to view dashboard");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Fetch students and revenue
      let studentsData: TStudent[] = [];
      let totalRevenue = 0;
      try {
        console.log("Fetching /tutor/students for tutorId:", userId);
        const studentsResponse = await authAxiosInstance.get("/tutor/students", {
          signal: controller.signal,
        });
        console.log("Students Response:", JSON.stringify(studentsResponse.data, null, 2));
        setDebugData((prev: any) => ({ ...prev, studentsResponse: studentsResponse.data }));
        studentsData = studentsResponse.data?.students || [];
        totalRevenue = Number(studentsResponse.data?.totalRevenue) || 0;
        setStudents(studentsData);
        console.log("Set students:", studentsData.length, "totalRevenue (rupees):", totalRevenue);
      } catch (studentError: any) {
        console.error("Error fetching /tutor/students:", {
          message: studentError.message,
          status: studentError.response?.status,
          data: studentError.response?.data,
        });
        setDebugData((prev: any) => ({ ...prev, studentError: studentError.message }));
        toast.error("Failed to load student data");
      }

      // Fetch wallet balance and walletId
      let balance = 0;
      let walletId = "";
      try {
        console.log("Fetching /wallet/wallet");
        const walletResponse = await authAxiosInstance.get("/wallet/wallet", {
          signal: controller.signal,
        });
        console.log("Wallet Response:", JSON.stringify(walletResponse.data, null, 2));
        setDebugData((prev: any) => ({ ...prev, walletResponse: walletResponse.data }));

        if (walletResponse.data?.wallet) {
          balance = Number(walletResponse.data.wallet.balance) || 0;
          walletId = walletResponse.data.wallet._id || "";
        }
        setWalletBalance(balance);
        console.log("Wallet balance (rupees):", balance, "walletId:", walletId);
      } catch (walletError: any) {
        console.error("Error fetching /wallet/wallet:", {
          message: walletError.message,
          status: walletError.response?.status,
          data: walletError.response?.data,
        });
        setDebugData((prev: any) => ({ ...prev, walletError: walletError.message }));
        toast.warn("Failed to load wallet data");
      }

      // Fetch transactions using /transaction/transaction-details
      let transactionsData: Transaction[] = [];
      if (walletId) {
        console.log("HERE TRANSACTION CALLED")
        try {
          console.log("Fetching /transaction/transaction-details with walletId:", walletId);
          const transactionResponse = await authAxiosInstance.get("/transaction/transaction-details", {
            params: {
              walletId,
              page: 1,
              limit: 6,
              // Optional filters (uncomment to use)
              // startDate: "2025-05-01",
              // endDate: "2025-05-29",
              // courseName: "Course ID: 681ccde9451f305f7e80457c",
            },
            signal: controller.signal,
          });
          console.log("Transaction Response:", JSON.stringify(transactionResponse.data, null, 2));
          setDebugData((prev: any) => ({ ...prev, transactionResponse: transactionResponse.data }));

          if (transactionResponse.data?.success) {
            transactionsData = transactionResponse.data.transactions.map((tx: any) => ({
              _id: tx.transactionId,
              amount: Number(tx.amount) || 0,
              type: tx.transaction_type, // Map transaction_type to type
              description: tx.description,
              courseTitle: tx.description.match(/Course ID: (\w+)/)?.[1] || "N/A", // Extract Course ID from description
              studentName: "N/A", // Not provided in data
              createdAt: tx.transaction_date || new Date().toISOString(), // Map transaction_date to createdAt
              status: "completed", // Assume completed since not provided
            })) || [];
          }
          setTransactions(transactionsData);
          console.log("Transactions set:", JSON.stringify(transactionsData, null, 2));
        } catch (transactionError: any) {
          console.error("Error fetching /transaction/transaction-details:", {
            message: transactionError.message,
            status: transactionError.response?.status,
            data: transactionError.response?.data,
          });
          setDebugData((prev: any) => ({ ...prev, transactionError: transactionError.message }));
          toast.error("Failed to load transaction history");
        }
      } else {
        console.warn("No walletId available to fetch transactions");
        setDebugData((prev: any) => ({ ...prev, transactionError: "No walletId available" }));
      }

      // Calculate stats
      const tutorShare = totalRevenue;
      setStats([
        {
          title: "Active Students",
          value: studentsData.length.toString(),
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Your Earnings",
          value: `₹${tutorShare.toFixed(2)}`,
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: "Wallet Balance",
          value: `₹${balance.toFixed(2)}`,
          icon: <Wallet className="h-5 w-5" />,
        },
      ]);

      // Calculate course stats
      const courseMap = studentsData.reduce((acc: any, student: TStudent) => {
        const course = student.course || "Unknown";
        if (!acc[course]) {
          acc[course] = { students: 0, amount: 0 };
        }
        acc[course].students += 1;
        acc[course].amount += student.amount;
        return acc;
      }, {});

      const courseStatsData = Object.keys(courseMap).map((course) => ({
        course,
        students: courseMap[course].students,
        revenue: `₹${courseMap[course].amount.toFixed(2)}`,
      }));
      setCourseStats(courseStatsData);

      console.log("Stats:", JSON.stringify(stats, null, 2));
      console.log("Course Stats:", JSON.stringify(courseStatsData, null, 2));
      clearTimeout(timeoutId);
    } catch (error: any) {
      console.error("Unexpected error in fetchDashboardData:", error);
      let errorMessage = "Failed to load dashboard data";
      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status} ${error.response.data?.message || ""}`;
      }
      setError(errorMessage);
      toast.error(errorMessage);
      setDebugData((prev: any) => ({ ...prev, error: error.message }));
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect ran, userId:", userId);
    if (userId) {
      fetchDashboardData();
    } else {
      console.warn("No userId in useEffect, setting loading false");
      setError("User not authenticated. Please log in.");
      setLoading(false);
      toast.error("Please log in to view dashboard");
    }
  }, [userId]);

  // Student table columns
  const studentColumns: Column<TStudent>[] = [
    { header: "Student Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Course", accessor: "course" },
    {
      header: "Purchase Date",
      accessor: (student) => new Date(student.purchaseDate).toLocaleDateString(),
    },
    {
      header: "Amount",
      accessor: (student) => `₹${student.amount.toFixed(2)}`,
    },
  ];

  // Course stats table columns
  const courseColumns: Column<CourseStat>[] = [
    { header: "Course", accessor: "course" },
    { header: "Students", accessor: "students" },
    { header: "Revenue", accessor: "revenue" },
  ];

  // Transaction table columns
  const transactionColumns: Column<Transaction>[] = [
    {
      header: "Date",
      accessor: (transaction) => new Date(transaction.createdAt).toLocaleDateString(),
    },
    // {
    //   header: "User Name",
    //   accessor: (transaction) => transaction.studentName || "test",
    // },
    // {
    //   header: "Course Name",
    //   accessor: (transaction) => transaction.courseTitle || "100k Days coding challenge",
    // },
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "Amount",
      accessor: (transaction) =>
        transaction.type === "credit"
          ? `+₹${transaction.amount.toFixed(2)}`
          : `-₹${transaction.amount.toFixed(2)}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col md:flex-row gap-6 p-6 w-full">
        <div className="w-full md:w-64 flex-shrink-0">
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <div className={`flex-1 w-full relative ${sidebarOpen ? "md:ml-64" : ""}`}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50 w-full">
              <ClipLoader size={50} color="#3b82f6" />
            </div>
          )}
          {error ? (
            <div className="flex items-center justify-center h-full w-full">
              <Card className="border-0 shadow-md w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <p className="text-red-500 mb-4 font-medium">{error}</p>
                  <Button
                    onClick={() => {
                      setLoading(true);
                      setError(null);
                      fetchDashboardData();
                    }}
                    className="bg-primary hover:bg-primary/90 text-white shadow-sm"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-8 w-full">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Welcome back, {user?.name || "Tutor"}
                </h1>
                <p className="text-slate-600 mt-1">
                  Here's what's happening with your students today.
                </p>
              </div>

              {/* Debug Panel */}
              {/* <Card className="border-0 shadow-md w-full">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                  <CardTitle className="text-xl font-bold text-slate-800 flex justify-between items-center">
                    Debug Panel
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDebug(!showDebug)}
                      className="border-primary text-primary hover:bg-primary/5"
                    >
                      {showDebug ? "Hide" : "Show"} Debug Data
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    View raw API responses for debugging
                  </CardDescription>
                </CardHeader>
                {showDebug && (
                  <CardContent className="pt-6">
                    <pre className="text-sm bg-slate-50 p-4 rounded-lg overflow-auto max-h-96">
                      {JSON.stringify(debugData, null, 2)}
                    </pre>
                  </CardContent>
                )}
              </Card> */}

              {/* Stats Overview */}
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    className="border border-slate-200 transition-all duration-300 hover:shadow-lg w-full"
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-xl font-bold text-slate-800">
                          {stat.value}
                        </p>
                      </div>
                      <div className="rounded-full bg-primary/10 p-3">
                        {stat.icon}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Course Stats */}
              <Card className="border-0 shadow-md w-full">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                  <CardTitle className="text-xl font-bold text-slate-800">
                    Course Enrollment
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Overview of student enrollments by course
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 w-full">
                  {courseStats.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 w-full">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">
                        No courses have enrolled students yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <ReusableTable columns={courseColumns} data={courseStats} />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5"
                    onClick={() => navigate("/tutor/courses")}
                  >
                    View All Courses
                  </Button>
                </CardFooter>
              </Card>

              {/* Wallet Transaction History */}
              <Card className="border-0 shadow-md w-full">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                  <CardTitle className="text-xl font-bold text-slate-800">
                    Wallet Transaction History
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    History of your wallet transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 w-full">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 w-full">
                      <History className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">
                        No transactions yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <ReusableTable columns={transactionColumns} data={transactions} />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5"
                    onClick={() => navigate("/tutor/wallet")}
                  >
                    View Balance
                  </Button>
                </CardFooter>
              </Card>

              {/* Student List */}
              <Card className="border-0 shadow-md w-full">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                  <CardTitle className="text-xl font-bold text-slate-800">
                    Your Students
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    List of students enrolled in your courses
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 w-full">
                  {students.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 w-full">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">
                        No students have enrolled yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto w-full">
                      <ReusableTable columns={studentColumns} data={students} />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  {/* <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary/5"
                    onClick={() => navigate("/tutor/students")}
                  >
                    View All Students
                  </Button> */}
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}