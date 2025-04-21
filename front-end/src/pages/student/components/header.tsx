"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeUser } from "../../../redux/slice/userSlice";
import { toast } from "sonner";
import {
  LogoutOutlined,
  MenuOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {BookOpen,Heart} from "lucide-react"
import { Input, Button, Dropdown, Menu, Avatar, Space, Drawer } from "antd";
import { profileService } from "@/services/userServices/profileService";
import { userAuthService } from "@/services/userServices/authServices";
import { Link } from "react-router-dom";

// Define interfaces for data structures
interface User {
  name: string;
  email: string;
}

// Header Component
const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserMe = async () => {
      try {
        const response: { data: { users: User } } = await profileService.userDetails();
        setUser({
          name: response.data.users.name,
          email: response.data.users.email,
        });
      } catch (error: unknown) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUserMe();
  }, []);

  const handleLogout = async () => {
    try {
      const response: { data: { message: string } } = await userAuthService.logoutUser();
      toast.success(response.data.message);
      localStorage.removeItem("userData");
      dispatch(removeUser());
      navigate("/auth");
    } catch (error: unknown) {
      console.error("Logout failed:", error);
      toast.error("Failed to sign out");
    }
  };

  // Dropdown Menu for User Profile
  const menu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate("/profile")}>
        <Space>
          <UserOutlined />
          Profile
        </Space>
      </Menu.Item>
      <Menu.Item key="wishlist" onClick={() => navigate("/wishlist")}>
        <Space>
          <Heart />
          Wishlist
        </Space>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        <Space>
          <LogoutOutlined />
          Sign out
        </Space>
      </Menu.Item>
    </Menu>
  );

  // Mobile Menu Items
  const mobileMenuItems = (
    <div className="mobile-menu-content p-4">
      <Input
        placeholder="Search courses..."
        prefix={<SearchOutlined />}
        style={{ marginBottom: 16, borderRadius: "8px" }}
      />
      <Menu mode="vertical" style={{ border: "none" }}>
        <Menu.Item key="home">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="courses">
          <Link to="/courses">Courses</Link>
        </Menu.Item>
        <Menu.Item key="paths">
          <Link to="/paths">Learning Paths</Link>
        </Menu.Item>
        <Menu.Item key="community">
          <Link to="/community">Community</Link>
        </Menu.Item>
        <Menu.Item key="about">
          <Link to="/about">About</Link>
        </Menu.Item>
      </Menu>
      <Space direction="vertical" style={{ width: "100%", marginTop: 16 }}>
        <Button block>
          <Link to="/auth">Log in</Link>
        </Button>
        <Button type="primary" block style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}>
          <Link to="/auth">Sign up</Link>
        </Button>
      </Space>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Space>
          <BookOpen style={{ fontSize: 24, color: "#1890ff" }} />
          <span className="text-xl font-bold text-blue-500">EduShare</span>
        </Space>

        {/* Desktop Navigation */}
        <Menu
          mode="horizontal"
          className="hidden md:flex md:gap-6 bg-transparent border-0"
          style={{ lineHeight: "64px" }}
        >
          <Menu.Item key="home">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="courses">
            <Link to="/courses">Courses</Link>
          </Menu.Item>
          <Menu.Item key="paths">
            <Link to="/paths">Learning Paths</Link>
          </Menu.Item>
          <Menu.Item key="community">
            <Link to="/community">Community</Link>
          </Menu.Item>
          <Menu.Item key="about">
            <Link to="/about">About</Link>
          </Menu.Item>
        </Menu>

        {/* Right Section */}
        <Space size="middle">
          <Input
            placeholder="Search courses..."
            prefix={<SearchOutlined />}
            className="hidden md:block w-[200px] md:w-[250px] lg:w-[300px]"
            style={{ borderRadius: "8px" }}
          />

          {user !== null ? (
            <Dropdown overlay={menu} trigger={["click"]}>
              <Space className="cursor-pointer">
                <Avatar
                  icon={<UserOutlined />}
                  src="/placeholder.svg?height=32&width=32&text=U"
                  style={{ border: "2px solid #1890ff" }}
                />
                <div className="hidden md:flex flex-col items-start">
                  <span className="font-semibold text-blue-600">{user.name}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button type="text">
                <Link to="/auth">Log in</Link>
              </Button>
              <Button type="primary" style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}>
                <Link to="/auth">Sign up</Link>
              </Button>
            </Space>
          )}

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          />
        </Space>
      </div>

      {/* Mobile Menu Drawer */}
      <Drawer
        title={
          <Space>
            <BookOpen style={{ fontSize: 24, color: "#1890ff" }} />
            <span className="text-xl font-bold text-blue-500">EduShare</span>
          </Space>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width="80%"
        bodyStyle={{ padding: 0 }}
      >
        {mobileMenuItems}
      </Drawer>
    </header>
  );
};

export default Header;