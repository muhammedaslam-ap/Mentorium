"use client";

import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Typography, Space } from "antd";
import { toast } from "sonner";
import { sendOtp } from "@/services/otpServices/otpServices";
import { RegisterFormData } from "@/validation";

const { Title, Text } = Typography;

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  role?: "admin" | "user" | "tutor";
  data: RegisterFormData;
}

const OTPModal: React.FC<OTPModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  role = "user",
  data,
}) => {
  const [otp, setOtp] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Role-specific styling
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#ff4d4f"; // Red
      case "tutor":
        return "#722ed1"; // Purple
      case "user":
      default:
        return "#1890ff"; // Blue (Ant Design primary)
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isOpen) return;

    // Reset states
    setOtp("");
    setTimeLeft(60);
    setCanResend(false);

    // Start timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleVerify = () => {
    if (otp.length === 6) {
      onVerify(otp);
    } else {
      toast.error("Please enter a valid 6-digit OTP");
    }
  };

  const handleResendOTP = async () => {
    try {
      // Reset timer and resend OTP
      setTimeLeft(60);
      setCanResend(false);
      const res = await sendOtp(data);
      toast.success(res.message);

      // Start timer again
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast.error("Failed to resend OTP");
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
    >
      <div className="p-4">
        <Title level={4}>Verify Your Email</Title>
        <Text type="secondary">
          We've sent a 6-digit verification code to your email address. Please
          enter it below to complete your registration.
        </Text>

        <Space direction="vertical" size="large" style={{ width: "100%", marginTop: 24 }}>
          {/* OTP Input */}
          <div>
            <Text>Enter verification code</Text>
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              style={{ marginTop: 8, textAlign: "center" }}
            />
          </div>

          {/* Timer and Buttons */}
          <Space direction="vertical" size="middle" style={{ width: "100%", textAlign: "center" }}>
            <Text>
              Time remaining: <span style={{ fontFamily: "monospace", fontWeight: 500 }}>{formatTime(timeLeft)}</span>
            </Text>
            <Button
              onClick={handleResendOTP}
              disabled={!canResend}
              style={{ width: "100%" }}
            >
              Resend Code
            </Button>
            <Button
              type="primary"
              onClick={handleVerify}
              disabled={otp.length !== 6}
              style={{ width: "100%", backgroundColor: getRoleColor(role), borderColor: getRoleColor(role) }}
            >
              Verify
            </Button>
          </Space>
        </Space>
      </div>
    </Modal>
  );
};

export default OTPModal;