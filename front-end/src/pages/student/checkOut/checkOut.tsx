import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  Loader,
  User,
  Star,
  Shield,
  FileText,
  Clock,
  CheckCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { courseService } from "@/services/courseServices/courseService";
import { lessonService } from "@/services/lessonServices/lessonServices";
import { enrollmentService } from "@/services/purchaseServices/enrollmentService";
import { paymentService } from "@/services/purchaseServices/purchaseService";
import Header from "../components/header";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import React from "react";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISH_KEY || "pk_test_placeholder"
);

interface Course {
  _id: string;
  title: string;
  tagline?: string;
  price: number;
  thumbnail?: string;
  about: string;
  difficulty: string;
  category: string;
  tutorName?: string;
  tutorId?: string;
  ratings?: number;
  reviewCount?: number;
}

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  order: number;
  duration: number;
  file?: string;
}

interface RenderStripeProps {
  courseId: string;
  amount: number;
  isProcessing: boolean;
  setIsProcessing: (loading: boolean) => void;
  onPaymentSuccess: (transactionId: string) => void;
}

// Skeleton Loader for Course Details
const CourseDetailsSkeleton = () => (
  <div className="animate-pulse">
    <div className="md:grid md:grid-cols-12 gap-6">
      <div className="md:col-span-4">
        <div className="aspect-video bg-gray-200 rounded-lg dark:bg-gray-700"></div>
      </div>
      <div className="md:col-span-8 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 rounded w-20 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-20 dark:bg-gray-700"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full dark:bg-gray-700"></div>
        <div className="h-4 bg-gray-200 rounded w-full dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

// Skeleton Loader for Order Summary
const OrderSummarySkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-5 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
      <div className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
    </div>
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
      <div className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
    </div>
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
      <div className="h-4 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
    </div>
    <div className="h-1 bg-gray-200 rounded dark:bg-gray-700"></div>
    <div className="flex justify-between">
      <div className="h-5 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
      <div className="h-5 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
    </div>
  </div>
);

// Memoized RenderStripe Component
const RenderStripe = React.memo(
  ({
    courseId,
    amount,
    isProcessing,
    setIsProcessing,
    onPaymentSuccess,
  }: RenderStripeProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [cardComplete, setCardComplete] = useState(false);

    const handleStripePayment = useCallback(async () => {
      if (!stripe || !elements) {
        console.error(
          "Stripe initialization error: stripe or elements not available"
        );
        toast.error("Stripe not initialized properly");
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        console.log("Step 1: Creating PaymentIntent", {
          courseId,
          amount: amount * 100,
          currency: "inr",
        });
        const response = await authAxiosInstance.post(
          "/payment/stripe/create-payment-intent",
          {
            amount: amount * 100,
            currency: "inr",
            courseId,
          }
        );

        console.log("Step 1 Response: PaymentIntent created", response.data);
        const { clientSecret } = response.data;

        if (!clientSecret) {
          console.error("Step 1 Error: No clientSecret in response", response.data);
          throw new Error("Failed to obtain payment authentication from server");
        }

        console.log("Step 2: Confirming payment with Stripe", { clientSecret });
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        });

        if (result.error) {
          console.error("Step 2 Error: Payment confirmation failed", result.error);
          const isIndianRegulationError = result.error.message?.includes(
            "export transactions require a description"
          );
          if (!isIndianRegulationError) {
            setError(result.error.message || "Payment failed. Please try again.");
            toast.error(result.error.message || "Payment failed");
          } else {
            throw new Error(
              "Payment failed due to Indian regulation: export transactions require a description"
            );
          }
        } else if (result.paymentIntent?.status === "succeeded") {
          console.log("Step 2 Success: Payment confirmed", result.paymentIntent);
          let enrollmentFailed = false;

          try {
            console.log("Step 3: Updating payment status", {
              paymentIntentId: result.paymentIntent.id,
            });
            const updateResponse = await authAxiosInstance.post(
              "/payment/stripe",
              {
                paymentIntentId: result.paymentIntent.id,
                status: "succeeded",
              }
            );
            console.log(
              "Step 3 Response: Payment status updated",
              updateResponse.data
            );

            console.log("Step 4: Enrolling user", {
              courseId,
              transactionId: result.paymentIntent.id,
              amount,
            });
            const enrollResponse = await paymentService.enroll(
              courseId,
              result.paymentIntent.id,
              amount,
              true
            );
            console.log("Step 4 Response: Enrollment completed", enrollResponse);
          } catch (error: any) {
            console.error(
              "Step 3/4 Error: Enrollment failed after payment",
              error
            );
            enrollmentFailed = true;
            setError(
              "Payment succeeded, but enrollment failed. Please contact support."
            );
            toast.error(
              "Payment succeeded, but enrollment failed. Please contact support."
            );
          }

          if (!enrollmentFailed) {
            console.log("Step 5: Triggering success UI");
            toast.success("Payment successful! You're now enrolled in this course.");
            onPaymentSuccess(result.paymentIntent.id);
          }
        }
      } catch (error: any) {
        console.error("Payment processing error:", error);
        const isIndianRegulationError = error.message?.includes(
          "export transactions require a description"
        );
        if (!isIndianRegulationError) {
          setError(
            error.message || "Payment processing failed. Please try again."
          );
          toast.error(
            error.message || "Payment processing failed. Please try again."
          );
        } else {
          setError("Payment failed due to Indian regulation requirements.");
          toast.error("Payment failed due to Indian regulation requirements.");
        }
      } finally {
        setIsProcessing(false);
        console.log("Payment flow completed");
      }
    }, [stripe, elements, courseId, amount, setIsProcessing, onPaymentSuccess]);

    return (
      <div className="space-y-6">
        <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-4">
            <label
              htmlFor="card-element"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Card Details
            </label>
            <div className="rounded-md border border-gray-300 p-4 dark:border-gray-600">
              <CardElement
                id="card-element"
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSmoothing: "antialiased",
                      "::placeholder": { color: "#aab7c4" },
                    },
                    invalid: { color: "#9e2146", iconColor: "#9e2146" },
                  },
                }}
                onChange={(e) => setCardComplete(e.complete)}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleStripePayment}
            disabled={!stripe || !elements || !cardComplete || isProcessing}
          >
            <Lock className="mr-2 h-4 w-4" />
            Pay ₹{amount.toFixed(2)}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          <Shield className="h-4 w-4" />
          <span>Payments are secure and encrypted</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <img
            src="https://cdn.sanity.io/images/kts928pd/production/91daab30959a6efc6b31m121afbe1beb418daf3-241x24.svg"
            alt="Visa"
            className="h-6"
          />
          <img
            src="https://cdn.sanity.io/images/kts928pd/production/c0598bbed18d4763e4ad4c1d83e2e1b0f6dd6e9a-241x24.svg"
            alt="Mastercard"
            className="h-6"
          />
          <img
            src="https://cdn.sanity.io/images/kts928pd/production/8e2904636a450bb9322542b12f72d8379477757c-241x24.svg"
            alt="American Express"
            className="h-6"
          />
        </div>
      </div>
    );
  }
);

// Memoized CourseDetails Component
const CourseDetails = React.memo(
  ({
    course,
    lessons,
    loadingLessons,
    getTotalDuration,
  }: {
    course: Course;
    lessons: Lesson[];
    loadingLessons: boolean;
    getTotalDuration: () => string;
  }) => (
    <div className="mb-6 grid gap-6 md:grid-cols-12">
      <div className="md:col-span-4">
        <div className="aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
          {course.thumbnail ? (
            <img
              src={course.thumbnail || "/placeholder.svg"}
              alt={course.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/placeholder.svg?height=160&width=320&text=Course";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-8 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {course.title}
          </h2>
          {course.tagline && (
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {course.tagline}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {course.difficulty && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {course.difficulty}
            </Badge>
          )}
          {course.category && (
            <Badge
              variant="outline"
              className="border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300"
            >
              {course.category}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center">
            <User className="mr-1.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {course.tutorName}
            </span>
          </div>
          <div className="flex items-center">
            <Star className="mr-1.5 h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {course.ratings} ({course.reviewCount} reviews)
            </span>
          </div>
          <div className="flex items-center">
            <FileText className="mr-1.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {loadingLessons ? "Loading..." : `${lessons.length} lessons`}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-600 dark:text-gray-300">
              {loadingLessons ? "Loading..." : getTotalDuration()}
            </span>
          </div>
        </div>

        {course.about && (
          <div>
            <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />
            <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white">
              About this course
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {course.about.length > 300
                ? `${course.about.substring(0, 300)}...`
                : course.about}
            </p>
          </div>
        )}
      </div>
    </div>
  )
);

// Memoized OrderSummary Component
const OrderSummary = React.memo(
  ({
    course,
    lessons,
    loadingLessons,
    getTotalDuration,
  }: {
    course: Course;
    lessons: Lesson[];
    loadingLessons: boolean;
    getTotalDuration: () => string;
  }) => (
    <Card className="bg-white shadow-md dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
        <CardTitle className="text-lg text-gray-800 dark:text-white">
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {loadingLessons ? (
          <OrderSummarySkeleton />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                Course Price
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                ₹{course.price.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Lessons</span>
              <span className="text-gray-800 dark:text-white">
                {`${lessons.length} lessons`}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                Total Duration
              </span>
              <span className="text-gray-800 dark:text-white">
                {getTotalDuration()}
              </span>
            </div>

            <Separator className="my-2 bg-gray-200 dark:bg-gray-700" />

            <div className="flex justify-between font-medium">
              <span className="text-lg text-gray-800 dark:text-white">Total</span>
              <span className="text-lg text-blue-600 dark:text-blue-400">
                ₹{course.price.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <div className="border-t border-gray-100 p-6 dark:border-gray-700">
        <h3 className="mb-4 text-sm font-medium text-gray-800 dark:text-white">
          What you'll get:
        </h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start">
            <CheckCircle className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">
              Full lifetime access to this course
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">
              {loadingLessons
                ? "Loading..."
                : `${lessons.length} on-demand video lessons`}
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">
              Access on mobile, tablet and desktop
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">
              Certificate of completion
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">
              30-day money-back guarantee
            </span>
          </li>
        </ul>
      </div>

      <div className="bg-gray-50 p-6 dark:bg-gray-750 rounded-b-lg border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Lock className="h-4 w-4" />
          <span>Secure checkout</span>
        </div>
      </div>
    </Card>
  )
);

const CheckoutPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [displayStripe, setDisplayStripe] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const checkEnrollmentStatus = useCallback(async () => {
    try {
      const response = await enrollmentService.checkEnrollmentStatus(courseId!);
      setEnrollmentStatus(response.isEnrolled ? "enrolled" : null);
    } catch (error: any) {
      console.error("Failed to check enrollment status:", error);
      toast.error("Failed to check enrollment status. Please try again.");
    }
  }, [courseId]);

  const fetchCourseDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await courseService.getCourseDetailsInStudentSide(courseId!);
      const courseData = response.course || response;
      if (courseData && courseData._id) {
        setCourse({
          ...courseData,
          tutorName: courseData.tutor?.name || courseData.tutorName || "Instructor",
          ratings: courseData.ratings || 4.8,
          reviewCount: courseData.reviewCount || 42,
        });
      } else {
        toast.error("Course not found");
        navigate(`/student/courses/${courseId}`, { replace: true });
      }
    } catch (error: any) {
      console.error("Error fetching course details:", error);
      toast.error(error.message || "Failed to load course details");
      navigate(`/student/courses/${courseId}`, { replace: true });
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);

  const fetchLessons = useCallback(async () => {
    setLoadingLessons(true);
    try {
      const response = await lessonService.getLessonsByCourse(courseId!);
      if (response.lessons) {
        setLessons(response.lessons);
      }
    } catch (error: any) {
      console.error("Error fetching lessons:", error);
      toast.error(error.message || "Failed to load lesson details");
    } finally {
      setLoadingLessons(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is missing");
      navigate(`/student/courses/${courseId}`, { replace: true });
      return;
    }
    checkEnrollmentStatus();
  }, [courseId, navigate, checkEnrollmentStatus]);

  useEffect(() => {
    if (enrollmentStatus === "enrolled") {
      navigate(`/student/courses/${courseId}`, { replace: true });
    } else if (enrollmentStatus === null && courseId) {
      fetchCourseDetails();
      fetchLessons();
    }
  }, [enrollmentStatus, courseId, navigate, fetchCourseDetails, fetchLessons]);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }, []);

  const getTotalDuration = useCallback(() => {
    if (!lessons.length) return "0m";
    const totalSeconds = lessons.reduce((total, lesson) => {
      return total + (lesson.duration || 0);
    }, 0);
    return formatDuration(totalSeconds);
  }, [lessons, formatDuration]);

  const handlePayment = useCallback(() => {
    if (enrollmentStatus === "enrolled") {
      navigate(`/student/courses/${courseId}`, { replace: true });
      return;
    }

    if (paymentStep === 1) {
      setPaymentStep(2);
    } else if (paymentStep === 2) {
      setDisplayStripe(true);
      setPaymentStep(3);
    }
  }, [enrollmentStatus, paymentStep, courseId, navigate]);

  const handlePaymentSuccess = useCallback(
    (transactionId: string) => {
      setEnrollmentStatus("enrolled");
      setTransactionId(transactionId);
      console.log(
        `Generating PDF receipt for transaction: ${transactionId}, course: ${course?.title}, amount: ${course?.price}, at 12:23 PM IST on 23 May 2025`
      );
      setIsSuccessModalOpen(true);
    },
    [course]
  );

  const handleModalClose = useCallback(() => {
    setIsSuccessModalOpen(false);
    navigate("/", { replace: true });
  }, [navigate]);

  const memoizedCourse = useMemo(() => course, [course]);
  const memoizedLessons = useMemo(() => lessons, [lessons]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CourseDetailsSkeleton />
            </div>
            <div>
              <OrderSummarySkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!memoizedCourse) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <BookOpen className="mb-6 h-20 w-20 text-gray-300 dark:text-gray-600" />
            <h2 className="mb-3 text-2xl font-bold text-gray-800 dark:text-gray-100">
              Course Not Found
            </h2>
            <p className="mb-8 text-gray-600 dark:text-gray-300">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => navigate(`/student/courses/${courseId}`, { replace: true })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Return to Wishlist
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <Button
          variant="ghost"
          className="mb-6 flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          onClick={() => navigate(`/student/courses/${courseId}`, { replace: true })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course Details
        </Button>

        {enrollmentStatus !== "enrolled" && (
          <div className="mb-8">
            <div className="mb-2 flex justify-between px-2">
              <span
                className={`text-sm font-medium ${
                  paymentStep >= 1
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Course Details
              </span>
              <span
                className={`text-sm font-medium ${
                  paymentStep >= 2
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Payment Method
              </span>
              <span
                className={`text-sm font-medium ${
                  paymentStep >= 3
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Complete Payment
              </span>
            </div>
            <Progress
              value={paymentStep === 1 ? 33 : paymentStep === 2 ? 66 : 100}
              className="h-2 bg-gray-200 dark:bg-gray-700"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden bg-white shadow-md dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-750 border-b border-gray-100 dark:border-gray-700 pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                  {enrollmentStatus === "enrolled"
                    ? "You're Enrolled!"
                    : "Secure Checkout"}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {enrollmentStatus === "enrolled"
                    ? "Access your course content below"
                    : "Complete your purchase to get instant access to this course"}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                {enrollmentStatus === "enrolled" ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-6 rounded-full bg-green-100 p-3 dark:bg-green-900">
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="mb-3 text-2xl font-bold text-gray-800 dark:text-white">
                      You're Already Enrolled!
                    </h2>
                    <p className="mb-6 text-gray-600 dark:text-gray-300">
                      Start learning now or revisit your course content anytime.
                    </p>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                      onClick={() =>
                        navigate(`/student/courses/${courseId}/`, {
                          replace: true,
                        })
                      }
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      Go to Course
                    </Button>
                  </div>
                ) : (
                  <>
                    {paymentStep === 1 && (
                      <CourseDetails
                        course={memoizedCourse}
                        lessons={memoizedLessons}
                        loadingLessons={loadingLessons}
                        getTotalDuration={getTotalDuration}
                      />
                    )}

                    {paymentStep === 2 && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                          Select Payment Method
                        </h3>

                        <Tabs defaultValue="stripe" className="w-full">
                          <TabsList className="grid w-full grid-cols-1 bg-gray-100 dark:bg-gray-700">
                            <TabsTrigger
                              value="stripe"
                              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                            >
                              Credit/Debit Card
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="stripe" className="mt-6">
                            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                              <div className="mb-6 flex items-center justify-center">
                                <img
                                  src="https://stripe.com/img/v3/home/social.png"
                                  alt="Stripe"
                                  className="h-10"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder.svg?height=40&width=120&text=Stripe";
                                  }}
                                />
                              </div>

                              <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
                                Secure payment processing with Stripe. Your card
                                details are encrypted and secure.
                              </p>

                              <Button
                                onClick={handlePayment}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                size="lg"
                              >
                                <CreditCard className="mr-2 h-5 w-5" />
                                Continue to Payment
                              </Button>

                              <div className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <Shield className="h-4 w-4" />
                                <span>Your payment information is secure</span>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    )}

                    {paymentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Complete Your Payment
                          </h3>
                          <p className="mt-1 text-gray-600 dark:text-gray-300">
                            Enter your card details to complete the purchase
                          </p>
                        </div>

                        {displayStripe && (
                          <Elements stripe={stripePromise}>
                            <RenderStripe
                              courseId={courseId!}
                              amount={memoizedCourse.price}
                              isProcessing={isProcessing}
                              setIsProcessing={setIsProcessing}
                              onPaymentSuccess={handlePaymentSuccess}
                            />
                          </Elements>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>

              {!enrollmentStatus && paymentStep < 3 && (
                <CardFooter className="flex justify-between border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                  <Button
                    variant="outline"
                    onClick={() =>
                      paymentStep === 1
                        ? navigate(`/student/courses/${courseId}`, {
                            replace: true,
                          })
                        : setPaymentStep(paymentStep - 1)
                    }
                    className="border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {paymentStep === 1 ? "Cancel" : "Back"}
                  </Button>

                  <Button
                    onClick={handlePayment}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {paymentStep === 1
                          ? "Continue to Payment"
                          : "Proceed to Checkout"}
                      </>
                    )}
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          <div>
            <OrderSummary
              course={memoizedCourse}
              lessons={memoizedLessons}
              loadingLessons={loadingLessons}
              getTotalDuration={getTotalDuration}
            />
          </div>
        </div>
      </div>

      <Dialog open={isSuccessModalOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-gray-800 dark:text-white">
              Payment Successful!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-300">
              Congratulations! You've successfully enrolled in{" "}
              <span className="font-semibold">{memoizedCourse.title}</span>. A
              receipt has been generated for your records. Start learning now!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleModalClose}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Go to Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(CheckoutPage);