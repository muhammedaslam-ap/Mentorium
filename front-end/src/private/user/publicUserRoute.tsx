import { RootState } from '@/redux/store';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface PublicUserRouteProps {
  children: React.ReactNode;
}

export function PublicUserRoute({ children }: PublicUserRouteProps) {
  const userData = useSelector((state: RootState) => {
    return state?.user?.userDatas;
  });


  const tutorData = useSelector((state: RootState) => {
    return state?.tutor?.tutorDatas;
  });

  if (tutorData) {
    return <Navigate to={`/${tutorData.role}/home`} />;
  } else if (userData?.role === 'student') {
    return <Navigate to={'/'} />;
  }

  return children;
}
