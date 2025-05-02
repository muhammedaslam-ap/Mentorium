import { S3Client, HeadObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ILessonService } from '../interfaces/serviceInterface/IlessonServices';
import { ILessonRepository } from '../interfaces/repositoryInterface/IlessonRepository';
import { TLesson, TLessonInput } from '../types/lesson';
import { MulterS3File } from '../types/multer';
import { courseModel } from '../models/course';
import { lessonModel } from '../models/lessonModel';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export class LessonService implements ILessonService {
  constructor(private lessonRepository: ILessonRepository) {}

  async addLesson(tutorId: string, lessonData: TLessonInput, file: MulterS3File):  Promise<TLesson> {
    if (!tutorId) throw new Error('Tutor ID is required');
    if (!file) throw new Error('Video file is required');

    // Validate video format
    let newKey: string | undefined;

    if (file) {
        newKey = file.key;
        const fileExtension = newKey.split('.').pop()?.toLowerCase();
        if (!fileExtension || !['mp4', 'webm', 'ogg'].includes(fileExtension)) {
          throw new Error('Only MP4, WebM, or OGG videos are supported');
        }      if (!['mp4', 'webm', 'ogg'].includes(fileExtension)) {
          throw new Error('Only MP4, WebM, or OGG videos are supported');
        }
    }
    const course = await courseModel.findById(lessonData.courseId);
    if (!course) throw new Error('Course not found');
    if (course.tutorId.toString() !== tutorId) throw new Error('Unauthorized: You do not own this course');

    const key = file.key;
    console.log(`Verifying S3 file: ${key} (URL: ${file.location})`);
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
          Key: key,
        })
      );
      console.log(`File verified in S3: ${key}`);
    } catch (error: any) {
      console.error(`Failed to verify S3 file: ${key}`, error);
      throw new Error(`Failed to verify uploaded video in S3: ${error.message}`);
    }

    const lessonInput: TLessonInput = {
      ...lessonData,
      file: key,
    };

    try {
      await this.lessonRepository.createLesson(lessonInput);
      console.log(`Lesson created for courseId: ${lessonData.courseId}`);

      // Fetch the created lesson directly
      const createdLesson = await lessonModel
        .findOne({
          courseId: lessonData.courseId,
          title: lessonData.title,
          description: lessonData.description,
          file: key,
        })
        .lean()
        .exec();
      if (!createdLesson) throw new Error('Failed to retrieve created lesson');

      const lesson: TLesson = {
        _id: createdLesson._id.toString(),
        title: createdLesson.title,
        courseId: createdLesson.courseId.toString(),
        description: createdLesson.description,
        file: createdLesson.file,
        duration: createdLesson.duration ?? undefined,
        order: createdLesson.order ?? undefined,
        createdAt: createdLesson.createdAt?.toISOString(),
        updatedAt: createdLesson.updatedAt?.toISOString(),
      };

      const presignedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
          Key: key,
        }),
        { expiresIn: 3600 }
      );

      return { ...lesson, file: presignedUrl };
    } catch (error: any) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
            Key: key,
          })
        );
        console.log(`Deleted S3 file: ${key} due to lesson creation failure`);
      } catch (deleteError) {
        console.error(`Failed to delete S3 file: ${key}`, deleteError);
      }
      throw new Error(`Failed to create lesson: ${error.message}`);
    }
  }

  async getLessonById(lessonId: string): Promise<TLesson | null> {
    const lesson = await this.lessonRepository.getLessonById(lessonId);
    if (!lesson) return null;

    const presignedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
        Key: lesson.file,
      }),
      { expiresIn: 3600 }
    );

    return { ...lesson, file: presignedUrl };
  }

  async getLessonsByCourseId(courseId: string): Promise<TLesson[]> {
    const lessons = await this.lessonRepository.getLessonsByCourseId(courseId);

    const lessonsWithPresignedUrls = await Promise.all(
      lessons.map(async (lesson) => {
        const presignedUrl = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
            Key: lesson.file,
          }),
          { expiresIn: 3600 }
        );
        return { ...lesson, file: presignedUrl };
      })
    );

    return lessonsWithPresignedUrls;
  }

  async updateLesson(tutorId: string, lessonId: string, lessonData: Partial<TLessonInput>, file?: MulterS3File):  Promise<TLesson> {
    if (!tutorId) throw new Error('Tutor ID is required');

    const lesson = await this.lessonRepository.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const course = await courseModel.findById(lesson.courseId);
    if (!course) throw new Error('Course not found');
    if (course.tutorId.toString() !== tutorId) throw new Error('Unauthorized: You do not own this course');

    const updateData: Partial<TLessonInput> = { ...lessonData };
    let newKey: string | undefined;
    let oldKey: string | undefined;

    if (file) {
      newKey = file.key;
      const fileExtension = newKey.split('.').pop()?.toLowerCase();
      if (!fileExtension || !['mp4', 'webm', 'ogg'].includes(fileExtension)) {
        throw new Error('Only MP4, WebM, or OGG videos are supported');
      }      if (!['mp4', 'webm', 'ogg'].includes(fileExtension)) {
        throw new Error('Only MP4, WebM, or OGG videos are supported');
      }

      console.log(`Verifying new S3 file: ${newKey} (URL: ${file.location})`);
      try {
        await s3Client.send(
          new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
            Key: newKey,
          })
        );
        console.log(`New file verified in S3: ${newKey}`);
      } catch (error: any) {
        console.error(`Failed to verify new S3 file: ${newKey}`, error);
        throw new Error(`Failed to verify uploaded video in S3: ${error.message}`);
      }

      if (lesson.file) {
        oldKey = lesson.file;
        console.log(`Old S3 file to delete: ${oldKey}`);
      }

      updateData.file = newKey;
    }

    try {
      await this.lessonRepository.updateLesson(lessonId, updateData);
      console.log(`Lesson updated: ${lessonId}`);

      if (oldKey && newKey) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
              Key: oldKey,
            })
          );
          console.log(`Deleted old S3 file: ${oldKey}`);
        } catch (deleteError) {
          console.error(`Failed to delete old S3 file: ${oldKey}`, deleteError);
        }
      }

      const updatedLesson = await this.lessonRepository.getLessonById(lessonId);
      if (!updatedLesson) throw new Error('Failed to retrieve updated lesson');

      const presignedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
          Key: updateData.file || lesson.file,
        }),
        { expiresIn: 3600 }
      );

      return { ...updatedLesson, file: presignedUrl };

    } catch (error: any) {
      if (newKey) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
              Key: newKey,
            })
          );
          console.log(`Deleted new S3 file: ${newKey} due to update failure`);
        } catch (deleteError) {
          console.error(`Failed to delete new S3 file: ${newKey}`, deleteError);
        }
      }
      throw new Error(`Failed to update lesson: ${error.message}`);
    }
  }

  async deleteLesson(tutorId: string, lessonId: string): Promise<void> {
    if (!tutorId) throw new Error('Tutor ID is required');

    const lesson = await this.lessonRepository.getLessonById(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    const course = await courseModel.findById(lesson.courseId);
    if (!course) throw new Error('Course not found');
    if (course.tutorId.toString() !== tutorId) throw new Error('Unauthorized: You do not own this course');

    const key = lesson.file;
    console.log(`S3 file to delete: ${key}`);

    try {
      await this.lessonRepository.deleteLesson(lessonId);
      console.log(`Lesson deleted: ${lessonId}`);

      if (key) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
              Key: key,
            })
          );
          console.log(`Deleted S3 file: ${key}`);
        } catch (deleteError) {
          console.error(`Failed to delete S3 file: ${key}`, deleteError);
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to delete lesson: ${error.message}`);
    }
  }
}