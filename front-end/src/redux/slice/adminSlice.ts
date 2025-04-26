// src/store/slice/adminSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminState {
  adminDatas: AdminData | null;
}

const initialState: AdminState = {
  adminDatas: (() => {
    const storedData = localStorage.getItem('adminDatas');
    if (storedData) {
      try {
        return JSON.parse(storedData) as AdminData;
      } catch (error) {
        console.error('Failed to parse adminDatas from localStorage:', error);
        return null;
      }
    }
    return null;
  })(),
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    addAdmin: (state, action: PayloadAction<AdminData>) => {
      state.adminDatas = action.payload;
      localStorage.setItem('adminDatas', JSON.stringify(action.payload));
    },
    logoutAdmin: (state) => {
      state.adminDatas = null;
      localStorage.removeItem('adminDatas');
    },

    removeAdmin:(state)=>{
        state.adminDatas = null;
        localStorage.removeItem('adminDatas');
    }
  },
});

export const {removeAdmin, addAdmin, logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
