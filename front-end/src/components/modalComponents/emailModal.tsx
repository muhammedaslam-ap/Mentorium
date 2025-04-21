"use client";

import React, { useState } from "react";
import { Modal, Button, Input, Typography, Space } from "antd";
import { Check, X } from "lucide-react";

const { Title, Text } = Typography;

interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailVerified: (email: string) => void;
}

const EmailModal: React.FC<EmailModalProps> = ({
  open,
  onOpenChange,
  onEmailVerified,
}) => {
  const [email, setEmail] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setIsValid(null);
  };

  const handleVerify = () => {
    const valid = validateEmail(email);
    setIsValid(valid);

    if (valid) {
      setTimeout(() => {
        onEmailVerified(email);
        setEmail("");
        onOpenChange(false);
      }, 1000);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      centered
      width={425}
    >
      <div className="p-4">
        <Title level={4}>Verify Email</Title>
        <Text type="secondary">
          Please enter your email address to continue.
        </Text>

        <Space direction="vertical" size="large" style={{ width: "100%", marginTop: 24 }}>
          <div>
            <Text>Email</Text>
            <div style={{ position: "relative" }}>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                style={{
                  marginTop: 8,
                  paddingRight: isValid !== null ? 40 : 12,
                  borderColor: isValid === false ? "#ff4d4f" : undefined,
                }}
              />
              {isValid === true && (
                <div
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#52c41a",
                  }}
                >
                  <Check style={{ width: 20, height: 20 }} />
                </div>
              )}
              {isValid === false && (
                <div
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#ff4d4f",
                  }}
                >
                  <X style={{ width: 20, height: 20 }} />
                </div>
              )}
            </div>
            {isValid === false && (
              <Text type="danger" style={{ fontSize: 12, marginTop: 8 }}>
                Please enter a valid email address
              </Text>
            )}
          </div>
          <Button
            type="primary"
            onClick={handleVerify}
            disabled={!email}
            style={{ width: "100%" }}
          >
            Verify
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default EmailModal;