"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminService } from "@/services/adminServices/adminAuthService";
import { useDispatch } from "react-redux";
import { addAdmin } from "@/redux/slice/adminSlice";

export default function AdminLogin() {
  const router = useNavigate()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  useEffect(() => {
    const adminToken = localStorage.getItem("adminDatas"); 
      console.log(adminToken)
    if (adminToken) {
      router("/admin/dashboard"); 
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    try {
      const responds = await adminService.loginAdmin(formData)
      dispatch(addAdmin(responds.data.user))
      router("/admin/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-violet-600 mt-2">Sign in to access your dashboard</p>
        </div>

        <Card className="border-violet-100 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-violet-500 to-purple-600"></div>
          <CardHeader className="space-y-1 bg-gradient-to-r from-violet-50 to-purple-50">
            <CardTitle className="text-2xl font-bold text-center text-violet-900">Sign In</CardTitle>
            <CardDescription className="text-center text-violet-600">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-violet-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-violet-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    className="pl-10 border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-violet-700">
                    Password
                  </Label>
                  <Link
                    to="/admin/forgot-password"
                    className="text-sm text-violet-600 hover:text-violet-800 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-violet-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 text-violet-500 hover:text-violet-700 hover:bg-violet-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                  className="border-violet-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                />
                <Label htmlFor="remember" className="text-sm text-violet-700 cursor-pointer">
                  Remember me for 30 days
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 bg-gradient-to-r from-violet-50 to-purple-50 border-t border-violet-100">
            <div className="text-center text-sm text-violet-600">
              <span>Don't have an account? </span>
              <Link to="/admin/register" className="font-medium text-violet-700 hover:text-violet-900 underline">
                Contact your administrator
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-violet-500">
          <p>© {new Date().getFullYear()} Admin Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
