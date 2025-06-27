import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  BookOpen,
  User,
  Clock,
  Star,
  Calendar,
  FileText,
  Download,
  ArrowLeft,
  Loader,
  PlayCircle,
  CheckSquare,
  MessageSquare,
  Heart,
  Lock,
  CheckCircle,
  Award,
  Video,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { courseService } from "@/services/courseServices/courseService";
import { lessonService } from "@/services/lessonServices/lessonServices";
import { wishlistService } from "@/services/wishlistServices/wishlistService";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { useInView } from "react-intersection-observer";
import Header from "../../components/header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import io, { Socket } from "socket.io-client";
import { setVideoCallUser, setShowVideoCallUser, setRoomIdUser } from "@/redux/slice/userSlice";

// Utility to debounce a function
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

interface Tutor {
  _id?: string;
  name: string;
  phone?: string;
  specialization?: string;
  bio?: string;
}

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
  tutor?: Tutor;
  tutorId?: string;
  createdAt?: string;
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

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  course_id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const CourseInfo = React.memo(
  ({
    course,
    lessons,
    isEnrolled,
    loadingEnrollment,
    inWishlist,
    loadingWishlist,
    getTotalDuration,
    getDifficultyColor,
    handleToggleWishlist,
    handleEnrollNow,
    completedLessons,
    calculateProgress,
    handleChatWithInstructor,
    loadingChat,
    handleStartCall,
    loadingCall,
  }: {
    course: Course;
    lessons: Lesson[];
    isEnrolled: boolean;
    loadingEnrollment: boolean;
    inWishlist: boolean;
    loadingWishlist: boolean;
    getTotalDuration: () => string;
    getDifficultyColor: (difficulty: string) => string;
    handleToggleWishlist: () => void;
    handleEnrollNow: () => void;
    completedLessons: string[];
    calculateProgress: () => number;
    handleChatWithInstructor: () => void;
    loadingChat: boolean;
    handleStartCall: () => void;
    loadingCall: boolean;
  }) => {
    const isCourseCompleted = useMemo(
      () => lessons.length > 0 && lessons.every((lesson) => completedLessons.includes(lesson._id)),
      [lessons, completedLessons]
    );
    const remainingLessons = useMemo(() => lessons.length - completedLessons.length, [lessons, completedLessons]);

    return (
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {course.difficulty && (
              <Badge className={`${getDifficultyColor(course.difficulty)} px-3 py-1 text-sm font-medium`}>
                {course.difficulty}
              </Badge>
            )}
            {course.category && (
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm font-medium border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300"
              >
                {course.category}
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{course.title}</h1>
            {course.tagline && (
              <p className="text-xl text-gray-600 dark:text-gray-300">{course.tagline}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium">{course.tutor?.name || course.tutorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.ratings?.toFixed(1) || 4.5}</span>
              <span className="text-gray-500">({course.reviewCount || 0} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>{getTotalDuration()}</span>
            </div>
            {course.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Updated {new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {loadingEnrollment ? (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Checking enrollment...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card
            className={`border-2 ${isEnrolled ? "border-green-600 bg-green-50 dark:border-green-600 dark:bg-green-900/20" : "border-amber-600 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/20"}`}
          >
            <CardContent className="p-6">
              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-semibold text-lg">You're enrolled!</span>
                  </div>
                  {isCourseCompleted ? (
                    <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                      <Award className="h-5 w-5" />
                      <span className="font-medium">Course completed!</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progress: {completedLessons.length} of {lessons.length} lessons
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {calculateProgress()}%
                        </span>
                      </div>
                      <Progress value={calculateProgress()} className="h-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {remainingLessons} lesson{remainingLessons !== 1 ? "s" : ""} remaining
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-300">
                  <Lock className="h-6 w-6" />
                  <span className="font-semibold text-lg">Enroll to access all course content</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            size="lg"
            className={`${
              inWishlist ? "border-rose-600 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20" : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
            onClick={handleToggleWishlist}
            disabled={loadingWishlist}
          >
            {loadingWishlist ? (
              <Loader className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Heart className={`mr-2 h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
            )}
            {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          </Button>

          {isEnrolled && (
            <>
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleChatWithInstructor}
                disabled={loadingChat}
              >
                {loadingChat ? (
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-5 w-5" />
                )}
                Chat with Instructor
              </Button>
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleStartCall}
                disabled={loadingCall}
              >
                {loadingCall ? (
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Video className="mr-2 h-5 w-5" />
                )}
                Call Tutor
              </Button>
            </>
          )}
        </div>

        <div className="lg:hidden">
          <Card className="overflow-hidden border-gray-200 dark:border-gray-700">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=384&text=Course";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">₹{course.price.toFixed(2)}</div>
              </div>

              {!isEnrolled ? (
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleEnrollNow}>
                  Enroll Now
                </Button>
              ) : isCourseCompleted ? (
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled
                >
                  <Award className="mr-2 h-5 w-5" />
                  Course completed
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleEnrollNow}
                >
                  Continue Learning
                </Button>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{getTotalDuration()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{lessons.length} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Resources</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
);

const LessonItem = React.memo(
  ({
    lesson,
    index,
    isEnrolled,
    showVideoModal,
    handleEnrollNow,
    formatDuration,
    isCompleted,
  }: {
    lesson: Lesson;
    index: number;
    isEnrolled: boolean;
    showVideoModal: (url: string, lessonId: string) => void;
    handleEnrollNow: () => void;
    formatDuration: (seconds: number) => string;
    isCompleted: boolean;
  }) => (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${isCompleted ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : "border-gray-200 dark:border-gray-700"}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              isCompleted
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            }`}
          >
            {isCompleted ? <CheckCircle className="h-5 w-5" /> : lesson.order || index + 1}
          </div>

          <div className="flex-grow space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{lesson.title}</h4>
            {lesson.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {lesson.description.length > 120 ? `${lesson.description.substring(0, 120)}...` : lesson.description}
              </p>
            )}
            <div className="flex items-center gap-4">
              {lesson.duration > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  {formatDuration(lesson.duration)}
                </div>
              )}
              {isEnrolled && isCompleted && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            {lesson.file ? (
              isEnrolled || index === 0 ? (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => showVideoModal(lesson.file!, lesson._id)}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Watch
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  onClick={handleEnrollNow}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Premium
                </Button>
              )
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-sm">No video</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
);

const SidebarCard = ({
  course,
  isEnrolled,
  loadingEnrollment,
  inWishlist,
  loadingWishlist,
  lessons,
  getTotalDuration,
  handleEnrollNow,
  handleToggleWishlist,
  navigate,
  courseId,
  completedLessons,
}: {
  course: Course;
  isEnrolled: boolean;
  loadingEnrollment: boolean;
  inWishlist: boolean;
  loadingWishlist: boolean;
  lessons: Lesson[];
  getTotalDuration: () => string;
  handleEnrollNow: () => void;
  handleToggleWishlist: () => void;
  navigate: (path: string) => void;
  courseId: string;
  completedLessons: string[];
}) => {
  const isCourseCompleted = lessons.length > 0 && lessons.every((lesson) => completedLessons.includes(lesson._id));

  return (
    <Card className="overflow-hidden border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=384&text=Course";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">₹{course.price.toFixed(2)}</div>
          <Button
            variant="ghost"
            size="sm"
            className={`${
              inWishlist
                ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
            onClick={handleToggleWishlist}
            disabled={loadingWishlist}
          >
            {loadingWishlist ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
            )}
          </Button>
        </div>

        {loadingEnrollment ? (
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Loader className="h-5 w-5 animate-spin" />
            <span>Checking enrollment...</span>
          </div>
        ) : isEnrolled ? (
          <div className="space-y-3">
            {isCourseCompleted ? (
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled
              >
                <Award className="mr-2 h-5 w-5" />
                Course completed
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigate(`/student/courses/${courseId}`)}
              >
                Continue Learning
              </Button>
            )}
          </div>
        ) : (
          <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleEnrollNow}>
            Enroll Now
          </Button>
        )}

        <Separator />

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">What's included:</h4>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Full lifetime access</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>{getTotalDuration()}</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>{lessons.length} lessons</span>
            </div>
            <div className="flex items-center gap-3">
              <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Downloadable resources</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Community support</span>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Certificate of completion</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReviewItem = ({
  reviewerName,
  timeAgo,
  rating,
  comment,
  avatarFallback,
  avatarBgClass,
  avatarTextClass,
}: {
  reviewerName: string;
  timeAgo: string;
  rating: number;
  comment: string;
  avatarFallback: string;
  avatarBgClass: string;
  avatarTextClass: string;
}) => (
  <div className="flex gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
    <Avatar className="h-12 w-12 flex-shrink-0">
      <AvatarFallback className={`${avatarBgClass} ${avatarTextClass} font-semibold`}>{avatarFallback}</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{reviewerName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{timeAgo}</div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{comment}</p>
    </div>
  </div>
);

const ReviewForm = ({
  newReview,
  setNewReview,
  handleSubmitReview,
  submittingReview,
  hasReviewed,
}: {
  newReview: { rating: number; comment: string };
  setNewReview: React.Dispatch<React.SetStateAction<{ rating: number; comment: string }>>;
  handleSubmitReview: () => void;
  submittingReview: boolean;
  hasReviewed: boolean;
}) => {
  if (hasReviewed) return null;

  return (
    <Card className="bg-gray-50 dark:bg-gray-800/50">
      <CardContent className="p-6 space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Submit Your Review</h4>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= newReview.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </button>
          ))}
        </div>
        <div>
          <Label htmlFor="review-comment" className="text-gray-700 dark:text-gray-300">
            Your Feedback
          </Label>
          <Textarea
            id="review-comment"
            value={newReview.comment}
            onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
            placeholder="Share your thoughts about the course..."
            className="mt-2"
            rows={4}
          />
        </div>
        <Button
          onClick={handleSubmitReview}
          disabled={submittingReview}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {submittingReview ? (
            <Loader className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Star className="mr-2 h-5 w-5" />
          )}
          Submit Review
        </Button>
      </CardContent>
    </Card>
  );
};

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [visibleLessons, setVisibleLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingCall, setLoadingCall] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentLessonIdRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { ref: loadMoreRef, inView } = useInView();
  const lessonsPerPage = 10;
  const currentUser = useSelector((state: any) => state.user.userDatas);
  const studentId = currentUser?._id || currentUser?.id;

  // Initialize socket
  useEffect(() => {
    if (!studentId) return;
    socketRef.current = io(import.meta.env.VITE_AUTH_BASEURL || "http://localhost:3000", {
      query: { userId: studentId },
    });
    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
      socketRef.current?.emit("join_user", studentId);
    });
    socketRef.current.on("error", ({ message }) => {
      toast.error(message);
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, [studentId]);

  const courseDetails = useMemo(
    () => ({
      _id: course?._id,
      title: course?.title,
      tutorId: course?.tutorId || course?.tutor?._id,
    }),
    [course]
  );

  const handleChatWithInstructor = useCallback(async () => {
    if (!courseId) {
      toast.error("Invalid course ID");
      return;
    }
    setLoadingChat(true);
    try {
      const response = await courseService.getCourseDetailsInStudentSide(courseId);
      const courseData = response.course || response;
      if (!courseData || !courseData._id) {
        throw new Error("Course not found");
      }
      const tutorId = courseData.tutor?._id || courseData.tutorId;
      if (!tutorId) {
        throw new Error("Tutor information not available");
      }
      navigate(`/student/${courseId}/chat`, {
        state: {
          courseId,
          tutorId,
          courseTitle: courseData.title,
        },
      });
    } catch (error: any) {
      console.error("Error fetching course details for chat:", error);
      toast.error(error.message || "Failed to start chat");
    } finally {
      setLoadingChat(false);
    }
  }, [courseId, navigate]);

  const handleStartCallInternal = async () => {
    if (!isEnrolled) {
      toast.info("Please enroll in the course to call the tutor");
      navigate(`/student/checkout/${courseId}`);
      return;
    }
    if (!courseId || !studentId || !courseDetails.tutorId) {
      toast.error("Course, user, or tutor data not loaded");
      console.error("handleStartCall: Missing data", {
        courseId,
        studentId,
        tutorId: courseDetails.tutorId,
      });
      return;
    }

    setLoadingCall(true);
    try {
      const roomId = `room_${Date.now()}_${studentId}_${courseDetails.tutorId}`;
      console.log("Initiating call with:", {
        courseId,
        studentId,
        tutorId: courseDetails.tutorId,
        courseTitle: courseDetails.title,
        roomId,
      });

      // Dispatch Redux actions to set up video call
      dispatch(
        setVideoCallUser({
          tutorId: courseDetails.tutorId,
          courseId,
          courseTitle: courseDetails.title,
        })
      );
      dispatch(setRoomIdUser(roomId));
      dispatch(setShowVideoCallUser(true));
    } catch (error: any) {
      console.error("Error starting call:", error);
      toast.error(error.message || "Failed to initiate call");
    } finally {
      setLoadingCall(false);
    }
  };

  const handleStartCall = useCallback(debounce(handleStartCallInternal, 1000), [
    isEnrolled,
    courseId,
    studentId,
    courseDetails,
    dispatch,
    currentUser,
    navigate,
  ]);

  useEffect(() => {
    setVisibleLessons(lessons.slice(0, lessonsPerPage));
  }, [lessons]);

  useEffect(() => {
    if (inView && visibleLessons.length < lessons.length) {
      setVisibleLessons((prev) => lessons.slice(0, prev.length + lessonsPerPage));
    }
  }, [inView, lessons]);

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
        navigate("/student/courses");
      }
    } catch (error: any) {
      console.error("Error fetching course details:", error);
      toast.error(error.message || "Failed to load course details");
      navigate("/student/courses");
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

  const fetchCompletedLessons = useCallback(async () => {
    if (!isEnrolled) return;
    try {
      const response = await authAxiosInstance.get(`/progress/${courseId}/completed-lessons`);
      setCompletedLessons(response.data.lessons || []);
    } catch (error: any) {
      console.error("Error fetching completed lessons:", error);
      toast.error("Failed to load completed lessons");
    }
  }, [courseId, isEnrolled]);

  const markLessonCompleted = useCallback(
    async (lessonId: string) => {
      if (completedLessons.includes(lessonId)) return;
      try {
        setCompletedLessons((prev) => [...prev, lessonId]);
        await authAxiosInstance.post(`/progress/${lessonId}/complete`, { courseId });
        toast.success("Lesson marked as completed");
      } catch (error: any) {
        console.error("Error marking lesson as completed:", error);
        toast.error("Failed to mark lesson as completed");
        setCompletedLessons((prev) => prev.filter((id) => id !== lessonId));
      }
    },
    [courseId, completedLessons]
  );

  const checkWishlistStatus = useCallback(async () => {
    setLoadingWishlist(true);
    try {
      const isInWishlist = await wishlistService.isInWishlist(courseId!);
      setInWishlist(isInWishlist);
    } catch (error: any) {
      console.error("Error checking wishlist status:", error);
    } finally {
      setLoadingWishlist(false);
    }
  }, [courseId]);

  const checkEnrollmentStatus = useCallback(async () => {
    setLoadingEnrollment(true);
    try {
      const response = await authAxiosInstance.get(`/purchase/enrollments/${courseId}`);
      setIsEnrolled(response.data.data.isEnrolled);
    } catch (error: any) {
      console.error("Failed to check enrollment status:", error);
      toast.error("Failed to verify enrollment");
    } finally {
      setLoadingEnrollment(false);
    }
  }, [courseId]);

  const handleToggleWishlist = useCallback(async () => {
    setLoadingWishlist(true);
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(courseId!);
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await wishlistService.addToWishlist(courseId!);
        setInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setLoadingWishlist(false);
    }
  }, [inWishlist, courseId]);

  const showVideoModal = useCallback((url: string, lessonId: string) => {
    setVideoUrl(url);
    setCurrentLessonId(lessonId);
    currentLessonIdRef.current = lessonId;
    setIsVideoModalVisible(true);
  }, []);

  const handleEnrollNow = useCallback(() => {
    if (!courseId) {
      toast.error("Invalid course ID");
      return;
    }
    navigate(`/student/checkout/${courseId}`);
  }, [navigate, courseId]);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }, []);

  const getTotalDuration = useCallback(() => {
    if (!lessons.length) return "0m";
    const totalSeconds = lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
    return formatDuration(totalSeconds);
  }, [lessons, formatDuration]);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
    }
  }, []);

  const calculateProgress = useCallback(() => {
    if (lessons.length === 0) return 0;
    return Math.round((completedLessons.length / lessons.length) * 100);
  }, [lessons, completedLessons]);

  const handleVideoEnded = useCallback(() => {
    if (!currentLessonIdRef.current || !isEnrolled) return;
    if (completedLessons.includes(currentLessonIdRef.current)) return;
    markLessonCompleted(currentLessonIdRef.current);
  }, [isEnrolled, completedLessons, markLessonCompleted]);

  const fetchReviews = useCallback(async () => {
    if (!courseId) return;
    setLoadingReviews(true);
    try {
      const response = await authAxiosInstance.get(`/reviews/${courseId}`);
      setReviews(response.data.reviews || []);
      console.log("reviviivivi",response.data.reviews)
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  }, [courseId]);

  const handleSubmitReview = useCallback(async () => {
    if (!courseId) {
      toast.error("Invalid course ID");
      return;
    }
    if (!studentId) {
      toast.error("Please log in to submit a review");
      return;
    }
    if (newReview.rating < 1 || newReview.rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }
    if (!newReview.comment.trim()) {
      toast.error("Please provide a comment");
      return;
    }

    setSubmittingReview(true);
    try {
      await authAxiosInstance.post(`/reviews/${courseId}/add`, {
        courseId,
        userId: studentId,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      toast.success("Review submitted successfully");
      setNewReview({ rating: 0, comment: "" });
      fetchReviews();
      fetchCourseDetails();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  }, [courseId, studentId, newReview, fetchReviews, fetchCourseDetails]);

  const hasReviewed = useMemo(() => {
    if (!studentId || !reviews || reviews.length === 0) return false;
    return reviews.some((review) => review.user._id === studentId && review.course_id === courseId);
  }, [studentId, reviews, courseId]);

  const memoizedCourse = useMemo(() => course, [course]);
  const memoizedLessons = useMemo(() => lessons, [lessons]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return memoizedCourse?.ratings || 4.8;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews, memoizedCourse]);

  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (reviews.length === 0) return distribution;
    reviews.forEach((review) => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  }, [reviews]);

  const formattedReviews = useMemo(() => {
    return reviews.map((review, index) => {
      const colors = [
        {
          avatarBgClass: "bg-blue-100 dark:bg-blue-900",
          avatarTextClass: "text-blue-600 dark:text-blue-400",
        },
        {
          avatarBgClass: "bg-green-100 dark:bg-green-900",
          avatarTextClass: "text-green-600 dark:text-green-400",
        },
        {
          avatarBgClass: "bg-purple-100 dark:bg-purple-900",
          avatarTextClass: "text-purple-600 dark:text-purple-400",
        },
      ];
      const color = colors[index % colors.length];
      const timeAgo = new Date(review.createdAt).toLocaleDateString();
      return {
        reviewerName: review.user.name,
        timeAgo,
        rating: review.rating,
        comment: review.comment,
        avatarFallback: review.user.name.charAt(0).toUpperCase(),
        avatarBgClass: color.avatarBgClass,
        avatarTextClass: color.avatarTextClass,
      };
    });
  }, [reviews]);

  useEffect(() => {
    if (!courseId) {
      toast.error("Invalid course ID");
      navigate("/student/courses");
      return;
    }
    fetchCourseDetails();
    fetchLessons();
    checkWishlistStatus();
    checkEnrollmentStatus();
    fetchCompletedLessons();
    fetchReviews();
    return () => {
      setLoadingCall(false);
    };
  }, [
    courseId,
    navigate,
    fetchCourseDetails,
    fetchLessons,
    checkWishlistStatus,
    checkEnrollmentStatus,
    fetchCompletedLessons,
    fetchReviews,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
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
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <BookOpen className="h-24 w-24 text-gray-300 dark:text-gray-600" />
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Course Not Found</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-md">
                The course you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate("/student/courses")}
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Button
          variant="ghost"
          className="mb-8 flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Courses
        </Button>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <CourseInfo
              course={memoizedCourse}
              lessons={memoizedLessons}
              isEnrolled={isEnrolled}
              loadingEnrollment={loadingEnrollment}
              inWishlist={inWishlist}
              loadingWishlist={loadingWishlist}
              getTotalDuration={getTotalDuration}
              getDifficultyColor={getDifficultyColor}
              handleToggleWishlist={handleToggleWishlist}
              handleEnrollNow={handleEnrollNow}
              completedLessons={completedLessons}
              calculateProgress={calculateProgress}
              handleChatWithInstructor={handleChatWithInstructor}
              loadingChat={loadingChat}
              handleStartCall={handleStartCall}
              loadingCall={loadingCall}
            />

            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="curriculum"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                >
                  Curriculum
                </TabsTrigger>
                <TabsTrigger
                  value="instructor"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                >
                  Instructor
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Course</h3>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                          {memoizedCourse.about}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">What you'll learn</h4>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">Master fundamentals</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">Build projects</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">Gain practical skills</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-6">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Requirements</h4>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">Basic knowledge</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">Computer with internet</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Course Curriculum</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full">
                        <span className="font-semibold">{memoizedLessons.length}</span> lessons •{" "}
                        <span className="font-semibold">{getTotalDuration()}</span>
                      </div>
                    </div>

                    {loadingLessons ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        ))}
                      </div>
                    ) : memoizedLessons.length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No lessons available</h4>
                        <p className="text-gray-600 dark:text-gray-300">Lessons for this course are coming soon.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {visibleLessons.map((lesson, index) => (
                          <LessonItem
                            key={lesson._id}
                            lesson={lesson}
                            index={index}
                            isEnrolled={isEnrolled}
                            showVideoModal={showVideoModal}
                            handleEnrollNow={handleEnrollNow}
                            formatDuration={formatDuration}
                            isCompleted={completedLessons.includes(lesson._id)}
                          />
                        ))}
                        {visibleLessons.length < memoizedLessons.length && <div ref={loadMoreRef} className="h-10" />}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

             <TabsContent value="instructor" className="space-y-6">
                <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">About the Instructor</h3>
                    {memoizedCourse.tutor ? (
                      <div className="flex flex-col gap-6">
                        <div className="flex-shrink-0 text-center">
                          <Avatar className="h-24 w-24 mx-auto mb-3">
                            <AvatarImage src="/placeholder.svg?height=96&width=96" alt={memoizedCourse.tutor.name} />
                            <AvatarFallback className="text-2xl bg-blue-200 dark:bg-blue-700 text-blue-600 dark:text-blue-300">
                              {memoizedCourse.tutor.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{memoizedCourse.tutor.name}</h4>
                          <p className="text-gray-600 dark:text-gray-300 font-medium text-sm mb-4">
                            {memoizedCourse.tutor.specialization || "Expert Educator"}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h5 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              Biography
                            </h5>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                              {memoizedCourse.tutor.bio || "Passionate educator dedicated to helping students achieve their goals."}
                            </p>
                          </div>
                          {memoizedCourse.tutor.phone && (
                            <div className="space-y-2">
                              <h5 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                Contact
                              </h5>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                <span className="font-medium">Phone:</span> {memoizedCourse.tutor.phone}
                              </p>
                            </div>
                          )}
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                            onClick={() => navigate(`/student/tutor/${memoizedCourse.tutor?._id || memoizedCourse.tutorId}`)}
                            disabled={!memoizedCourse.tutor?._id && !memoizedCourse.tutorId}
                          >
                            View Tutor Profile
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Instructor Unavailable</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Details about the instructor are coming soon.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-8 space-y-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Student Reviews</h3>

                    <ReviewForm
                      newReview={newReview}
                      setNewReview={setNewReview}
                      handleSubmitReview={handleSubmitReview}
                      submittingReview={submittingReview}
                      hasReviewed={hasReviewed}
                    />

                    {loadingReviews ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                          ></div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                            <CardContent className="p-6 text-center">
                              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
                                {averageRating}
                              </div>
                              <div className="flex justify-center mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-6 w-6 ${
                                      star <= averageRating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="text-gray-600 dark:text-gray-300 font-medium">
                                {reviews.length} Reviews
                              </div>
                            </CardContent>
                          </Card>

                          <div className="md:col-span-2">
                            <div className="space-y-4">
                              {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-4">
                                  <div className="w-16 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                    {star} star{star !== 1 ? "s" : ""}
                                  </div>
                                  <div className="flex-1">
                                    <Progress
                                      value={
                                        reviews.length > 0
                                          ? (ratingDistribution[star] / reviews.length) * 100
                                          : 0
                                      }
                                      className="h-3"
                                    />
                                  </div>
                                  <div className="w-12 text-sm text-gray-600 dark:text-gray-300 text-right font-medium">
                                    {reviews.length > 0
                                      ? `${Math.round((ratingDistribution[star] / reviews.length) * 100)}%`
                                      : "0%"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                          {reviews.length === 0 ? (
                            <div className="text-center py-12">
                              <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No Reviews Yet
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300">
                                Be the first to review this course!
                              </p>
                            </div>
                          ) : (
                            formattedReviews.map((review, index) => (
                              <ReviewItem
                                key={index}
                                reviewerName={review.reviewerName}
                                timeAgo={review.timeAgo}
                                rating={review.rating}
                                comment={review.comment}
                                avatarFallback={review.avatarFallback}
                                avatarBgClass={review.avatarBgClass}
                                avatarTextClass={review.avatarTextClass}
                              />
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-4">
              {loading ? (
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <SidebarCard
                  course={memoizedCourse}
                  isEnrolled={isEnrolled}
                  loadingEnrollment={loadingEnrollment}
                  inWishlist={inWishlist}
                  loadingWishlist={loadingWishlist}
                  lessons={memoizedLessons}
                  getTotalDuration={getTotalDuration}
                  handleEnrollNow={handleEnrollNow}
                  handleToggleWishlist={handleToggleWishlist}
                  navigate={navigate}
                  courseId={courseId!}
                  completedLessons={completedLessons}
                />
              )}
            </div>
          </div>
        </div>

        <Dialog open={isVideoModalVisible} onOpenChange={setIsVideoModalVisible}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Lesson Video</DialogTitle>
              <DialogClose />
            </DialogHeader>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                controls
                src={videoUrl}
                className="w-full h-full"
                autoPlay
                onEnded={handleVideoEnded}
                controlsList="nodownload"
              />
            </div>
            {isEnrolled && currentLessonId && (
              <Button
                onClick={() => markLessonCompleted(currentLessonId)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Mark as Completed
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default React.memo(CourseDetails);