import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slice/userSlice';
import adminSlice from './slice/adminSlice';
import tutorSlice from './slice/tutorSlice'

export const store = configureStore({
  reducer: {
    user: userSlice,
    admin: adminSlice,
    tutor:tutorSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
