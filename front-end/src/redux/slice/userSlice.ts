import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface IncomingVideoCall {
  _id: string;
  callType: string;
  trainerId: string;
  trainerName: string;
  trainerImage: string;
  roomId: string | null;
}

interface VideoCallUser {
  tutorId: string;
  courseId?: string;
  courseTitle?: string;
}

interface UserState {
  userDatas: UserData | null;
  showIncomingVideoCall: IncomingVideoCall | null;
  videoCallUser: VideoCallUser | null;
  showVideoCallUser: boolean;
  roomIdUser: string | null;
}

const initialState: UserState = {
  userDatas: (() => {
    const storedData = localStorage.getItem('userDatas');
    if (storedData) {
      try {
        return JSON.parse(storedData) as UserData;
      } catch (error) {
        console.error('Failed to parse userDatas from localStorage:', error);
      }
    }
    return null;
  })(),
  showIncomingVideoCall: null,
  videoCallUser: null,
  showVideoCallUser: false,
  roomIdUser: null,
};

const userSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setShowIncomingVideoCall: (state, action: PayloadAction<IncomingVideoCall | null>) => {
      state.showIncomingVideoCall = action.payload;
    },
    setVideoCallUser: (state, action: PayloadAction<VideoCallUser | null>) => {
      state.videoCallUser = action.payload;
    },
    setShowVideoCallUser: (state, action: PayloadAction<boolean>) => {
      state.showVideoCallUser = action.payload;
    },
    setRoomIdUser: (state, action: PayloadAction<string | null>) => {
      state.roomIdUser = action.payload;
    },
    endCallUser: (state) => {
      console.log('Ending call...');
      state.videoCallUser = null;
      state.showIncomingVideoCall = null;
      state.showVideoCallUser = false;
      state.roomIdUser = null;
      localStorage.removeItem("IncomingVideoCall");
    },
    addStudent: (state, action: PayloadAction<UserData>) => {
      state.userDatas = action.payload;
      localStorage.setItem('userDatas', JSON.stringify(action.payload));
    },
    removeUser: (state) => {
      state.userDatas = null;
      localStorage.removeItem('userDatas');
    },
  },
});

export const {
  addStudent,
  removeUser,
  setShowIncomingVideoCall,
  setVideoCallUser,
  setShowVideoCallUser,
  setRoomIdUser,
  endCallUser,
} = userSlice.actions;

export default userSlice.reducer;