import { RootState } from '@/redux/store';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {  useLocation, useNavigate } from 'react-router-dom';

interface ProtectedUserRouteProps {
  children: React.ReactNode;
}

export function ProtectedUserRoute({ children }: ProtectedUserRouteProps) {
  const user = useSelector((state: RootState) => state.user.userDatas);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null; 
  }

  return <>{children}</>;
}


export function ProtectedTutorRoute({ children }: ProtectedUserRouteProps) {
  const tutor = useSelector((state: RootState) => state?.tutor?.tutorDatas);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!tutor) {
      navigate('/auth', { replace: true });
    } else if (!tutor.isAccepted && location.pathname !== '/tutor/profile') {
      navigate('/tutor/profile', { replace: true });
    }
  }, [tutor, navigate, location.pathname]);

  if (!tutor) {
    return null;
  }

  if (!tutor.isAccepted && location.pathname !== '/tutor/profile') {
    return null;
  }

  return <>{children}</>;
}



export function ProtectedAdminRoute({ children }: ProtectedUserRouteProps) {
  const user = useSelector((state: RootState) => state.admin.adminDatas);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return <>{children}</>;
}