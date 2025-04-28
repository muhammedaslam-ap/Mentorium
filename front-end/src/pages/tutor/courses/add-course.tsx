// src/pages/tutor/courses/AddCourse.tsx
import React, { useState, useRef, type ChangeEvent, Component } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LeftOutlined, UploadOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Form, Input, Button, Select, Slider, Upload, Space } from "antd";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { courseService } from "@/services/courseServices/courseService";
import Sidebar from "../components/sideBar"; // Adjust path
import Header from "../components/header"; // Adjust path
import { AxiosError } from "axios";

interface FormData {
  title: string;
  tagline: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  about: string;
}

interface FormErrors {
  title?: string;
  tagline?: string;
  category?: string;
  difficulty?: string;
  price?: string;
  about?: string;
  thumbnail?: string;
}

const categories = [
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
  "Blockchain",
  "Game Development",
  "Design",
  "Business",
  "Marketing",
  "Finance",
  "Health & Fitness",
  "Music",
  "Photography",
  "Other",
];

// Error Boundary Component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
    toast.error("An unexpected error occurred. Please try again.");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          <Button type="primary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AddCourse: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    tagline: "",
    category: "",
    difficulty: "Beginner",
    price: 29.99,
    about: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Add sidebar state

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Input change: ${name}=${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Select change: ${name}=${value}`);
    if (name === "difficulty" && !["Beginner", "Intermediate", "Advanced"].includes(value)) {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePriceChange = (value: number) => {
    console.log(`Price change: ${value}`);
    if (isNaN(value)) return;
    setFormData((prev) => ({ ...prev, price: value }));
    if (errors.price) {
      setErrors((prev) => ({ ...prev, price: undefined }));
    }
  };

  const handleImageUpload = (file: File) => {
    console.log("Image uploaded:", file.name);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImage(reader.result as string);
      setShowCropper(true);
    });
    reader.readAsDataURL(file);
    return false;
  };

  const getCroppedImg = () => {
    if (!imgRef.current || !completedCrop) {
      console.error("No image or crop data");
      return Promise.reject("No image or crop data");
    }

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Failed to get canvas context");
      return Promise.reject("Failed to get canvas context");
    }

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            console.error("Failed to create blob");
            reject("Failed to create blob");
          }
        },
        "image/jpeg",
        0.95,
      );
    });
  };

  const handleCropComplete = async () => {
    console.log("Crop complete:", completedCrop);
    if (!completedCrop) return;

    try {
      const croppedImg = await getCroppedImg();
      setCroppedImage(croppedImg);
      setShowCropper(false);
      toast.success("Image cropped successfully");
    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error("Failed to crop image");
    }
  };

  const validateForm = () => {
    console.log("Validating form:", formData);
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.tagline.trim()) newErrors.tagline = "Tagline is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!["Beginner", "Intermediate", "Advanced"].includes(formData.difficulty)) {
      newErrors.difficulty = "Difficulty is required";
    }
    if (!formData.about.trim()) newErrors.about = "About is required";
    if (formData.price <= 0 || isNaN(formData.price)) newErrors.price = "Price must be greater than 0";
    if (!croppedImage) newErrors.thumbnail = "Thumbnail is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.error("Form validation errors:", newErrors);
      toast.error("Please correct the following errors: " + Object.values(newErrors).join(", "));
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("Submitting form:", formData);
    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("tagline", formData.tagline);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("difficulty", formData.difficulty);
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append("about", formData.about);
      if (croppedImage) {
        formDataToSend.append("thumbnail", croppedImage, "thumbnail.jpg");
      }

      console.log("Sending form data to API", Object.fromEntries(formDataToSend));
      await courseService.createCourse(formDataToSend);
      toast.success("Course created successfully");
      navigate("/tutor/courses");
    } catch (error) {
      if(error instanceof AxiosError){
        console.error("Error creating course:", error);
        toast.error(error.message || "Failed to create course");
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header />

          {/* Main Content Area */}
          <main className={`flex-1 p-8 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'} transition-all duration-300`}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => navigate("/tutor/courses")}
                style={{ marginBottom: 24 }}
              >
                Back to Courses
              </Button>

              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#1d39c4" }}>Create New Course</h1>
                <p style={{ color: "#595959" }}>Fill in the details to create your new course</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
                <Card>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>Basic information about your course</CardDescription>
                  <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ padding: 24 }}>
                    <Form.Item label="Course Title" validateStatus={errors.title ? "error" : ""} help={errors.title}>
                      <Input
                        name="title"
                        placeholder="e.g., Complete Web Development Bootcamp"
                        value={formData.title}
                        onChange={handleInputChange}
                      />
                    </Form.Item>

                    <Form.Item label="Tagline" validateStatus={errors.tagline ? "error" : ""} help={errors.tagline}>
                      <Input
                        name="tagline"
                        placeholder="e.g., Learn to build modern websites from scratch"
                        value={formData.tagline}
                        onChange={handleInputChange}
                      />
                    </Form.Item>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                      <Form.Item label="Category" validateStatus={errors.category ? "error" : ""} help={errors.category}>
                        <Select
                          value={formData.category}
                          onChange={(value) => handleSelectChange("category", value)}
                          placeholder="Select category"
                        >
                          {categories.map((category) => (
                            <Select.Option key={category} value={category}>
                              {category}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="Difficulty Level"
                        validateStatus={errors.difficulty ? "error" : ""}
                        help={errors.difficulty}
                      >
                        <Select
                          value={formData.difficulty}
                          onChange={(value) => handleSelectChange("difficulty", value)}
                          placeholder="Select difficulty"
                        >
                          <Select.Option value="Beginner">Beginner</Select.Option>
                          <Select.Option value="Intermediate">Intermediate</Select.Option>
                          <Select.Option value="Advanced">Advanced</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <Form.Item label="Price (USD)" validateStatus={errors.price ? "error" : ""} help={errors.price}>
                      <Space>
                        <Slider
                          style={{ width: 200 }}
                          min={0}
                          max={500}
                          step={0.01}
                          value={formData.price}
                          onChange={handlePriceChange}
                        />
                        <Input
                          type="number"
                          value={formData.price}
                          onChange={(e) => handlePriceChange(Number.parseFloat(e.target.value || "0"))}
                          style={{ width: 100 }}
                          min={0}
                          step={0.01}
                        />
                      </Space>
                    </Form.Item>

                    <Form.Item label="About This Course" validateStatus={errors.about ? "error" : ""} help={errors.about}>
                      <Input.TextArea
                        name="about"
                        placeholder="Describe what students will learn in this course..."
                        rows={6}
                        value={formData.about}
                        onChange={handleInputChange}
                      />
                    </Form.Item>

                    <Form.Item label="Course Thumbnail" validateStatus={errors.thumbnail ? "error" : ""} help={errors.thumbnail}>
                      {!showCropper && !croppedImage && (
                        <Upload beforeUpload={handleImageUpload} accept="image/*" showUploadList={false}>
                          <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
                          <p style={{ color: "#595959", fontSize: 12, marginTop: 8 }}>
                            Recommended size: 1280x720px (16:9 ratio)
                          </p>
                        </Upload>
                      )}

                      {showCropper && image && (
                        <div style={{ border: "1px solid #f0f0f0", padding: 16, borderRadius: 8 }}>
                          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Crop Thumbnail</h3>
                          <div style={{ maxHeight: 400, overflow: "auto" }}>
                            <ReactCrop
                              crop={crop}
                              onChange={(c) => setCrop(c)}
                              onComplete={(c) => setCompletedCrop(c)}
                              aspect={16 / 9}
                            >
                              <img ref={imgRef} src={image} alt="Upload preview" style={{ maxWidth: "100%" }} />
                            </ReactCrop>
                          </div>
                          <Space style={{ marginTop: 16, justifyContent: "flex-end", width: "100%" }}>
                            <Button onClick={() => setShowCropper(false)}>Cancel</Button>
                            <Button type="primary" onClick={handleCropComplete}>
                              Apply Crop
                            </Button>
                          </Space>
                        </div>
                      )}

                      {croppedImage && !showCropper && (
                        <div style={{ position: "relative", border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" }}>
                          <img
                            src={URL.createObjectURL(croppedImage)}
                            alt="Cropped thumbnail"
                            style={{ maxHeight: 300, width: "100%", objectFit: "cover" }}
                          />
                          <Button
                            type="text"
                            icon={<CloseCircleOutlined />}
                            onClick={() => {
                              setCroppedImage(null);
                              setImage(null);
                            }}
                            style={{ position: "absolute", top: 8, right: 8 }}
                          />
                        </div>
                      )}
                    </Form.Item>

                    <Form.Item>
                      <Space>
                        <Button onClick={() => navigate("/tutor/courses")}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={isSubmitting}>
                          Create Course
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>

                <Card style={{ position: "sticky", top: 32 }}>
                  <CardTitle>Tips</CardTitle>
                  <CardDescription>How to create an effective course</CardDescription>
                  <div style={{ padding: 24 }}>
                    <Space direction="vertical" size="middle">
                      <div>
                        <h4 style={{ fontWeight: "bold", color: "#1d39c4" }}>Clear Title</h4>
                        <p style={{ color: "#595959", fontSize: 14 }}>
                          Use a descriptive title that clearly communicates what students will learn.
                        </p>
                      </div>
                      <div>
                        <h4 style={{ fontWeight: "bold", color: "#1d39c4" }}>Compelling Tagline</h4>
                        <p style={{ color: "#595959", fontSize: 14 }}>
                          Write a short, engaging tagline that highlights the key benefit of your course.
                        </p>
                      </div>
                      <div>
                        <h4 style={{ fontWeight: "bold", color: "#1d39c4" }}>Detailed Description</h4>
                        <p style={{ color: "#595959", fontSize: 14 }}>
                          Provide a comprehensive description of what students will learn and why it matters.
                        </p>
                      </div>
                      <div>
                        <h4 style={{ fontWeight: "bold", color: "#1d39c4" }}>Eye-catching Thumbnail</h4>
                        <p style={{ color: "#595959", fontSize: 14 }}>
                          Use a high-quality image that represents your course content and attracts attention.
                        </p>
                      </div>
                    </Space>
                  </div>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AddCourse;