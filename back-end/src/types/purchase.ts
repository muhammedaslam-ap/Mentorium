export type purchaseInput={
    userId:string;
    courseId:string;
    amount:number;
    orderId:string;
    status:string
}


export type Course = {
  _id: string;
  title: string;
  tagline?: string;
  price: number; 
  thumbnail?: string;
  about: string;
  difficulty: string;
  category: string;
  tutorName?: string;
  tutor?: {
    _id?: string;
    name: string;
    phone?: string;
    specialization?: string;
    bio?: string;
  };
  tutorId?: string;
  createdAt?: string;
};

export type Lesson = {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  order: number;
  duration: number;
  file?: string;
};

export type User = {
  _id: string;
  email: string;
  name?: string;
  role?: 'student' | 'tutor' | 'admin';
};

export type Purchase = {
  courseId: string;
  orderId: string;
  amount: number; 
  status: 'pending' | 'succeeded' | 'failed';
  createdAt?: string;
};



export type CreatePaymentIntentResponse = {
  clientSecret: string;
};

export type EnrollCourseResponse = {
  message: string;
  alreadyPurchased?: boolean;
};

export type CheckEnrollmentResponse = {
  isEnrolled: boolean;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
};

export type CheckoutProps = {
  courseId: string;
  coursePrice: number; 
  courseTitle: string;
};