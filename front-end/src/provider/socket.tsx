import React, { createContext, JSX, ReactNode, useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Socket, io } from "socket.io-client";
import { RootState, AppDispatch } from "../redux/store";
import {
  endCallUser,
  setShowIncomingVideoCall,
  setRoomIdUser,
  setShowVideoCallUser,
  setVideoCallUser,
} from "../redux/slice/userSlice";
import {
  endCallTrainer,
  setVideoCall,
  setShowVideoCall,
  setRoomId,
  setPrescription,
  setShowIncomingCallTrainer, // Import the new action
} from "../redux/slice/tutorSlice";
import toast from "react-hot-toast";

interface SocketContextType {
  socket: Socket | null;
}

interface IncomingVideoCallData {
  _id: string;
  from: string;
  callType: string;
  trainerName: string;
  trainerImage: string;
  roomId: string;
}

interface AcceptedCallData {
  roomId: string;
  from: string;
  _id: string;
}

interface CallRequest {
  roomId: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  tutorId: string;
  timestamp: string;
  callId: string;
  callerName: string;
}

interface VideoCallStartedData {
  roomId: string;
  roomName: string;
  token: string;
  callId: string;
  receiverId: string;
}

interface VideoCallJoinedData {
  roomId: string;
  roomName: string;
  token: string;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userDatas } = useSelector((state: RootState) => state.user);
  const { tutorDatas } = useSelector((state: RootState) => state.tutor);
  const getUserId = (user: any): string | null => user?._id || user?.id || null;
  const loggedUser = getUserId(userDatas) || getUserId(tutorDatas);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!loggedUser) {
      console.warn("No loggedUser; skipping socket initialization.");
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    console.log("Initializing socket for loggedUser:", loggedUser);

    const socketUrl = import.meta.env.VITE_AUTH_BASEURL || "http://localhost:3000";
    const newSocket = io(socketUrl, {
      query: { userId: loggedUser },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id, "for user:", loggedUser);
      setSocket(newSocket);
      newSocket.emit("join_user", loggedUser, () => {
        console.log(`User ${loggedUser} joined room`);
      });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message, "for user:", loggedUser);
      toast.error("Failed to connect to the server.");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason, "for user:", loggedUser);
      setSocket(null);
    });

    return () => {
      console.log("Cleaning up socket for user:", loggedUser);
      newSocket.disconnect();
      setSocket(null);
    };
  }, [loggedUser]);

  useEffect(() => {
    if (!socket) {
      console.warn("Socket instance is null; skipping event listener setup.");
      return;
    }

    console.log("Setting up event listeners for socket:", socket.id);

    socket.on("incoming-video-call", (data: IncomingVideoCallData) => {
      console.log("Incoming video call:", data);
      if (userDatas?._id) {
        dispatch(
          setShowIncomingVideoCall({
            _id: data._id,
            trainerId: data.from,
            callType: data.callType,
            trainerName: data.trainerName,
            trainerImage: data.trainerImage,
            roomId: data.roomId,
          })
        );
      }
    });

    socket.on("call_request", (data: CallRequest) => {
      console.log("Received call_request in SocketContextProvider:", data);
      if (loggedUser && data.tutorId === loggedUser) {
        dispatch(setShowIncomingCallTrainer(true)); // Update to use incoming call flag
        toast.success(`Incoming call from ${data.callerName}`);
      }
    });

    socket.on("accepted-call", (data: AcceptedCallData) => {
      console.log("Call accepted by tutor:", data);
      if (userDatas?._id && data._id === userDatas._id) { // For student
        dispatch(setRoomIdUser(data.roomId));
        dispatch(setShowVideoCallUser(true));
      }
    });

   socket.on("videoCallStarted", (data: VideoCallStartedData) => {
      console.log("Video call started:", data);
      if (loggedUser) {
        dispatch(setRoomId(data.roomId)); // Use roomIdTrainer for tutor
        if (userDatas?._id && data.receiverId === userDatas._id) { // For student
          dispatch(setShowVideoCallUser(true));
        } else if (tutorDatas?.id && data.receiverId === tutorDatas.id) { // For tutor
          dispatch(setShowVideoCall(true)); // Transition to video call UI
        }
        // Ensure the client is in the room before joining
        socket.emit("joinVideoCall", {
          roomId: data.roomId,
          userId: loggedUser,
          role: userDatas?._id ? "student" : "tutor",
        }, () => {
          console.log("Joined video call room:", data.roomId);
        });
      }
    });

    socket.on("videoCallJoined", (data: VideoCallJoinedData) => {
      console.log("Video call joined:", data);
      toast.success("User joined the video call");
    });

    socket.on("call_ended", () => {
      console.log("Call ended");
      toast.error("Call ended");
      if (userDatas?._id) {
        dispatch(endCallUser());
      } else if (tutorDatas?.id) {
        dispatch(setVideoCall(null));
        dispatch(endCallTrainer());
      }
    });

    socket.on("call-rejected", () => {
      toast.error("Call ended or rejected");
      if (userDatas?._id) {
        dispatch(endCallUser());
      } else if (tutorDatas?.id) {
        dispatch(setVideoCall(null));
        dispatch(endCallTrainer());
      }
    });

    socket.on("user-left", (data: string) => {
      if (data === loggedUser) {
        dispatch(setPrescription(true));
        if (userDatas?._id) {
          dispatch(setShowVideoCallUser(false));
          dispatch(setRoomIdUser(null));
          dispatch(setVideoCallUser(null));
          dispatch(setShowIncomingVideoCall(null));
        } else if (tutorDatas?.id) {
          dispatch(setShowVideoCall(false));
          dispatch(setRoomId(null));
          dispatch(setVideoCall(null));
        }
      }
    });

    return () => {
      console.log("Cleaning up socket event listeners...");
      socket.off("incoming-video-call");
      socket.off("call_request");
      socket.off("accepted-call");
      socket.off("videoCallStarted");
      socket.off("videoCallJoined");
      socket.off("call_ended");
      socket.off("call-rejected");
      socket.off("user-left");
    };
  }, [socket, dispatch, userDatas, tutorDatas, loggedUser]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};