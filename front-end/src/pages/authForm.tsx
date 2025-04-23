
import { AxiosError } from "axios"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { EyeIcon, EyeOffIcon, BookOpen, Users, GraduationCap, ShieldCheck, ArrowRight } from "lucide-react"
import OTPModal from "@/components/modalComponents/otpModal"
import EmailModal from "@/components/modalComponents/emailModal"
import { authAxiosInstance } from "@/api/authAxiosInstance"
import { sendOtp } from "@/services/otpServices/otpServices"
import { verifyEmail } from "@/services/userServices/verifyEmail"
import { verifyOtp } from "@/services/otpServices/verifyOtp"
import { userAuthService } from "@/services/userServices/authServices"
import { addUser } from "@/redux/slice/userSlice"
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/validation"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { GoogleAuth } from "@/components/googleAuth/googleAuthComponent"

export type UserRole = "admin" | "student" | "tutor"

interface AuthFormProps {
  role?: UserRole
  allowRoleSelection?: boolean
  showRegistration?: boolean
  onRegister?: (data: RegisterFormData, role: UserRole) => void
  className?: string
}

export default function AuthForm({
  role = "student",
  allowRoleSelection = true,
  showRegistration = true,
  onRegister,
  className,
}: AuthFormProps) {
  const [activeRole, setActiveRole] = useState<UserRole>(role)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [forgetPasswordEmail, setForgetPasswordEmail] = useState("")
  const [data, setData] = useState<LoginFormData>()
  const [isRegistered, setIsRegistered] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Login form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Register form setup
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      specialization: "",
    },
  })

  const handleLoginSubmit = (data: LoginFormData) => {
    authAxiosInstance
      .post("/auth/login", { ...data, role: activeRole })
      .then((response) => {
        let { user } = response.data
        user = {
          ...user,
          role: activeRole,
        }
        dispatch(addUser(user))
        toast.success(response.data.message)
        loginForm.reset()

        if (activeRole === "tutor") {
          navigate(`/${activeRole}/home`)
        } else {
          navigate("/")
        }
      })
      .catch((error) => toast.error(error.response?.data?.error ?? error.response?.data?.message))
  }

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const res = await sendOtp(data)
      setData(data)
      toast.success(res.message)
      setIsOTPModalOpen(true)
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Error sending OTP")
      }
    }
  }

  const handleRegisterUser = async () => {
    try {
      const data = registerForm.getValues()
      const res = await userAuthService.registerUser({ ...data, role: activeRole })
      toast.success(res.message)
      onRegister?.(data, activeRole)
      registerForm.reset()
      setIsRegistered(true)

      // Switch to login tab after successful registration
      const tabsElement = document.querySelector('[data-state="inactive"][data-value="login"]') as HTMLElement
      if (tabsElement) {
        tabsElement.click()
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Registration failed")
      }
    }
  }

  const handleOTPVerified = async (otp: string) => {
    try {
      const data = registerForm.getValues()
      const email = data.email || forgetPasswordEmail
      const res = await verifyOtp(email, otp)
      toast.success(res.message)
      setIsOTPModalOpen(false)
      setIsEmailModalOpen(false)

      if (forgetPasswordEmail) {
        // Handle password reset flow
      } else if (data.email) {
        handleRegisterUser()
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Error verifying OTP")
      }
    }
  }

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case "admin":
        return {
          icon: <ShieldCheck className="h-6 w-6" />,
          title: "Admin Portal",
          color: "bg-red-500",
          textColor: "text-red-500",
          borderColor: "border-red-500",
          hoverColor: "hover:bg-red-50 dark:hover:bg-red-950/30",
          activeColor: "bg-red-50 dark:bg-red-950/30",
          buttonColor: "bg-red-500 hover:bg-red-600",
        }
      case "tutor":
        return {
          icon: <GraduationCap className="h-6 w-6" />,
          title: "Tutor Portal",
          color: "bg-violet-500",
          textColor: "text-violet-500",
          borderColor: "border-violet-500",
          hoverColor: "hover:bg-violet-50 dark:hover:bg-violet-950/30",
          activeColor: "bg-violet-50 dark:bg-violet-950/30",
          buttonColor: "bg-violet-500 hover:bg-violet-600",
        }
      case "student":
      default:
        return {
          icon: <Users className="h-6 w-6" />,
          title: "Student Portal",
          color: "bg-teal-500",
          textColor: "text-teal-500",
          borderColor: "border-teal-500",
          hoverColor: "hover:bg-teal-50 dark:hover:bg-teal-950/30",
          activeColor: "bg-teal-50 dark:bg-teal-950/30",
          buttonColor: "bg-teal-500 hover:bg-teal-600",
        }
    }
  }

  const roleConfig = getRoleConfig(activeRole)
  const googleAuthRole = activeRole === "student" ? "student" : activeRole

  return (
    <GoogleOAuthProvider clientId={import.meta.env.GOOGLE_AUTH_CLIENT_ID}>
      <div className={cn("flex justify-center items-center min-h-screen p-4 bg-background", className)}>
        <div className="w-full max-w-md">
          {/* Brand header */}
          <div className="mb-8 text-center">
            <div className={cn("inline-flex items-center justify-center p-3 rounded-full", roleConfig.color)}>
              {roleConfig.icon}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">{roleConfig.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {activeRole === "admin"
                ? "Access the admin dashboard"
                : activeRole === "tutor"
                ? "Teach and manage your courses"
                : "Learn and grow with our platform"}
            </p>
          </div>

          {/* Role selection */}
          {allowRoleSelection && activeRole !== "admin" && (
            <Card className="mb-6 shadow-sm border-slate-200 dark:border-slate-800">
              <CardContent className="pt-6">
                <RadioGroup
                  defaultValue={activeRole}
                  onValueChange={(value) => setActiveRole(value as UserRole)}
                  className="flex gap-4"
                >
                  <div
                    className={cn(
                      "flex-1 flex items-center space-x-2 rounded-md border p-4 cursor-pointer transition-all",
                      activeRole === "student"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950/30"
                        : "hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="flex items-center cursor-pointer w-full">
                      <Users className="h-4 w-4 mr-2" /> Student
                    </Label>
                  </div>
                  <div
                    className={cn(
                      "flex-1 flex items-center space-x-2 rounded-md border p-4 cursor-pointer transition-all",
                      activeRole === "tutor"
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                        : "hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <RadioGroupItem value="tutor" id="tutor" />
                    <Label htmlFor="tutor" className="flex items-center cursor-pointer w-full">
                      <GraduationCap className="h-4 w-4 mr-2" /> Tutor
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Auth tabs */}
          <Tabs defaultValue={isRegistered ? "login" : "register"} className="w-full">
            {showRegistration && activeRole !== "admin" ? (
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            ) : (
              <div className="h-10" />
            )}

            {/* Login Form */}
            <TabsContent value="login">
              <Card className={cn("border-t-4 shadow-md transition-all", roleConfig.borderColor)}>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    {activeRole === "admin"
                      ? "Enter your admin credentials"
                      : activeRole === "tutor"
                      ? "Access your tutor dashboard"
                      : "Continue your learning journey"}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        {...loginForm.register("email")}
                        type="email"
                        placeholder="your.email@example.com"
                        className="border-slate-300 dark:border-slate-700"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-red-500 text-sm">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <Button
                          variant="link"
                          onClick={() => setIsEmailModalOpen(true)}
                          type="button"
                          className="text-sm p-0 h-auto"
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="login-password"
                          {...loginForm.register("password")}
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="border-slate-300 dark:border-slate-700"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-red-500 text-sm">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-4">
                    <Button type="submit" className={cn("w-full", roleConfig.buttonColor)}>
                      Login <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-300 dark:border-slate-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                      </div>
                    </div>
                      <Button variant="outline" className="w-full flex items-center justify-center">
                        <GoogleAuth role={googleAuthRole as "student" | "tutor"} />
                      </Button>                    
                 </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Register Form */}
            {showRegistration && activeRole !== "admin" && (
              <TabsContent value="register">
                <Card className={cn("border-t-4 shadow-md transition-all", roleConfig.borderColor)}>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      {activeRole === "tutor"
                        ? "Join as a tutor and start teaching"
                        : "Start your learning journey today"}
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          {...registerForm.register("name")}
                          placeholder="John Doe"
                          className="border-slate-300 dark:border-slate-700"
                        />
                        {registerForm.formState.errors.name && (
                          <p className="text-red-500 text-sm">{registerForm.formState.errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          {...registerForm.register("email")}
                          type="email"
                          placeholder="your.email@example.com"
                          className="border-slate-300 dark:border-slate-700"
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-red-500 text-sm">{registerForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            {...registerForm.register("password")}
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="border-slate-300 dark:border-slate-700"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          >
                            {showRegisterPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </Button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-red-500 text-sm">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            {...registerForm.register("confirmPassword")}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="border-slate-300 dark:border-slate-700"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </Button>
                        </div>
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-red-500 text-sm">{registerForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                      {activeRole === "tutor" && (
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input
                            id="specialization"
                            {...registerForm.register("specialization")}
                            placeholder="e.g. Mathematics, Programming, etc."
                            className="border-slate-300 dark:border-slate-700"
                          />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                      <Button type="submit" className={cn("w-full", roleConfig.buttonColor)}>
                        Register <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>
                        <Button variant="outline" className="w- flex items-center justify-center">
                          <GoogleAuth role={googleAuthRole as "student" | "tutor"} />
                        </Button>
                        {/* <Button variant="outline" className="w-full">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                            <path
                              d="M16.6,2.4C17.5,2.4 18.2,2.7 18.8,3.2C19.4,3.7 19.8,4.2 20,4.8C19.5,5 19,5.5 18.6,6.1C18.2,6.7 18,7.3 18,8C18,8.8 18.3,9.5 18.9,10.2C19.5,10.9 20.2,11.2 21.1,11.3C20.9,12.4 20.4,13.3 19.7,14.1C19.1,14.8 18.4,15.2 17.7,15.3C17.1,15.4 16.4,15.3 15.7,14.9C15,14.5 14.3,14.3 13.6,14.3C12.8,14.3 12.1,14.5 11.4,14.9C10.7,15.3 10.1,15.4 9.6,15.3C8.8,15.2 8.1,14.8 7.5,14.1C6.8,13.3 6.3,12.4 6.1,11.3C5.8,10.2 5.7,9.1 5.7,8C5.7,6.8 6,5.8 6.5,5C7,4.2 7.6,3.6 8.3,3.2C9,2.8 9.7,2.6 10.4,2.6C11.2,2.6 11.9,2.8 12.6,3.2C13.3,3.6 13.8,3.8 14.1,3.8C14.4,3.8 14.9,3.6 15.6,3.2C16.3,2.8 16.6,2.6 16.6,2.4M13.5,0C13.6,0.7 13.5,1.4 13.1,2.1C12.7,2.8 12.1,3.4 11.4,3.7C11.3,3.1 11.4,2.4 11.8,1.7C12.2,1 12.8,0.4 13.5,0Z"
                              fill="currentColor"
                            />
                          </svg>
                        </Button>
                        <Button variant="outline" className="w-full">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                            <path
                              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                              fill="currentColor"
                            />
                          </svg>
                        </Button> */}
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex justify-center items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">E-Learning Platform</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Learn, teach, and grow with our community</p>
          </div>
        </div>

        {/* Modals */}
        <EmailModal
          open={isEmailModalOpen}
          onOpenChange={(open: boolean) => setIsEmailModalOpen(open)}
          onEmailVerified={async (email: string) => {
            try {
              setForgetPasswordEmail(email)
              const verify = await verifyEmail(email)
              toast.success(verify.message)
              setIsOTPModalOpen(true)
              setIsEmailModalOpen(false)
            } catch (error) {
              if (error instanceof AxiosError) {
                toast.error(error.response?.data?.message || "Error sending OTP")
              }
            }
          }}
        />

        <OTPModal
          isOpen={isOTPModalOpen}
          onClose={() => setIsOTPModalOpen(false)}
          onVerify={handleOTPVerified}
          role={activeRole}
          data={data}
          setIsOTPMpdalOpen={setIsOTPModalOpen}
        />
      </div>
    </GoogleOAuthProvider>
  )
}