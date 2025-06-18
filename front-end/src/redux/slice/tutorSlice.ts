import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TutorData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isAccepted: boolean;
}

interface VideoCallPayload {
  _id: string;
  userID: string;
  userName: string;
  userImage: string;
  callType: string;
  trainerName: string;
  trainerImage: string;
  roomId: string;
  type: "incoming" | "out-going";
}

interface TutorState {
  tutorDatas: TutorData | null;
  videoCall: VideoCallPayload | null;
  showVideoCallTrainer: boolean;
  showIncomingCallTrainer: boolean;
  roomIdTrainer: string | null;
  prescription: boolean;
}

const initialState: TutorState = {
  tutorDatas: (() => {
    const storedData = localStorage.getItem('tutorDatas');
    if (storedData) {
      try {
        return JSON.parse(storedData) as TutorData;
      } catch (error) {
        console.error('Failed to parse tutorDatas from localStorage:', error);
      }
    }
    return null;
  })(),
  videoCall: null,
  showVideoCallTrainer: false,
  showIncomingCallTrainer: false,
  roomIdTrainer: null,
  prescription: false,
};

const tutorSlice = createSlice({
  name: 'tutor',
  initialState,
  reducers: {
    setTutorData(state, action: PayloadAction<TutorData>) {
      state.tutorDatas = action.payload;
    },
    setVideoCall(state, action: PayloadAction<VideoCallPayload | null>) {
      state.videoCall = action.payload;
    },
    setShowVideoCall(state, action: PayloadAction<boolean>) {
      state.showVideoCallTrainer = action.payload;
    },
    setShowIncomingCallTrainer: (state, action: PayloadAction<boolean>) => {
      state.showIncomingCallTrainer = action.payload;
    },
    setRoomId(state, action: PayloadAction<string | null>) {
      state.roomIdTrainer = action.payload;
    },
    setPrescription(state, action: PayloadAction<boolean>) {
      state.prescription = action.payload;
    },
    endCallTrainer(state) {
      state.videoCall = null;
      state.showVideoCallTrainer = false;
      state.showIncomingCallTrainer = false; // Clear incoming call flag
      state.roomIdTrainer = null;
      state.prescription = false;
    },
    addTutor(state, action: PayloadAction<TutorData>) {
      state.tutorDatas = action.payload;
      localStorage.setItem('tutorDatas', JSON.stringify(action.payload));
    },
    removeTutor(state) {
      state.tutorDatas = null;
      localStorage.removeItem('tutorDatas');
    },
  },
});

export const {
  addTutor,
  removeTutor,
  setVideoCall,
  setShowVideoCall, // Matches the action name
  setRoomId,
  setPrescription,
  endCallTrainer,
  setShowIncomingCallTrainer, // Export the missing action
} = tutorSlice.actions;

export default tutorSlice.reducer;