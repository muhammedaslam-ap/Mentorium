"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { User, Edit, Save, Loader2, AlertTriangle, GraduationCap, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { studentService, type StudentProfile } from "@/services/studentServices/studentServices"
import Header from "../components/header"
import Sidebar from "../components/sidebar"

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Profile page error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

// Error Fallback UI
function ErrorFallback() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-gray-900 dark:text-gray-100">Something went wrong</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">We encountered an error while loading your profile</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="text-gray-600 dark:text-gray-300">
              There was a problem loading your profile information. This could be due to a network issue or a temporary
              server problem.
            </p>
            <div className="flex gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => navigate("/student/home")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StudentProfileContent() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [profile, setProfile] = useState<StudentProfile>({
    education: "",
    aboutMe: "",
    interests: "",
  })
  const [originalProfile, setOriginalProfile] = useState<StudentProfile | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string>("")

  useEffect(() => {
    let isMounted = true
    fetchStudentProfile().catch((error) => {
      if (isMounted) {
        console.error("fetchStudentProfile failed in useEffect:", error)
        toast.error("Failed to load profile data")
        setHasProfile(false)
        setLoading(false)
      }
    })

    fetchStudentDetails().catch((error) => {
      if (isMounted) {
        console.error("fetchStudentDetails failed in useEffect:", error)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const fetchStudentDetails = async () => {
    try {
      const response = await studentService.studentDetails()
      if (response?.details?.name) {
        setStudentName(response.details.name || "Student")
      }
    } catch (error) {
      console.error("Failed to fetch student details:", error)
    }
  }

  const fetchStudentProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await studentService.getProfile()
      console.log("studentService.getProfile response:", response)
      if (response?.profile) {
        const profileData: StudentProfile = {
          education: response.profile.education || "",
          aboutMe: response.profile.aboutMe || "",
          interests: response.profile.interests || "",
        }
        setProfile(profileData)
        setOriginalProfile(profileData)
        setHasProfile(!!profileData.education || !!profileData.aboutMe || !!profileData.interests)
      } else {
        setHasProfile(false)
        setProfile({
          education: "",
          aboutMe: "",
          interests: "",
        })
      }
    } catch (error: any) {
      console.error("Failed to fetch student profile:", error)
      setError("Failed to load profile data")
      toast.error("Failed to load profile data")
      setHasProfile(false)
      setProfile({
        education: "",
        aboutMe: "",
        interests: "",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSaving(true)
    try {
      if (hasProfile) {
        console.log("Updating profile:", profile)
        await studentService.updateProfile(profile)
        toast.success("Profile updated successfully")
      } else {
        console.log("Creating profile:", profile)
        await studentService.createProfile(profile)
        setHasProfile(true)
        toast.success("Profile created successfully")
      }

      console.log("Fetching updated profile after save")
      await fetchStudentProfile()
      setEditMode(false)
    } catch (error: any) {
      console.error("Failed to save profile:", error)
      toast.error(error?.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile)
    }
    setEditMode(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800">
        <Header />
        <div className="flex">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="flex h-[80vh] items-center justify-center w-full">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-4 border-blue-200 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
              <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800">
        <Header />
        <div className="flex">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="container mx-auto max-w-4xl p-4 md:p-8">
            <Alert className="mb-6 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertTitle className="text-gray-900 dark:text-gray-100 font-medium">Error loading profile</AlertTitle>
              <AlertDescription className="text-gray-600 dark:text-gray-300">
                {error}
                <div className="mt-4 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fetchStudentProfile()}
                    className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => navigate("/student/home")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  // Empty profile view - show the Add Profile UI
  if (!hasProfile && !editMode) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800">
        <Header />
        <div className="flex">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
            <div className="container mx-auto max-w-4xl p-4 md:p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Student Profile</h1>
                <p className="text-gray-600 dark:text-gray-300">Get started by creating your profile</p>
              </div>

              <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <CardTitle className="text-gray-900 dark:text-gray-100">Complete Your Profile</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Create your student profile to personalize your learning experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-6 px-6 md:px-8">
                  <div className="text-center">
                    <div className="mx-auto h-24 w-24 rounded-full border-4 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100">No Profile Found</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                      You haven't created your student profile yet. Complete your profile to personalize your learning
                      experience and help us recommend courses that match your interests.
                    </p>
                    <Button
                      onClick={() => setEditMode(true)}
                      className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Create Profile
                    </Button>
                  </div>

                  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Education</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Share your educational background to help us recommend relevant courses.
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                        <User className="h-5 w-5" />
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">About Me</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Tell us about yourself, your goals, and what you hope to achieve.
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                        <Heart className="h-5 w-5" />
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Interests</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Share your interests to help us personalize your learning experience.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Profile form in edit mode or display mode with existing profile
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <Header />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />
        <div className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container mx-auto max-w-4xl p-4 md:p-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Student Profile</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage your profile information</p>
              </div>
              {!editMode && hasProfile && (
                <Button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white self-start sm:self-auto"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Overview Card */}
                <Card className="border-gray-200 dark:border-gray-700 shadow-sm md:col-span-1">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <CardTitle className="text-gray-900 dark:text-gray-100">Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border-4 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                      <AvatarImage src="/placeholder.svg?height=96&width=96&text=S" alt="Student" />
                      <AvatarFallback className="bg-blue-600 dark:bg-blue-400 text-white text-2xl">
                        {studentName?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">{studentName || "Student"}</h2>
                    <p className="text-gray-600 dark:text-gray-300">Student</p>

                    <Separator className="my-6 bg-gray-200 dark:bg-gray-600" />

                    <div className="w-full space-y-4">
                      {hasProfile && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">Role:</span>
                            <span className="text-gray-900 dark:text-gray-100">Student</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">Status:</span>
                            <span className="text-gray-900 dark:text-gray-100">Active</span>
                          </div>
                        </>
                      )}
                      {editMode && !hasProfile && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                          Complete your profile to personalize your learning experience.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Details Card */}
                <Card className="border-gray-200 dark:border-gray-700 shadow-sm md:col-span-2">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                      {!hasProfile ? "Create Profile" : "Profile Details"}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {editMode
                        ? hasProfile
                          ? "Edit your profile information"
                          : "Complete your student profile"
                        : "Your profile information"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="education" className="text-gray-600 dark:text-gray-300">
                        Education
                      </Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <Input
                          id="education"
                          name="education"
                          value={profile.education}
                          onChange={handleInputChange}
                          placeholder="Your educational background"
                          className="pl-10 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                          disabled={!editMode}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aboutMe" className="text-gray-600 dark:text-gray-300">
                        About Me
                      </Label>
                      <Textarea
                        id="aboutMe"
                        name="aboutMe"
                        value={profile.aboutMe}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself, your goals, and what you hope to achieve"
                        className="min-h-[100px] border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                        disabled={!editMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interests" className="text-gray-600 dark:text-gray-300">
                        Interests
                      </Label>
                      <Textarea
                        id="interests"
                        name="interests"
                        value={profile.interests}
                        onChange={handleInputChange}
                        placeholder="Share your interests to help us personalize your learning experience"
                        className="min-h-[100px] border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                        disabled={!editMode}
                      />
                      {editMode && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Sharing your interests helps us recommend courses that match your preferences.
                        </p>
                      )}
                    </div>
                  </CardContent>
                  {editMode && (
                    <CardFooter className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {hasProfile ? "Saving Changes..." : "Creating Profile..."}
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {hasProfile ? "Save Profile" : "Create Profile"}
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>

              {/* Profile Tips - only show if not in edit mode */}
              {!editMode && hasProfile && (
                <Card className="mt-6 border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <CardTitle className="text-gray-900 dark:text-gray-100">Profile Tips</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      How to make the most of your student profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Keep Your Education Updated</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Regularly update your education information to get more relevant course recommendations.
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                          <User className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Share Your Goals</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Be specific about your learning goals in your About Me section to get better guidance.
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                          <Heart className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Explore New Interests</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Regularly update your interests to discover new courses and learning opportunities.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentProfilePage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <StudentProfileContent />
    </ErrorBoundary>
  )
}