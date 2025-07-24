import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon, BookOpen, Users, GraduationCap, ShieldCheck, ArrowRight } from "lucide-react";
import OTPModal from "@/components/modalComponents/otpModal";
import EmailModal from "@/components/modalComponents/emailModal";
import { NewPasswordModal } from "@/components/modalComponents/forgot-password";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { sendOtp } from "@/services/otpServices/otpServices";
import { verifyEmail } from "@/services/userServices/verifyEmail";
import { forgot_password_verify_Otp } from "@/services/otpServices/verifyOtp";
import { userAuthService } from "@/services/userServices/authServices";
import { addStudent } from "@/redux/slice/userSlice";
import { addTutor } from "@/redux/slice/tutorSlice";
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/validation";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleAuth } from "@/components/googleAuth/googleAuthComponent";

export type UserRole = "admin" | "student" | "tutor";

interface AuthFormProps {
  role?: UserRole;
  allowRoleSelection?: boolean;
  showRegistration?: boolean;
  onRegister?: (data: RegisterFormData, role: UserRole) => void;
  className?: string;
}

export default function AuthForm({
  role = "student",
  allowRoleSelection = true,
  showRegistration = true,
  onRegister,
  className,
}: AuthFormProps) {
  const [activeRole, setActiveRole] = useState<UserRole>(role);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isNewPasswordModalOpen, setIsNewPasswordModalOpen] = useState(false);
  const [forgetPasswordEmail, setForgetPasswordEmail] = useState("");
  const [data, setData] = useState<LoginFormData>();
  const [isRegistered, setIsRegistered] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
 const route = useNavigate()
  // Login form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
  });

  // Map frontend role to backend role
  const getBackendRole = (frontendRole: UserRole): string => {
    switch (frontendRole) {
      case "student":
        return "student"; // Backend expects "user" for student
      case "tutor":
        return "tutor";
      case "admin":
        return "admin";
      default:
        return "student";
    }
  };

  useEffect(() => {
      const adminToken = localStorage.getItem("userDatas"); 
      if (adminToken) {
        route("/"); 
      }
    }, []);

    const handleLoginSubmit = (data: LoginFormData) => {
      const backendRole = getBackendRole(activeRole);
      const endpoint = activeRole === "tutor" ? "/auth/tutor/login" : "/auth/user/login";
      console.log(endpoint)

      const res = authAxiosInstance
        .post(endpoint, { ...data, role: backendRole }) 
        .then((response) => {
          let { user } = response.data;
          user = { ...user, role: activeRole };
          if (activeRole === "tutor") {
            dispatch(addTutor(user));
            navigate("/tutor/home");
          } else {
            dispatch(addStudent(user));
            navigate("/");
          }
    
          toast.success(response.data.message);
          loginForm.reset();
        })
        .catch((error) =>
          toast.error(error.response?.data?.message)
        );

          console.log("redux data-------",res)
    };
    
    
  const handleRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const res = await sendOtp(data);
      setData(data);
      toast.success(res.message);
      setIsOTPModalOpen(true);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Error sending OTP");
      }
    }
  };

  const handleRegisterUser = async () => {
    try {
      const data = registerForm.getValues();
      const backendRole = getBackendRole(activeRole);
      const res = await userAuthService.registerUser({ ...data, role: backendRole });
      toast.success(res.message);
      onRegister?.(data, activeRole);
      registerForm.reset();
      setIsRegistered(true);

      const tabsElement = document.querySelector('[data-state="inactive"][data-value="login"]') as HTMLElement;
      if (tabsElement) {
        tabsElement.click();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Registration failed");
      }
    }
  };

  const handleOTPVerified = async (otp: string) => {
    try {
      const data = registerForm.getValues();
      const email = data.email || forgetPasswordEmail;
      const res = await forgot_password_verify_Otp(email, otp);
      toast.success(res.message);
      setIsOTPModalOpen(false);
      setIsEmailModalOpen(false);

      if (forgetPasswordEmail) {
        setIsNewPasswordModalOpen(true); // Open NewPasswordModal
      } else if (data.email) {
        handleRegisterUser();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Error verifying OTP");
      }
    }
  };

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
        };
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
        };
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
        };
    }
  };

  const roleConfig = getRoleConfig(activeRole);
  const googleAuthRole = activeRole === "student" ? "student" : activeRole;

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
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="flex items-center cursor-pointer w-full">
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
                        <p className="text-red-500 text-sm">{loginForm.formState.errors.email?.message}</p>
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
                        <p className="text-red-500 text-sm">{loginForm.formState.errors.password?.message}</p>
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
                          <p className="text-red-500 text-sm">{registerForm.formState.errors.name?.message}</p>
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
                          <p className="text-red-500 text-sm">{registerForm.formState.errors.email?.message}</p>
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
                          <p className="text-red-500 text-sm">{registerForm.formState.errors.password?.message}</p>
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
                          <p className="text-red-500 text-sm">{registerForm.formState.errors.confirmPassword?.message}</p>
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
                          {registerForm.formState.errors.specialization && (
                            <p className="text-red-500 text-sm">{registerForm.formState.errors.specialization?.message}</p>
                          )}
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
                      <Button variant="outline" className="w-full flex items-center justify-center">
                        <GoogleAuth role={googleAuthRole as "student" | "tutor"} />
                      </Button>
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

          {/* Modals */}
          <EmailModal
            open={isEmailModalOpen}
            onOpenChange={(open: boolean) => setIsEmailModalOpen(open)}
            onEmailVerified={async (email: string) => {
              try {
                setForgetPasswordEmail(email);
                const verify = await verifyEmail(email);
                toast.success(verify.message);
                setIsOTPModalOpen(true);
                setIsEmailModalOpen(false);
              } catch (error) {
                if (error instanceof AxiosError) {
                  toast.error(error.response?.data?.message || "Error sending OTP");
                }
              }
            }}
          />

          <OTPModal
            isOpen={isOTPModalOpen}
            onClose={() => setIsOTPModalOpen(false)}
            onVerify={handleOTPVerified}
            role ={activeRole}
            data={data}
            setIsOTPMpdalOpen={setIsOTPModalOpen}
          />

          <NewPasswordModal
            open={isNewPasswordModalOpen}
            onOpenChange={setIsNewPasswordModalOpen}
            onPasswordUpdated={() => {
              setIsNewPasswordModalOpen(false);
              setForgetPasswordEmail("");
              const tabsElement = document.querySelector('[data-state="inactive"][data-value="login"]') as HTMLElement;
              if (tabsElement) {
                tabsElement.click();
              }
            }}
            email={forgetPasswordEmail}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}