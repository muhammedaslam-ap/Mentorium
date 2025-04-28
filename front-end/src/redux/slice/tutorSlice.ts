import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TutorData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface TutorState {
  tutorDatas: TutorData | null;
}

const initialState: TutorState = {
    tutorDatas: (() => {
    const storedData = localStorage.getItem('tutorDatas');
    if (storedData) {
      try {
        return JSON.parse(storedData) as TutorData;
      } catch (error) {
        console.error('Failed to parse userDatas from localStorage:', error);
        return null;
      }
    }
    return null;
  })(),
};

const tutorSlice = createSlice({
  name: 'tutor',
  initialState,
  reducers: {
    addTutor: (state, action: PayloadAction<TutorData>) => {
      state.tutorDatas = action.payload;
      localStorage.setItem('tutorDatas', JSON.stringify(action.payload));
    },
    removeTutor: (state) => {
      state.tutorDatas = null;
      localStorage.removeItem('tutorDatas');
    },
  },
});

export const { addTutor, removeTutor } = tutorSlice.actions;

export default tutorSlice.reducer;
