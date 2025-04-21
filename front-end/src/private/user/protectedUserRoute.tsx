import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedUserRouteProps {
  children: React.ReactNode;
}

export function ProtectedUserRoute({ children }: ProtectedUserRouteProps) {
  const user = useSelector((state: RootState) => state.user.userDatas);

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
}
