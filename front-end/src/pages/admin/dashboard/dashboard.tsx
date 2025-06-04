import { useState, useEffect } from "react";
import {
  Users,
  Layers,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Menu,
  LogOut,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { studentService } from "@/services/adminServices/userService";
import { tutorService } from "@/services/adminServices/tutorService";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { adminService } from "@/services/adminServices/adminAuthService";

// Header Component
interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const user = useSelector((state: any) => state.admin.adminDatas);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminService.logoutAdmin();
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-violet-100 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-violet-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "A"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-violet-900">{user?.name || "Admin"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.name || "Admin"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-rose-500">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// SideBar Component
function SideBar() {
  const location = useLocation();

  return (
    <aside className="flex h-full flex-col">
      <div className="px-4 py-2">
        <h2 className="text-sm font-semibold text-violet-800">MENU</h2>
      </div>
      <nav className="mt-2 grid gap-1 px-2">
        <Link to="/admin/dashboard">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              location.pathname === "/admin/dashboard"
                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                : "hover:bg-violet-100 hover:text-violet-700"
            }`}
          >
            <BarChart3 className="mr-2 h-4 w-4 text-violet-600" />
            Dashboard
          </Button>
        </Link>
        <Link to="/admin/tutors">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              location.pathname === "/admin/tutors"
                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                : "hover:bg-violet-100 hover:text-violet-700"
            }`}
          >
            <GraduationCap className="mr-2 h-4 w-4 text-violet-600" />
            Tutors
          </Button>
        </Link>
        <Link to="/admin/students">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              location.pathname === "/admin/students"
                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                : "hover:bg-violet-100 hover:text-violet-700"
            }`}
          >
            <Users className="mr-2 h-4 w-4 text-violet-600" />
            Students
          </Button>
        </Link>
      </nav>
    </aside>
  );
}

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
        <TableRow className="bg-gradient-to-r from-violet-50 to-purple-50">
          {columns.map((column, index) => (
            <TableHead key={index} className="text-violet-900">{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, rowIndex) => (
          <TableRow key={rowIndex} className="hover:bg-violet-50">
            {columns.map((column, colIndex) => (
              <TableCell key={colIndex}>
                {typeof column.accessor === "function"
                  ? column.accessor(item)
                  : item[column.accessor as keyof T]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface Stat {
  title: string;
  value: string;
  change: string;
  changePercent: string;
  status: "increase" | "decrease";
  icon: React.ReactNode;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "Student" | "Tutor";
  status: "Active" | "Blocked";
  joined: string;
  lastLogin: string;
  avatar?: string;
}

interface CourseStatus {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

interface CourseSubmission {
  _id: string;
  title: string;
  author: string;
  submitted: string;
  status: string;
}

interface PerformanceMetric {
  enrollment: {
    value: number;
    changePercent: string;
    status: string;
    categories: { name: string; growth: string; value: string }[];
  };
  revenue: {
    value: number;
    changePercent: string;
    status: string;
  };
  retention: {
    value: number;
    changePercent: string;
    status: string;
  };
}

interface TStudent {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  lastActive: string;
  enrolledCourses: number;
}

interface TTutor {
  _id: string;
  name: string;
  email: string;
  role: string;
  specialization: string;
  isBlocked: boolean;
  verificationDocUrl?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  lastActive: string;
}

// Dummy Data
const dummyStats: Stat[] = [
  {
    title: "Total Users",
    value: "10",
    change: "+50",
    changePercent: "+10%",
    status: "increase",
    icon: <Users className="h-5 w-5 text-violet-600" />,
  },
  {
    title: "Active Courses",
    value: "10",
    change: "+2",
    changePercent: "+5%",
    status: "increase",
    icon: <Layers className="h-5 w-5 text-violet-600" />,
  },
  {
    title: "Total Revenue",
    value: "₹100,000",
    change: "+₹5,000",
    changePercent: "+8%",
    status: "increase",
    icon: (
      <span className="h-5 w-5 flex items-center justify-center text-violet-600">₹</span>
    ),
  },
  {
    title: "Avg. Completion Rate",
    value: "70%",
    change: "-2%",
    changePercent: "-3%",
    status: "decrease",
    icon: <Percent className="h-5 w-5 text-blue-600" />,
  },
];

const dummyUsers: User[] = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Student",
    status: "Active",
    joined: "2025-01-01",
    lastLogin: "2025-05-30T12:00:00Z",
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Tutor",
    status: "Active",
    joined: "2025-02-01",
    lastLogin: "2025-05-29T15:30:00Z",
  },
  {
    _id: "3",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Student",
    status: "Blocked",
    joined: "2024-12-15",
    lastLogin: "2025-05-20T09:00:00Z",
  },
];

const dummyTutors: TTutor[] = [
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "tutor",
    specialization: "Web Development",
    isBlocked: false,
    approvalStatus: "approved",
    lastActive: "2025-05-29T15:30:00Z",
  },
];

const dummyCourseStatuses: CourseStatus[] = [
  {
    title: "Active",
    value: 10,
    icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    color: "bg-green-50 border-green-200",
  },
  {
    title: "Pending Review",
    value: 1,
    icon: <Clock className="h-5 w-5 text-yellow-600" />,
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    title: "Paused",
    value: 0,
    icon: <Clock className="h-5 w-5 text-blue-600" />,
    color: "bg-blue-50 border-blue-200",
  },
  {
    title: "Rejected",
    value: 0,
    icon: <Clock className="h-5 w-5 text-red-600" />,
    color: "bg-red-50 border-red-200",
  },
];

const dummyCourseSubmissions: CourseSubmission[] = [
  {
    _id: "1",
    title: "Course 1",
    author: "Jane Smith",
    submitted: "2025-05-15T10:00:00Z",
    status: "Enrolled",
  },
  {
    _id: "2",
    title: "Course 2",
    author: "Jane Smith",
    submitted: "2025-05-14T12:00:00Z",
    status: "Enrolled",
  },
];

const dummyPerformanceMetrics: PerformanceMetric = {
  enrollment: {
    value: 120,
    changePercent: "+12%",
    status: "increase",
    categories: [
      { name: "Course 1", growth: "+10%", value: "50%" },
      { name: "Course 2", growth: "+5%", value: "30%" },
      { name: "Course 3", growth: "+2%", value: "20%" },
    ],
  },
  revenue: {
    value: 100000,
    changePercent: "+8%",
    status: "increase",
  },
  retention: {
    value: 75,
    changePercent: "-2%",
    status: "decrease",
  },
};

export default function AdminHome() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [tutors, setTutors] = useState<TTutor[] | null>(null);
  const [courseStatuses, setCourseStatuses] = useState<CourseStatus[] | null>(null);
  const [courseSubmissions, setCourseSubmissions] = useState<CourseSubmission[] | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldRetry, setShouldRetry] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const pageSize = 5;
  const user = useSelector((state: any) => state.admin.adminDatas);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user?.id) {
      setStats(dummyStats);
      setUsers(dummyUsers);
      setTutors(dummyTutors);
      setCourseStatuses(dummyCourseStatuses);
      setCourseSubmissions(dummyCourseSubmissions);
      setPerformanceMetrics(dummyPerformanceMetrics);
      setTotalUsers(dummyUsers.length);
      setLoading(false);
      toast.error("Please log in to view dashboard");
      setShouldRetry(true);
      return;
    }

    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Fetch students and tutors
      const [studentResponse, tutorResponse] = await Promise.all([
        studentService.userList(1, 100, "", { signal: controller.signal }),
        tutorService.userList(1, 100, "", { signal: controller.signal }),
      ]);

      clearTimeout(timeoutId);

      console.log("TWO RESPONDS",studentResponse.data,tutorResponse.data)

      const students: TStudent[] = studentResponse.data.filter((u: any) => u.role === "user") || [];
      const tutor: TTutor[] = tutorResponse.data.filter((t: any) => t.role === "tutor") || [];

      setUsers(students)
      setTutors(tutor);

      // Derive total revenue (₹1000 per enrollment)
      const totalRevenue = students.reduce(
        (sum, s) => sum + (Number(s.enrolledCourses) || 0) * 1000,
        0
      );

      // Derive unique courses
      const uniqueCourses = students
        .filter((s) => (Number(s.enrolledCourses) || 0) > 0)
        .map((s, index) => `Course ${index + 1}`)
        .filter((value, index, self) => self.indexOf(value) === index);

      // Derive stats
      setStats([
        {
          title: "Total Users",
          value: students.length.toLocaleString(),
          change: "+0",
          changePercent: "+0%",
          status: "increase",
          icon: <Users className="h-5 w-5 text-violet-600" />,
        },
        {
          title: "Active Courses",
          value: uniqueCourses.length.toString(),
          change: "+0",
          changePercent: "+0%",
          status: "increase",
          icon: <Layers className="h-5 w-5 text-violet-600" />,
        },
        {
          title: "Total Revenue",
          value: `₹${totalRevenue.toLocaleString("en-IN")}`,
          change: "₹0",
          changePercent: "+0%",
          status: "increase",
          icon: (
            <span className="h-5 w-5 flex items-center justify-center text-violet-600">₹</span>
          ),
        },
        {
          title: "Avg. Completion Rate",
          value: "68.5%",
          change: "-0%",
          changePercent: "-0%",
          status: "decrease",
          icon: <Percent className="h-5 w-5 text-violet-600" />,
        },
      ]);

      // Derive users based on role filter
      let filteredUsers: User[] = [];
      if (roleFilter === "all") {
        filteredUsers = [
          ...students.map((s) => ({
            _id: s._id,
            name: s.name,
            email: s.email,
            role: "Student" as const,
            status: s.isBlocked ? ("Blocked" as const) : ("Active" as const),
            joined: s.lastActive,
            lastLogin: s.lastActive,
            avatar: undefined,
          })),
          ...tutors.map((t) => ({
            _id: t._id,
            name: t.name,
            email: t.email,
            role: "Tutor" as const,
            status:
              t.isBlocked || t.approvalStatus !== "approved"
                ? ("Blocked" as const)
                : ("Active" as const),
            joined: t.lastActive,
            lastLogin: t.lastActive,
            avatar: undefined,
          })),
        ];
      } else if (roleFilter === "students") {
        filteredUsers = students.map((s) => ({
          _id: s._id,
          name: s.name,
          email: s.email,
          role: "Student" as const,
          status: s.isBlocked ? ("Blocked" as const) : ("Active" as const),
          joined: s.lastActive,
          lastLogin: s.lastActive,
          avatar: undefined,
        }));
      } else if (roleFilter === "tutors") {
        filteredUsers = tutors.map((t) => ({
          _id: t._id,
          name: t.name,
          email: t.email,
          role: "Tutor" as const,
          status:
            t.isBlocked || t.approvalStatus !== "approved"
              ? ("Blocked" as const)
              : ("Active" as const),
          joined: t.lastActive,
          lastLogin: t.lastActive,
          avatar: undefined,
        }));
      }

      const paginatedUsers = filteredUsers.slice(
        (page - 1) * pageSize,
        page * pageSize
      );
      setUsers(paginatedUsers);
      setTotalUsers(filteredUsers.length);

      // Derive course statuses
      setCourseStatuses([
        {
          title: "Active",
          value: uniqueCourses.length,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          color: "bg-green-50 border-green-200",
        },
        {
          title: "Pending Review",
          value: 0,
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          color: "bg-yellow-50 border-yellow-200",
        },
        {
          title: "Paused",
          value: 0,
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          color: "bg-blue-50 border-blue-200",
        },
        {
          title: "Rejected",
          value: 0,
          icon: <Clock className="h-5 w-5 text-red-500" />,
          color: "bg-red-50 border-red-200",
        },
      ]);

      // Derive course submissions
      const submissions = students
        .filter((s) => (Number(s.enrolledCourses) || 0) > 0)
        .sort(
          (a, b) =>
            new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        )
        .slice(0, 3)
        .map((s, index) => ({
          _id: s._id,
          title: `Course ${index + 1}`,
          author:
            tutors.find((t) => t.approvalStatus === "approved")?.name ||
            "Unknown",
          submitted: s.lastActive,
          status: "Enrolled",
        }));
      setCourseSubmissions(submissions);

      // Derive performance metrics
      const courseMap = students.reduce(
        (acc: any, student: TStudent) => {
          const course =
            (Number(student.enrolledCourses) || 0) > 0
              ? `Course ${acc.count || 1}`
              : "Unknown";
          if (!acc[course]) {
            acc[course] = { count: 0 };
            acc.count = (acc.count || 0) + 1;
          }
          acc[course].count += Number(student.enrolledCourses) || 0;
          return acc;
        },
        { count: 0 }
      );

      const categories = Object.keys(courseMap)
        .filter((key) => key !== "count")
        .map((course) => ({
          name: course,
          growth: "+0%",
          value: `${(
            (courseMap[course].count /
              students.reduce(
                (sum, s) => sum + (Number(s.enrolledCourses) || 0),
                0
              )) *
            100
          ).toFixed(1)}%`,
        }))
        .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
        .slice(0, 3);

      setPerformanceMetrics({
        enrollment: {
          value: students.length,
          changePercent: "+0%",
          status: "increase",
          categories,
        },
        revenue: {
          value: totalRevenue,
          changePercent: "+0%",
          status: "increase",
        },
        retention: {
          value: 76.4,
          changePercent: "-0%",
          status: "decrease",
        },
      });

      setShouldRetry(false); // Success, no need to retry
    } catch (error: any) {
      console.error("Fetch error:", error);
      let errorMessage = "Failed to load dashboard data";
      if (error.name === "AbortError") {
        errorMessage = "Request timed out.";
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status} ${
          error.response.data?.message || ""
        }`;
      }
      toast.error(errorMessage);
      
      // Set dummy data
      setStats(dummyStats);
      setUsers(dummyUsers);
      setTutors(dummyTutors);
      setCourseStatuses(dummyCourseStatuses);
      setCourseSubmissions(dummyCourseSubmissions);
      setPerformanceMetrics(dummyPerformanceMetrics);
      setTotalUsers(dummyUsers.length);
      
      setShouldRetry(true); // Schedule retry
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id, page, roleFilter]);

  // Retry fetching data if previous attempt failed
  useEffect(() => {
    if (shouldRetry) {
      const retryInterval = setInterval(() => {
        fetchDashboardData();
      }, 30000); // Retry every 30 seconds

      return () => clearInterval(retryInterval); // Cleanup on unmount or when shouldRetry changes
    }
  }, [shouldRetry]);

  // User table columns
  const userColumns: Column<User>[] = [
    {
      header: "User",
      accessor: (user) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-violet-900">{user.name}</p>
            <p className="text-sm text-violet-600">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (user) => (
        <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-600">
          {user.role}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: (user) => (
        <div className="flex items-center gap-1">
          <CheckCircle2
            className={`h-4 w-4 ${
              user.status === "Active" ? "text-green-500" : "text-red-500"
            }`}
          />
          <span
            className={
              user.status === "Active" ? "text-green-600" : "text-red-600"
            }
          >
            {user.status}
          </span>
        </div>
      ),
    },
    {
      header: "Joined",
      accessor: (user) => new Date(user.joined).toLocaleDateString(),
    },
    {
      header: "Last Login",
      accessor: (user) => new Date(user.lastLogin).toLocaleString(),
    },
    {
      header: "Actions",
      accessor: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4 text-violet-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Edit User</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Suspend User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-violet-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
          <p className="mt-2 text-violet-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
      <Header setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
      <div className="flex">
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r border-violet-100 bg-gradient-to-b from-violet-50 to-white pt-4 md:block shadow-sm`}
        >
          <SideBar />
        </aside>
        <main className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container py-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-violet-900">
                Welcome, {user?.name || "Admin"}
              </h1>
              <p className="text-violet-600">
                Overview and management of the TechLearn platform.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats && stats.length > 0 ? (
                stats.map((stat, index) => (
                  <Card key={index} className="border-violet-100">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="rounded-full bg-violet-100 p-2">
                          {stat.icon}
                        </div>
                        <span
                          className={
                            stat.status === "increase"
                              ? "flex items-center text-sm font-medium text-green-500"
                              : "flex items-center text-sm font-medium text-red-500"
                          }
                        >
                          {stat.status === "increase" ? (
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                          )}
                          {stat.changePercent}
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium text-violet-600">
                          {stat.title}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-violet-900">{stat.value}</p>
                        <p className="mt-1 text-xs text-violet-600">
                          {stat.status === "increase" ? "+" : ""}
                          {stat.change} this month
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-violet-600 col-span-4">
                  No stats available.
                </p>
              )}
            </div>

            {/* User Management */}
            <Card className="mb-8 border-violet-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-violet-900">User Management</CardTitle>
                    <CardDescription className="text-violet-600">
                      Manage all users on the platform
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[180px] border-violet-200">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="tutors">Tutors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {users && users.length > 0 ? (
                  <ReusableTable columns={userColumns} data={users} />
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-violet-600 mx-auto mb-4" />
                    <p className="text-violet-600">No users found.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between bg-gradient-to-r from-violet-50 to-purple-50">
                <div className="text-sm text-violet-600">
                  Showing {users?.length || 0} of {totalUsers} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="border-violet-200 text-violet-700 hover:bg-violet-100"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page * pageSize >= totalUsers}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-violet-200 text-violet-700 hover:bg-violet-100"
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Course Management and Analytics */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-violet-100">
                <CardHeader>
                  <CardTitle className="text-violet-900">Course Status</CardTitle>
                  <CardDescription className="text-violet-600">
                    Overview of all courses on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {courseStatuses && courseStatuses.length > 0 ? (
                      courseStatuses.map((status, index) => (
                        <Card key={index} className={`border ${status.color}`}>
                          <CardContent className="flex flex-col items-center justify-center p-6">
                            {status.icon}
                            <p className="mt-2 text-2xl font-bold text-violet-900">
                              {status.value}
                            </p>
                            <p className="text-sm text-violet-600">
                              {status.title}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-violet-600 col-span-2">
                        No course statuses available.
                      </p>
                    )}
                  </div>
                  <Separator className="my-6" />
                  <div className="space-y-3">
                    <h4 className="font-medium text-violet-900">Recent Course Enrollments</h4>
                    {courseSubmissions && courseSubmissions.length > 0 ? (
                      courseSubmissions.map((course, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border border-violet-100 p-3"
                        >
                          <div>
                            <p className="font-medium text-violet-900">{course.title}</p>
                            <p className="text-sm text-violet-600">
                              By {course.author} •{" "}
                              {new Date(course.submitted).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-green-50 border-green-200 text-green-600"
                            >
                              {course.status}
                            </Badge>
                            <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                              View
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-violet-600">
                        No recent enrollments.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-violet-100">
                <CardHeader>
                  <CardTitle className="text-violet-900">Key Performance Metrics</CardTitle>
                  <CardDescription className="text-violet-600">
                    Platform analytics and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="enrollment">
                    <TabsList className="grid w-full grid-cols-3 bg-violet-50">
                      <TabsTrigger value="enrollment" className="text-violet-900">Enrollment</TabsTrigger>
                      <TabsTrigger value="revenue" className="text-violet-900">Revenue</TabsTrigger>
                      <TabsTrigger value="retention" className="text-violet-900">Retention</TabsTrigger>
                    </TabsList>
                    <TabsContent value="enrollment" className="pt-4">
                      {performanceMetrics ? (
                        <>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-2xl font-bold text-violet-900">
                                {performanceMetrics.enrollment.value.toLocaleString()}
                              </div>
                              <div className="text-sm text-violet-600">
                                New enrollments this month
                              </div>
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                performanceMetrics.enrollment.status === "increase"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              <span className="flex items-center">
                                {performanceMetrics.enrollment.status === "increase" ? (
                                  <ArrowUpRight className="mr-1 h-4 w-4" />
                                ) : (
                                  <ArrowDownRight className="mr-1 h-4 w-4" />
                                )}
                                {performanceMetrics.enrollment.changePercent}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 h-[160px] rounded-md bg-violet-50 flex items-center justify-center">
                            <div className="text-violet-600">
                              Enrollment chart placeholder
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <h4 className="text-sm font-medium text-violet-900">
                              Top Categories
                            </h4>
                            {performanceMetrics.enrollment.categories.length > 0 ? (
                              performanceMetrics.enrollment.categories.map(
                                (category, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="text-sm text-violet-900">{category.name}</div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-green-600">
                                        {category.growth}
                                      </span>
                                      <span className="text-sm font-medium text-violet-900">
                                        {category.value}
                                      </span>
                                    </div>
                                  </div>
                                )
                              )
                            ) : (
                              <p className="text-violet-600">
                                No category data available.
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-violet-600">
                          No enrollment data available.
                        </p>
                      )}
                    </TabsContent>
                    <TabsContent value="revenue" className="pt-4">
                      {performanceMetrics ? (
                        <>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-2xl font-bold text-violet-900">
                                ₹{performanceMetrics.revenue.value.toLocaleString("en-IN")}
                              </div>
                              <div className="text-sm text-violet-600">
                                Revenue this month
                              </div>
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                performanceMetrics.revenue.status === "increase"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              <span className="flex items-center">
                                {performanceMetrics.revenue.status === "increase" ? (
                                  <ArrowUpRight className="mr-1 h-4 w-4" />
                                ) : (
                                  <ArrowDownRight className="mr-1 h-4 w-4" />
                                )}
                                {performanceMetrics.revenue.changePercent}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 h-[160px] rounded-md bg-violet-50 flex items-center justify-center">
                            <div className="text-violet-600">
                              Revenue chart placeholder
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-violet-600">
                          No revenue data available.
                        </p>
                      )}
                    </TabsContent>
                    <TabsContent value="retention" className="pt-4">
                      {performanceMetrics ? (
                        <>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-2xl font-bold text-violet-900">
                                {performanceMetrics.retention.value.toFixed(1)}%
                              </div>
                              <div className="text-sm text-violet-600">
                                30-day retention rate
                              </div>
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                performanceMetrics.retention.status === "increase"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              <span className="flex items-center">
                                {performanceMetrics.retention.status === "increase" ? (
                                  <ArrowUpRight className="mr-1 h-4 w-4" />
                                ) : (
                                  <ArrowDownRight className="mr-1 h-4 w-4" />
                                )}
                                {performanceMetrics.retention.changePercent}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 h-[160px] rounded-md bg-violet-50 flex items-center justify-center">
                            <div className="text-violet-600">
                              Retention chart placeholder
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-violet-600">
                          No retention data available.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-violet-200 text-violet-700 hover:bg-violet-100">
                    View Detailed Analytics
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
