export interface TLessonInput {
    title: string;
    courseId: string;
    description: string;
    file: string;
    duration: number | undefined;
    order: number | undefined;
  }
  
  export interface TLesson {
    _id: string;
    title: string;
    courseId: string;
    description: string;
    file: string;
    duration?: number;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
  }