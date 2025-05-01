import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  DeleteOutlined,
  EditOutlined,
  BookOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Button, Input, Space, Dropdown, Menu, Tag, Spin, Modal, Pagination } from 'antd';
import { Card, CardContent } from '@/components/ui/card';
import { courseService } from '@/services/courseServices/courseService';
import Sidebar from '../components/sideBar';
import Header from '../components/header';
import { AxiosError } from 'axios';
import debounce from 'lodash.debounce';

interface Course {
  _id: string;
  title: string;
  tagline: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  about: string;
  thumbnail: string;
  enrollments?: number;
  createdAt?: string;
}

interface SortOption {
  key: 'createdAt' | 'price' | 'enrollments';
  order: 'asc' | 'desc';
}

const TutorCourses: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>({ key: 'createdAt', order: 'desc' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const coursesPerPage = 6;

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await courseService.getSpecificTutorCourse(
        currentPage,
        coursesPerPage,
        searchQuery,
 
      );
      console.log('fetchCourses Response:', response);
      if (response && response.data) {
        setCourses(response.data.courses || []);
        setTotalCourses(response.data.totalCourses || 0);
        setTotalPages(Math.ceil((response.data.totalCourses || 0) / coursesPerPage));
      } else {
        toast.error('No course data returned');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Failed to load courses');
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced search handler
  const debouncedFetchCourses = useCallback(
    debounce(() => {
      setCurrentPage(1);
      fetchCourses();
    }, 300),
    [searchQuery, sortOption]
  );

  useEffect(() => {
    fetchCourses();
  }, [currentPage, sortOption]);

  useEffect(() => {
    debouncedFetchCourses();
    return () => debouncedFetchCourses.cancel();
  }, [searchQuery, debouncedFetchCourses]);

  const showDeleteModal = (courseId: string) => {
    console.log('Delete button clicked for course:', courseId);
    setCourseToDelete(courseId);
    setIsModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    try {
      setDeleting(true);
      await courseService.deleteCourse(courseToDelete);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error deleting course:', error);
        toast.error(error.response?.data?.message || 'Failed to delete course');
      }
    } finally {
      setDeleting(false);
      setIsModalVisible(false);
      setCourseToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    console.log('Deletion cancelled');
    setIsModalVisible(false);
    setCourseToDelete(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCourses();
  };

  const handleSortSelect = ({ key }: { key: string }) => {
    let newSortOption: SortOption;
    switch (key) {
      case 'newest':
        newSortOption = { key: 'createdAt', order: 'desc' };
        break;
      case 'oldest':
        newSortOption = { key: 'createdAt', order: 'asc' };
        break;
      case 'price-low':
        newSortOption = { key: 'price', order: 'asc' };
        break;
      case 'price-high':
        newSortOption = { key: 'price', order: 'desc' };
        break;
      case 'enrollments':
        newSortOption = { key: 'enrollments', order: 'desc' };
        break;
      default:
        newSortOption = { key: 'createdAt', order: 'desc' };
    }
    setSortOption(newSortOption);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'green';
      case 'Intermediate':
        return 'blue';
      case 'Advanced':
        return 'purple';
      default:
        return 'default';
    }
  };

  const filterMenu = (
    <Menu>
      <Menu.Item key="all">All Courses</Menu.Item>
      <Menu.Item key="published">Published</Menu.Item>
      <Menu.Item key="draft">Draft</Menu.Item>
    </Menu>
  );

  const sortMenu = (
    <Menu onClick={handleSortSelect}>
      <Menu.Item key="newest" className={sortOption.key === 'createdAt' && sortOption.order === 'desc' ? 'ant-menu-item-selected' : ''}>
        Newest First
      </Menu.Item>
      <Menu.Item key="oldest" className={sortOption.key === 'createdAt' && sortOption.order === 'asc' ? 'ant-menu-item-selected' : ''}>
        Oldest First
      </Menu.Item>
      <Menu.Item key="price-low" className={sortOption.key === 'price' && sortOption.order === 'asc' ? 'ant-menu-item-selected' : ''}>
        Price: Low to High
      </Menu.Item>
      <Menu.Item key="price-high" className={sortOption.key === 'price' && sortOption.order === 'desc' ? 'ant-menu-item-selected' : ''}>
        Price: High to Low
      </Menu.Item>
      <Menu.Item key="enrollments" className={sortOption.key === 'enrollments' && sortOption.order === 'desc' ? 'ant-menu-item-selected' : ''}>
        Enrollments: High to Low
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <main className={`flex-1 p-8 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'} transition-all duration-300`}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#1d39c4' }}>My Courses</h1>
                <p style={{ color: '#595959' }}>Manage your course offerings</p>
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tutor/courses/add')}>
                Add New Course
              </Button>
            </div>

            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', maxWidth: 400, alignItems: 'center', gap: 8 }}>
                <Input
                  placeholder="Search by title, tagline, or category..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  prefix={<SearchOutlined />}
                  allowClear
                />
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  Search
                </Button>
              </form>
   
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} style={{ border: '1px solid #f0f0f0' }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 32, border: '1px solid #f0f0f0' }}>
                <BookOutlined style={{ fontSize: 64, color: '#1d39c4', marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, fontWeight: 'bold', color: '#1d39c4' }}>No courses found</h3>
                <p style={{ color: '#595959', marginBottom: 24 }}>
                  {searchQuery ? 'No courses match your search.' : "You haven't created any courses yet."}
                </p>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tutor/courses/add')}>
                  Create Your First Course
                </Button>
              </Card>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                  {courses.map((course) => (
                    <Card key={course._id} style={{ border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                      <div style={{ height: 192, overflow: 'hidden', background: '#f0f2f5' }}>
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={() => console.error('Failed to load thumbnail:', course.thumbnail)}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <BookOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                          </div>
                        )}
                      </div>
                      <CardContent style={{ padding: 16 }}>
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: '#1d39c4',
                            marginBottom: 8,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {course.title}
                        </h3>
                        <p
                          style={{
                            color: '#595959',
                            fontSize: 14,
                            marginBottom: 16,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {course.tagline}
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                          }}
                        >
                          <Tag color={getDifficultyColor(course.difficulty)}>{course.difficulty}</Tag>
                          <span style={{ fontWeight: 'bold', color: '#1d39c4' }}>${course.price.toFixed(2)}</span>
                        </div>
                        <p style={{ color: '#595959', fontSize: 12 }}>
                          {course.enrollments || 0} {course.enrollments === 1 ? 'student' : 'students'} enrolled
                        </p>
                      </CardContent>
                      <CardContent
                        style={{
                          padding: 16,
                          borderTop: '1px solid #f0f0f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => showDeleteModal(course._id)}
                        >
                          Delete
                        </Button>
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => navigate(`/tutor/courses/edit/${course._id}`)}
                        >
                          Edit
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div style={{ marginTop: 32, textAlign: 'center' }}>
                    <Pagination
                      current={currentPage}
                      total={totalCourses}
                      pageSize={coursesPerPage}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                    />
                  </div>
                )}
              </>
            )}

            <Modal
              title="Confirm Delete"
              open={isModalVisible}
              onOk={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
              confirmLoading={deleting}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <p>Are you sure you want to delete this course?</p>
            </Modal>
          </div>
        </main>
      </div>
    </div>
  );
};

class TutorCoursesErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <h1 style={{ fontSize: 24, color: '#ff4d4f' }}>Something went wrong</h1>
          <p style={{ color: '#595959' }}>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TutorCoursesPage() {
  return (
    <TutorCoursesErrorBoundary>
      <TutorCourses />
    </TutorCoursesErrorBoundary>
  );
}