"use client"

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  PlusOutlined,
  LeftOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  FileOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Spin,
  Modal,
  Form,
  Upload,
  InputNumber,
  List,
  Typography,
  Tooltip,
  Progress,
  Popconfirm,
  Card as AntCard,
} from "antd";
import { Card } from "@/components/ui/card";
import { lessonService } from "@/services/lessonServices/lessonServices";
import { courseService } from "@/services/courseServices/courseService";
import { AxiosError } from "axios";

const { TextArea } = Input;
const { Text } = Typography;

interface Lesson {
  _id: string;
  title: string;
  courseId: string;
  description: string;
  file: string;
  duration?: number;
  order?: number;
  createdAt?: string;
}

interface UploadFile extends File {
  uid: string;
  name: string;
  status?: "uploading" | "done" | "error" | "removed";
  percent?: number;
  originFileObj?: File;
}

const CourseLessons: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const [courseTitle, setCourseTitle] = useState<string>("Course");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Debug params to verify courseId
  useEffect(() => {
    console.log("useParams output:", params);
  }, [params]);

  // Fetch course title
  const fetchCourseTitle = async (id: string) => {
    try {
      const course = await courseService.getCourseDetails(id);
      console.log("fetchCourseTitle Course:", course);
      if (course) {
        setCourseTitle(course.title || "Course");
      }
    } catch (error) {
      console.error("Error fetching course title:", error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to load course title");
      }
    }
  };

  // Fetch lessons
  const fetchLessons = async (id: string) => {
    setLoading(true);
    try {
      console.log("Fetching lessons for courseId:", id);
      const response = await lessonService.getLessonsByCourse(id);
      console.log("fetchLessons Raw Response:", response);
      
      let lessonsData: Lesson[] = [];
      
      // Handle different response formats
      if (Array.isArray(response)) {
        lessonsData = response;
      } else if (response.lessons && Array.isArray(response.lessons)) {
        lessonsData = response.lessons;
      } else if (response.data && Array.isArray(response.data.lessons)) {
        lessonsData = response.data.lessons;
      } else if (response.data && Array.isArray(response.data)) {
        lessonsData = response.data;
      } else {
        console.warn("Unexpected response format:", response);
      }

      console.log("Parsed lessonsData:", lessonsData);

      if (lessonsData.length > 0) {
        const sortedLessons = lessonsData.sort((a: Lesson, b: Lesson) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
        });
        setLessons(sortedLessons);
      } else {
        setLessons([]);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || "Failed to load lessons";
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
        });
        toast.error(errorMessage);
      }
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  // Load course data when courseId changes
  useEffect(() => {
    // Guard: Ensure courseId is a string
    if (!courseId) {
      toast.error("Invalid course ID");
      setLoading(false);
      return;
    }
    console.log("Fetching data for courseId:", courseId);
    fetchCourseTitle(courseId);
    fetchLessons(courseId);
  }, [courseId]);

  const showAddModal = () => {
    setIsEditMode(false);
    setCurrentLesson(null);
    setFileList([]);
    setUploadProgress(0);
    setUploadError(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (lesson: Lesson) => {
    setIsEditMode(true);
    setCurrentLesson(lesson);
    setFileList([]);
    setUploadProgress(0);
    setUploadError(null);
    form.setFieldsValue({
      title: lesson.title,
      description: lesson.description,
      duration: lesson.duration,
      order: lesson.order,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFileList([]);
    setUploadProgress(0);
    setUploadError(null);
    form.resetFields();
  };

  const handleFileChange = (info: any) => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    fileList = fileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    setFileList(fileList);
  };

  const beforeUpload = (file: File) => {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      toast.error("You can only upload video files!");
      return Upload.LIST_IGNORE;
    }
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      toast.error("Video must be smaller than 100MB!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0 && !isEditMode) {
      toast.error("Please upload a video file");
      return;
    }
    // Guard: Ensure courseId is a string
    if (!courseId) {
      toast.error("Invalid course ID");
      setUploading(false);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("courseId", courseId); // Add courseId to FormData
      formData.append("title", values.title);
      formData.append("description", values.description);
      if (values.duration) {
        formData.append("duration", values.duration.toString());
      }
      if (values.order) {
        formData.append("order", values.order.toString());
      }
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("video", fileList[0].originFileObj);
      }

      console.log("Submitting lesson with courseId:", courseId, "FormData:", Array.from(formData.entries()));
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      if (isEditMode && currentLesson) {
        await lessonService.updateLesson(currentLesson._id, formData);
      } else {
        await lessonService.addLesson(courseId, formData);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsModalVisible(false);
        setFileList([]);
        setUploadProgress(0);
        form.resetFields();
        fetchLessons(courseId); // Refresh lessons after adding
        setUploading(false);
      }, 500);
    } catch (error) {
      console.error("Error saving lesson:", error);
      setUploadError("Failed to save lesson. Please try again.");
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to save lesson");
      }
      setUploading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await lessonService.deleteLesson(lessonId);
      if (courseId) {
        fetchLessons(courseId);
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to delete lesson");
      }
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown duration";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Render error UI if courseId is invalid
  if (!courseId) {
    return (
      <div style={{ textAlign: "center", padding: 32 }}>
        <h1 style={{ fontSize: 24, color: "#ff4d4f" }}>Invalid Course ID</h1>
        <p style={{ color: "#595959" }}>
          Please select a valid course from the courses page.
        </p>
        <Button
          type="primary"
          onClick={() => navigate("/tutor/courses")}
          style={{ marginTop: 16 }}
        >
          Go to Courses
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ marginBottom: 32 }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate("/tutor/courses")}
          style={{ marginBottom: 16 }}
        >
          Back to Courses
        </Button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#1d39c4" }}>
              Lessons for: {courseTitle}
            </h1>
            <p style={{ color: "#595959" }}>Manage your course lessons</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add New Lesson
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
        </div>
      ) : lessons.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 32, border: "1px solid #f0f0f0" }}>
          <VideoCameraOutlined style={{ fontSize: 64, color: "#1d39c4", marginBottom: 16 }} />
          <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#1d39c4" }}>No lessons found</h3>
          <p style={{ color: "#595959", marginBottom: 24 }}>
            You haven't created any lessons for this course yet.
          </p>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Create Your First Lesson
          </Button>
        </Card>
      ) : (
        <AntCard>
          <List
            itemLayout="horizontal"
            dataSource={lessons}
            renderItem={(lesson, index) => (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(lesson)}
                  >
                    Edit
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Delete this lesson?"
                    description="This action cannot be undone."
                    onConfirm={() => handleDeleteLesson(lesson._id)}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<DeleteOutlined />}>
                      Delete
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#1d39c4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      {lesson.order || index + 1}
                    </div>
                  }
                  title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Text strong>{lesson.title}</Text>
                      {lesson.duration && (
                        <Tooltip title="Lesson duration">
                          <Text
                            type="secondary"
                            style={{ display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <ClockCircleOutlined /> {formatDuration(lesson.duration)}
                          </Text>
                        </Tooltip>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary" ellipsis={{ rows: 2 }}>
                        {lesson.description}
                      </Text>
                      {/* <div style={{ marginTop: 4 }}>{lesson.description}</div> */}
                      <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <Text
                          type="secondary"
                          style={{ display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <FileOutlined /> {lesson.file.split("/").pop()}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </AntCard>
      )}

      <Modal
        title={isEditMode ? "Edit Lesson" : "Add New Lesson"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={uploading}>
          <Form.Item
            name="title"
            label="Lesson Title"
            rules={[{ required: true, message: "Please enter a lesson title" }]}
          >
            <Input placeholder="Enter lesson title" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a lesson description" }]}
          >
            <TextArea rows={4} placeholder="Enter lesson description" />
          </Form.Item>
          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              name="duration"
              label="Duration (seconds)"
              style={{ flex: 1 }}
              tooltip="Optional: Duration of the lesson in seconds"
            >
              <InputNumber
                min={1}
                placeholder="Duration in seconds"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="order"
              label="Order"
              style={{ flex: 1 }}
              tooltip="Optional: Lesson order in the course (1, 2, 3, etc.)"
            >
              <InputNumber min={1} placeholder="Lesson order" style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <Form.Item
            label="Video File"
            required={!isEditMode}
            tooltip={
              isEditMode
                ? "Upload a new video file only if you want to replace the existing one"
                : "Upload a video file for this lesson"
            }
          >
            <Upload
              beforeUpload={beforeUpload}
              onChange={handleFileChange}
              fileList={fileList}
              maxCount={1}
              accept="video/*"
            >
              <Button icon={<UploadOutlined />}>Select Video File</Button>
            </Upload>
            <div style={{ marginTop: 8, color: "#8c8c8c", fontSize: 12 }}>
              <InfoCircleOutlined style={{ marginRight: 4 }} />
              {isEditMode
                ? "Only upload a new video if you want to replace the existing one."
                : "Please upload a video file (max 100MB)."}
            </div>
          </Form.Item>
          {uploadProgress > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Progress percent={uploadProgress} status={uploadError ? "exception" : "active"} />
              {uploadError && (
                <div style={{ color: "#ff4d4f", marginTop: 8 }}>{uploadError}</div>
              )}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <Button onClick={handleCancel} disabled={uploading}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={uploading}>
              {isEditMode ? "Update Lesson" : "Add Lesson"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseLessons;