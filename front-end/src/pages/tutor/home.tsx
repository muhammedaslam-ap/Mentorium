"use client"

import { useState } from "react"
import {
  User,
  Users,
  DollarSign,
  Book,
  ClipboardList,
  ChevronDown,
  Plus,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

import { Header } from "./components/header"
import { Sidebar } from "./components/sideBar"

export function TutorHome() {
  const [sidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
      {/* Header/Navigation */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container py-6">
            <div className="mb-10">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">
                Welcome back, Prof. Alex
              </h1>
              <p className="text-violet-600">Here's an overview of your tutoring activities today.</p>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {[
                {
                  title: "Total Students",
                  value: "1,500",
                  change: "+8%",
                  status: "increase",
                  icon: <Users className="h-5 w-5" />,
                  color: "from-violet-500 to-purple-600",
                },
                {
                  title: "Quiz Completion",
                  value: "85%",
                  change: "+5%",
                  status: "increase",
                  icon: <ClipboardList className="h-5 w-5" />,
                  color: "from-purple-500 to-fuchsia-600",
                },
                {
                  title: "Revenue (This Month)",
                  value: "$9,800",
                  change: "+15%",
                  status: "increase",
                  icon: <DollarSign className="h-5 w-5" />,
                  color: "from-fuchsia-500 to-pink-600",
                },
                {
                  title: "Active Courses",
                  value: "12",
                  change: "+2",
                  status: "increase",
                  icon: <Book className="h-5 w-5" />,
                  color: "from-pink-500 to-rose-600",
                },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="border-violet-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="h-1 w-full bg-gradient-to-r ${stat.color}"></div>
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-violet-600">{stat.title}</p>
                      <p className="mt-1 text-2xl font-bold text-violet-900">{stat.value}</p>
                      <div className="mt-1 flex items-center">
                        {stat.status === "increase" ? (
                          <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        <span className={stat.status === "increase" ? "text-green-500" : "text-red-500"}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`rounded-full bg-gradient-to-r ${stat.color} p-3 text-white`}>{stat.icon}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Section Overview and Management */}
            <div className="mb-8 grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2 border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <CardTitle className="text-violet-800">Section Performance</CardTitle>
                  <CardDescription className="text-violet-600">Overview of your active sections</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {[
                      {
                        title: "Profile Management",
                        students: 450,
                        completion: 90,
                        rating: 4.7,
                        revenue: "$2,300",
                        status: "Active",
                      },
                      {
                        title: "Student Interaction",
                        students: 320,
                        completion: 78,
                        rating: 4.6,
                        revenue: "$1,800",
                        status: "Active",
                      },
                      {
                        title: "Course Creation",
                        students: 730,
                        completion: 65,
                        rating: 4.8,
                        revenue: "$5,700",
                        status: "Active",
                      },
                    ].map((section, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-violet-900">{section.title}</h3>
                              <Badge
                                variant="outline"
                                className="text-xs border-violet-200 bg-violet-50 text-violet-700"
                              >
                                {section.status}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-violet-600">
                              <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                <span>{section.students} students</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                <span>{section.revenue}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-sm font-medium text-violet-900">{section.rating}/5</div>
                              <div className="text-xs text-violet-600">Rating</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-violet-900">{section.completion}%</div>
                              <div className="text-xs text-violet-600">Completion</div>
                            </div>
                          </div>
                        </div>
                        <Progress
                          value={section.completion}
                          className="h-2 bg-violet-100"
                          indicatorClassName="bg-gradient-to-r from-violet-500 to-purple-600"
                        />
                        {index < 2 && <Separator className="my-4 bg-violet-100" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <Button
                    variant="outline"
                    className="w-full border-violet-200 text-violet-700 hover:bg-violet-100 hover:text-violet-800"
                  >
                    View All Sections
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <CardTitle className="text-violet-800">Recent Activity</CardTitle>
                  <CardDescription className="text-violet-600">Latest interactions and updates</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {[
                      {
                        name: "Sarah Lee",
                        action: "messaged in",
                        section: "Chat",
                        time: "1 hour ago",
                        avatar: "/placeholder.svg?height=40&width=40&text=SL",
                      },
                      {
                        name: "John Doe",
                        action: "completed quiz in",
                        section: "Quiz",
                        time: "3 hours ago",
                        avatar: "/placeholder.svg?height=40&width=40&text=JD",
                      },
                      {
                        name: "Emily Brown",
                        action: "enrolled in",
                        section: "Courses",
                        time: "Yesterday",
                        avatar: "/placeholder.svg?height=40&width=40&text=EB",
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Avatar className="border-2 border-violet-200">
                          <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.name} />
                          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                            {activity.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-violet-900">
                            <span className="font-medium">{activity.name}</span>{" "}
                            <span className="text-violet-600">{activity.action}</span>{" "}
                            <span className="font-medium">{activity.section}</span>
                          </p>
                          <p className="text-xs text-violet-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <Button
                    variant="outline"
                    className="w-full border-violet-200 text-violet-700 hover:bg-violet-100 hover:text-violet-800"
                  >
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Content Management & Upcoming Schedule */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="md:col-span-2 border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <div>
                    <CardTitle className="text-violet-800">Section Management</CardTitle>
                    <CardDescription className="text-violet-600">Manage your tutoring sections</CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    New Section
                  </Button>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="recent">
                    <TabsList className="grid w-full grid-cols-3 bg-violet-100">
                      <TabsTrigger
                        value="recent"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                      >
                        Recent
                      </TabsTrigger>
                      <TabsTrigger
                        value="drafts"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                      >
                        Drafts
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                      >
                        Pending Review
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="recent" className="pt-4">
                      <div className="space-y-4">
                        {[
                          {
                            title: "Profile Setup Guide",
                            type: "Guide",
                            section: "Profile",
                            updatedAt: "Today",
                            status: "Published",
                          },
                          {
                            title: "Revenue Tracking",
                            type: "Report",
                            section: "Revenue",
                            updatedAt: "Yesterday",
                            status: "Published",
                          },
                          {
                            title: "Quiz Creation",
                            type: "Task",
                            section: "Quiz",
                            updatedAt: "2 days ago",
                            status: "Published",
                          },
                        ].map((content, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-violet-200 p-3 hover:bg-violet-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {content.type === "Guide" && (
                                <div className="rounded-full bg-violet-100 p-2">
                                  <User className="h-5 w-5 text-violet-600" />
                                </div>
                              )}
                              {content.type === "Report" && (
                                <div className="rounded-full bg-purple-100 p-2">
                                  <DollarSign className="h-5 w-5 text-purple-600" />
                                </div>
                              )}
                              {content.type === "Task" && (
                                <div className="rounded-full bg-fuchsia-100 p-2">
                                  <ClipboardList className="h-5 w-5 text-fuchsia-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-violet-900">{content.title}</p>
                                <p className="text-sm text-violet-600">{content.section}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center text-sm text-violet-500">
                                <Clock className="mr-1 h-3.5 w-3.5" />
                                {content.updatedAt}
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  content.status === "Published"
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : content.status === "Draft"
                                      ? "border-amber-200 bg-amber-50 text-amber-700"
                                      : ""
                                }
                              >
                                {content.status}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-violet-500 hover:text-violet-700 hover:bg-violet-100"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-violet-200">
                                  <DropdownMenuItem className="hover:bg-violet-50 hover:text-violet-700 cursor-pointer">
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="hover:bg-violet-50 hover:text-violet-700 cursor-pointer">
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="hover:bg-violet-50 hover:text-violet-700 cursor-pointer">
                                    Archive
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="drafts" className="pt-4">
                      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed border-violet-300 bg-violet-50/50">
                        <div className="flex flex-col items-center text-center">
                          <User className="h-10 w-10 text-violet-400" />
                          <h3 className="mt-2 text-lg font-medium text-violet-800">No drafts yet</h3>
                          <p className="mt-1 text-sm text-violet-600">Start creating new sections</p>
                          <Button className="mt-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Section
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="pending" className="pt-4">
                      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed border-violet-300 bg-violet-50/50">
                        <div className="flex flex-col items-center text-center">
                          <User className="h-10 w-10 text-violet-400" />
                          <h3 className="mt-2 text-lg font-medium text-violet-800">No pending content</h3>
                          <p className="mt-1 text-sm text-violet-600">All your sections have been reviewed</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <CardTitle className="text-violet-800">Upcoming Schedule</CardTitle>
                  <CardDescription className="text-violet-600">Your next 24 hours</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {[
                      {
                        title: "Profile Review Session",
                        section: "Profile",
                        time: "Today, 2:00 PM",
                        duration: "1 hour",
                        attendees: 20,
                        color: "from-violet-500 to-purple-600",
                      },
                      {
                        title: "Revenue Discussion",
                        section: "Revenue",
                        time: "Today, 4:00 PM",
                        duration: "1.5 hours",
                        attendees: 15,
                        color: "from-purple-500 to-fuchsia-600",
                      },
                      {
                        title: "Quiz Prep Meeting",
                        section: "Quiz",
                        time: "Tomorrow, 9:00 AM",
                        duration: "2 hours",
                        attendees: 25,
                        color: "from-fuchsia-500 to-pink-600",
                      },
                    ].map((event, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-violet-200 p-3 hover:bg-violet-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-violet-900">{event.title}</h4>
                          <Badge variant="outline" className={`bg-gradient-to-r ${event.color} text-white border-0`}>
                            {event.duration}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-violet-600">{event.section}</p>
                        <div className="mt-2 flex items-center justify-between text-sm text-violet-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{event.attendees} attendees</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <Button
                    variant="outline"
                    className="w-full border-violet-200 text-violet-700 hover:bg-violet-100 hover:text-violet-800"
                  >
                    View Full Schedule
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TutorHome
