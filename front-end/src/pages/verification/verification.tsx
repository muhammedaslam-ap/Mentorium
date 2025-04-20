import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './verification.css';

const OtpVerification: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the form data passed from the signup page
  const formData = location.state?.formData;

  const onFinish = async (values: { otp: string }) => {
    const { otp } = values;

    if (otp.length === 6 && /^\d+$/.test(otp)) {
      setLoading(true);
      try {
        // Step 1: Verify OTP with the backend
        await axios.post('http://localhost:3000/otp/verify', {
          email: formData.email,
          otp: otp,
        });

        // Step 2: OTP verified successfully, now send the full signup data
        await axios.post('http://localhost:3000/auth/signup', formData);

        message.success('Signup successful!');
        navigate('/login'); // Redirect to login page after successful signup

      } catch (error: any) {
        message.error(error.response?.data?.message || 'OTP verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      message.error('Invalid OTP. Please enter a 6-digit number.');
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2 className="otp-title">OTP Verification</h2>
        <p className="otp-subtitle">Enter the 6-digit OTP sent to your email</p>
        <Form
          form={form}
          name="otp_verification"
          onFinish={onFinish}
          layout="vertical"
          className="otp-form"
        >
          <Form.Item
            name="otp"
            rules={[
              { required: true, message: 'Please enter the OTP' },
              { len: 6, message: 'OTP must be 6 digits' },
              { pattern: /^\d+$/, message: 'OTP must be numeric' },
            ]}
          >
            <Input
              prefix={<LockOutlined />}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              size="large"
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numbers
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Verify OTP
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default OtpVerification;
