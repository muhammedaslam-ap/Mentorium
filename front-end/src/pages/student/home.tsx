"use client";

// import { useState, useEffect } from "react";
import { Link,  } from "react-router-dom";
import {
  BookOpen,
  Code,
  Database,
  Globe,
  Server,
  // Tag,
  // Star,
  Laptop,
  Clock,
  Users,
  Award,
  Zap,
  ArrowRight,
  // Heart,
  // TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Button, Card, Badge, Avatar, Rate, Row, Col, Divider, Typography, Space } from "antd";
// import { courseService } from "@/services/courseService/courseService";
// import { wishlistService } from "@/services/wishlistService/wishlistService";
// import { toast } from "sonner";
import Header from "./components/header";

const { Title, Paragraph, Text } = Typography;

// Define interfaces for data structures and props
// interface Course {
//   _id: string;
//   title: string;
//   tagline: string;
//   thumbnail?: string;
//   difficulty: string;
//   category: string;
//   price: number;
//   about: string;
// }

interface Category {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
}

interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

// Category Card Component
const CategoryCard: React.FC<Category> = ({ icon: Icon, title, count }) => (
  <Card
    hoverable
    className="h-full"
    style={{ border: "1px solid #e8e8e8" }}
  >
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-blue-500" />
      </div>
      <Title level={4} className="mb-1">{title}</Title>
      <Text type="secondary">{count} courses</Text>
    </div>
  </Card>
);

// Testimonial Card Component
const TestimonialCard: React.FC<Testimonial> = ({ name, role, image, quote, rating }) => (
  <Card
    hoverable
    className="h-full"
    style={{ border: "1px solid #e8e8e8" }}
  >
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <Avatar
          src={image}
          size={48}
          style={{ border: "2px solid rgba(24, 144, 255, 0.2)" }}
        >
          {name.charAt(0)}
        </Avatar>
        <div>
          <Title level={5}>{name}</Title>
          <Text type="secondary">{role}</Text>
        </div>
      </div>
      <Rate disabled defaultValue={rating} className="mb-4" />
      <Text italic>“{quote}”</Text>
    </div>
  </Card>
);

// Feature Card Component
const FeatureCard: React.FC<Feature> = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md">
    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
      <Icon className="h-7 w-7 text-blue-500" />
    </div>
    <Title level={4} className="mb-2">{title}</Title>
    <Text type="secondary">{description}</Text>
  </div>
);

// Main UserHomePage Component
export function UserHomePage() {
  // const [courses, setCourses] = useState<Course[]>([]);
  // const [wishlist, setWishlist] = useState<string[]>([]);
  // const navigate = useNavigate();

  // useEffect(() => {
  //   fetchCourses();
  //   // fetchWishlistCourses();
  // }, []);

  // const fetchCourses = async () => {
  //   try {
  //     const response: { data: { courses: { courses: Course[] } } } = await courseService.getAllCourse("");
  //     setCourses(response.data.courses.courses || []);
  //     console.log("Courses in Home", response.data.courses);
  //   } catch (error: unknown) {
  //     console.error("Failed to fetch courses:", error);
  //   }
  // };

  // const fetchWishlistCourses = async () => {
  //   try {
  //     const response: { data: { courses: Course[] } } = await wishlistService.getWishlist({});
  //     const wishlistData = response.data.courses || [];
  //     const wishlistIds = wishlistData.map((course) => course._id);
  //     setWishlist(wishlistIds);
  //   } catch (error: unknown) {
  //     console.error("Failed to fetch wishlist courses:", error);
  //     toast.error("Failed to load wishlist");
  //   }
  // };

  // const handleWishlistToggle = async (courseId: string) => {
  //   const isWishlisted = wishlist.includes(courseId);
  //   try {
  //     if (isWishlisted) {
  //       await wishlistService.removeFromWishlist(courseId);
  //       setWishlist((prev) => prev.filter((id) => id !== courseId));
  //       toast.success("Course removed from wishlist");
  //     } else {
  //       const response: { data: { message: string } } = await wishlistService.addToWishlist(courseId);
  //       setWishlist((prev) => [...prev, courseId]);
  //       toast.success(response.data.message);
  //     }
  //   } catch (error: any) {
  //     console.error("Failed to toggle wishlist:", error);
  //     toast.error(error.response?.data?.message || "Failed to update wishlist");
  //   }
  // };

  // const getDifficultyColor = (difficulty: string): { color: string; backgroundColor: string } => {
  //   switch (difficulty) {
  //     case "Beginner":
  //       return { color: "#52c41a", backgroundColor: "#f0f9eb" };
  //     case "Intermediate":
  //       return { color: "#fa8c16", backgroundColor: "#fef0e7" };
  //     case "Advanced":
  //       return { color: "#f5222d", backgroundColor: "#fef0f0" };
  //     default:
  //       return { color: "#595959", backgroundColor: "#f5f5f5" };
  //   }
  // };

  // const handleEnroll = (courseId: string) => {
  //   navigate(`/courses/${courseId}`);
  // };

  const categories: Category[] = [
    { icon: Code, title: "Web Development", count: 120 },
    { icon: Database, title: "Data Science", count: 85 },
    { icon: Server, title: "Cloud Computing", count: 64 },
    { icon: Globe, title: "Mobile Development", count: 72 },
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer",
      image: "/placeholder.svg?height=48&width=48&text=SJ",
      quote: "The courses on EduShare helped me transition from a beginner to a professional developer in just 6 months.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      image: "/placeholder.svg?height=48&width=48&text=MC",
      quote: "The data science curriculum is comprehensive and up-to-date with industry standards. Highly recommended!",
      rating: 4,
    },
    {
      name: "Jessica Williams",
      role: "UX Designer",
      image: "/placeholder.svg?height=48&width=48&text=JW",
      quote: "I've taken courses on multiple platforms, but EduShare offers the best balance of theory and practical projects.",
      rating: 5,
    },
  ];

  const features: Feature[] = [
    {
      icon: Laptop,
      title: "Learn Anywhere",
      description: "Access courses on any device, anytime, anywhere",
    },
    {
      icon: Award,
      title: "Earn Certificates",
      description: "Get recognized for your achievements with shareable certificates",
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals with real-world experience",
    },
    {
      icon: Clock,
      title: "Self-Paced Learning",
      description: "Study at your own pace with lifetime access to courses",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 md:py-24 lg:py-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-gray-200/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="container px-4 md:px-6 lg:px-8 mx-auto relative">
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} lg={12}>
                <Space direction="vertical" size="large">
                  <Badge
                    count={<><Zap className="mr-1 h-3.5 w-3.5" /> Over 500+ courses available</>}
                    style={{ backgroundColor: '#1890ff', color: '#fff' }}
                  />
                  <Title level={1} style={{ fontSize: '3rem', lineHeight: '1.2' }}>
                    Learn the skills you need to <span style={{ color: '#1890ff' }}>succeed</span>
                  </Title>
                  <Paragraph style={{ maxWidth: 600, color: '#595959', fontSize: '1.1rem' }}>
                    Access high-quality courses taught by industry experts. Start your learning journey today and transform your career.
                  </Paragraph>
                  <Space>
                    <Button type="primary" size="large">
                      <Link to="/courses">Browse Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                    <Button size="large">
                      <Link to="/paths">View Learning Paths</Link>
                    </Button>
                  </Space>
                  <Space>
                    <Space><CheckCircle className="h-4 w-4 text-blue-500" /> Expert instructors</Space>
                    <Space><CheckCircle className="h-4 w-4 text-blue-500" /> Flexible learning</Space>
                    <Space><CheckCircle className="h-4 w-4 text-blue-500" /> Certificates</Space>
                  </Space>
                </Space>
              </Col>
              <Col xs={0} lg={12}>
                <div className="relative">
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-100 rounded-full blur-3xl"></div>
                  <Card style={{ border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                    <video
                      src="../../../public/CN4By7T88Hg2dj5lqo.mp4"
                      className="w-full h-auto"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <Title level={3} style={{ color: '#fff', marginBottom: 8 }}>Start Learning Today</Title>
                      <Text style={{ color: '#fff' }}>Join thousands of students worldwide</Text>
                    </div>
                  </Card>
                  <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-blue-50 rounded-full blur-2xl"></div>
                </div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 bg-white border-y border-gray-200">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <Row gutter={[16, 16]} justify="center">
              <Col xs={12} md={6} className="text-center">
                <Title level={2} style={{ color: '#1890ff' }}>500+</Title>
                <Text>Courses</Text>
              </Col>
              <Col xs={12} md={6} className="text-center">
                <Title level={2} style={{ color: '#1890ff' }}>50k+</Title>
                <Text>Students</Text>
              </Col>
              <Col xs={12} md={6} className="text-center">
                <Title level={2} style={{ color: '#1890ff' }}>100+</Title>
                <Text>Instructors</Text>
              </Col>
              <Col xs={12} md={6} className="text-center">
                <Title level={2} style={{ color: '#1890ff' }}>95%</Title>
                <Text>Satisfaction</Text>
              </Col>
            </Row>
          </div>
        </section>

        {/* Categories Section */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="text-center mb-12">
              <Badge count="Explore by Category" style={{ backgroundColor: '#fff', color: '#595959', border: '1px solid #d9d9d9' }} />
              <Title level={2} style={{ marginTop: 16 }}>Find Your Perfect Course</Title>
              <Paragraph style={{ maxWidth: 700, margin: 'auto', color: '#595959' }}>
                Browse through our diverse range of courses categorized by field of study
              </Paragraph>
            </div>
            <Row gutter={[16, 16]}>
              {categories.map((category, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <CategoryCard {...category} />
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="text-center mb-12">
              <Badge count="Why nChoose Us" style={{ backgroundColor: '#fff', color: '#595959', border: '1px solid #d9d9d9' }} />
              <Title level={2} style={{ marginTop: 16 }}>Learning Made Simple</Title>
              <Paragraph style={{ maxWidth: 700, margin: 'auto', color: '#595959' }}>
                Our platform is designed to provide you with the best learning experience
              </Paragraph>
            </div>
            <Row gutter={[16, 16]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <FeatureCard {...feature} />
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* All Courses Section */}
       

        {/* Testimonials Section */}
        <section className="w-full py-16 bg-white">
          <div className="container px-4 md:px-6 lg:px-8 mx-auto">
            <div className="text-center mb-12">
              <Badge count="Student Success Stories" style={{ backgroundColor: '#fff', color: '#595959', border: '1px solid #d9d9d9' }} />
              <Title level={2} style={{ marginTop: 16 }}>What Our Students Say</Title>
              <Paragraph style={{ maxWidth: 700, margin: 'auto', color: '#595959' }}>
                Hear from our students who have transformed their careers through our platform
              </Paragraph>
            </div>
            <Row gutter={[16, 16]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} md={8} key={index}>
                  <TestimonialCard {...testimonial} />
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Trending Courses Section */}
       
        {/* CTA Section */}
        <section className="w-full bg-blue-600 text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_80%)]"></div>
          <div className="container px-4 md:px-6 lg:px-8 mx-auto relative">
            <div className="max-w-2xl mx-auto text-center">
              <Title level={2} style={{ color: '#fff', marginBottom: 24 }}>
                Ready to Start Your Learning Journey?
              </Title>
              <Paragraph style={{ maxWidth: 700, margin: 'auto', color: '#fff', fontSize: '1.1rem', marginBottom: 32 }}>
                Join thousands of students already learning on EduShare and transform your career today.
              </Paragraph>
              <Space>
                <Button type="default" size="large" style={{ background: '#fff', color: '#1890ff' }}>
                  <Link to="/auth">Sign Up for Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="large" ghost>
                  <Link to="/courses">Explore Courses</Link>
                </Button>
              </Space>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white">
        <div className="container px-4 md:px-6 lg:px-8 mx-auto py-12">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Space>
                <BookOpen className="h-6 w-6 text-blue-500" />
                <Title level={3} style={{ color: '#1890ff' }}>EduShare</Title>
              </Space>
              <Paragraph style={{ maxWidth: 300, color: '#595959', marginTop: 16 }}>
                Empowering learners worldwide with high-quality tech education. Our mission is to make education accessible to everyone.
              </Paragraph>
              <Space className="mt-6">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform) => (
                  <Button
                    key={platform}
                    shape="circle"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {platform === 'facebook' && <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>}
                        {platform === 'twitter' && <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>}
                        {platform === 'instagram' && (
                          <>
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                          </>
                        )}
                        {platform === 'linkedin' && (
                          <>
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect width="4" height="12" x="2" y="9"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                          </>
                        )}
                      </svg>
                    }
                  />
                ))}
              </Space>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Title level={4}>Courses</Title>
              <ul className="space-y-3">
                {['Web Development', 'Data Science', 'Cloud Computing', 'Mobile Development'].map((item) => (
                  <li key={item}>
                    <Link
                      to="/courses"
                      style={{ color: '#595959' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.target as HTMLAnchorElement).style.color = '#1890ff'}
                      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.target as HTMLAnchorElement).style.color = '#595959'}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Title level={4}>Company</Title>
              <ul className="space-y-3">
                {['About Us', 'Careers', 'Contact', 'Blog'].map((item) => (
                  <li key={item}>
                    <Link
                      to={item === 'About Us' ? '/about' : '#'}
                      style={{ color: '#595959' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.target as HTMLAnchorElement).style.color = '#1890ff'}
                      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.target as HTMLAnchorElement).style.color = '#595959'}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Title level={4}>Legal</Title>
              <ul className="space-y-3">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((item) => (
                  <li key={item}>
                    <Link
                      to="#"
                      style={{ color: '#595959' }}
                      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.target as HTMLAnchorElement).style.color = '#1890ff'}
                      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.target as HTMLAnchorElement).style.color = '#595959'}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </Col>
          </Row>
          <Divider />
          <Row justify="space-between" align="middle">
            <Col>
              <Text style={{ color: '#595959' }}>© 2025 EduShare. All rights reserved.</Text>
            </Col>
            <Col>
              <Space>
                <Link
                  to="#"
                  style={{ color: '#595959' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.target as HTMLAnchorElement).style.color = '#1890ff'}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.target as HTMLAnchorElement).style.color = '#595959'}
                >
                  Help Center
                </Link>
                <Link
                  to="#"
                  style={{ color: '#595959' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.target as HTMLAnchorElement).style.color = '#1890ff'}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.target as HTMLAnchorElement).style.color = '#595959'}
                >
                  Accessibility
                </Link>
              </Space>
            </Col>
          </Row>
        </div>
      </footer>
    </div>
  );
}