"use client";

import React from "react";
import { Card, Button, Typography } from "antd";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const { Title, Text } = Typography;

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "flex justify-center items-center min-h-screen p-4 bg-gray-50"
      )}
    >
      <Card
        className="w-full max-w-md shadow-lg"
        style={{ borderTop: "4px solid #1890ff" }}
      >
        <div className="text-center space-y-6 p-6">
          <Title level={1} style={{ fontSize: "3rem", color: "#ff4d4f" }}>
            404
          </Title>
          <Title level={3}>Page Not Found</Title>
          <Text type="secondary" style={{ fontSize: "1.1rem" }}>
            Sorry, we couldn’t find the page you’re looking for. It might have
            been moved or doesn’t exist.
          </Text>
          <Button
            type="primary"
            onClick={() => navigate(-1)}
            style={{ padding: "0 24px", height: 40 }}
            icon={<Home style={{ width: 20, height: 20, marginRight: 8 }} />}
          >
            Go Back Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;