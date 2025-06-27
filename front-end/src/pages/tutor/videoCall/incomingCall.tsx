import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { useSocketContext } from "../../../provider/socket";
import {
  setRoomId,
  setShowVideoCall,
  setShowIncomingCallTrainer,
} from "../../../redux/slice/tutorSlice";
import { MdCall, MdCallEnd } from "react-icons/md";
import toast from "react-hot-toast";

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

function TutorIncomingVideocall() {
  const { tutorDatas } = useSelector((state: any) => state.tutor);
  const [incomingCall, setIncomingCall] = useState<CallRequest | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useSocketContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!socket || !tutorDatas) {
      console.log("Waiting for socket or tutorDatas...");
      const interval = setInterval(() => {
        if (socket && tutorDatas) {
          clearInterval(interval);
          setupListeners();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
    setupListeners();

    function setupListeners() {
      socket!.on("call_request", (data: CallRequest) => {
        console.log("Received call_request yoyyo:", data);
        if (data.tutorId === tutorDatas!.id) {
          setIncomingCall(data);
          dispatch(setShowIncomingCallTrainer(true));
          toast.success(`Incoming call from ${data.callerName}`);
        }
      });
    }

    return () => {
      if (socket) socket.off("call_request");
    };
  }, [socket, tutorDatas, dispatch]);

  const handleAcceptCall = async () => {
  if (!incomingCall || !socket || !tutorDatas) {
    console.error("No incoming call or missing socket/tutor data");
    toast.error("Cannot accept call.");
    return;
  }
  setIsLoading(true);
  try {
    socket.emit("joinVideoCall", {
      roomId: incomingCall.roomId,
      userId: tutorDatas.id,
      role: "tutor",
    }, (response: any) => {
      if (response.error) console.error("Join video call failed:", response.error);
      else console.log("Join video call response:", response);
    });

    socket.emit("call_accepted", {
      callId: incomingCall.callId,
      roomId: incomingCall.roomId,
      receiverId: incomingCall.studentId,
      userId: tutorDatas.id,
    });

    dispatch(setRoomId(incomingCall.roomId));
    dispatch(setShowVideoCall(true));
    dispatch(setShowIncomingCallTrainer(false));
    setIncomingCall(null);
  } catch (error) {
    console.error("Error accepting call:", error);
    toast.error("Failed to accept call.");
  } finally {
    setIsLoading(false);
  }
};

 const handleRejectCall = async () => {
  if (!incomingCall || !socket) {
    console.error("No incoming call or missing socket");
    toast.error("Cannot reject call.");
    return;
  }
  setIsLoading(true);
  try {
    socket.emit("call_rejected", {
      callId: incomingCall.callId,
      callerId: incomingCall.studentId,
    });

    dispatch(setShowIncomingCallTrainer(false));
    setIncomingCall(null);

    window.location.reload();
  } catch (error) {
    console.error("Error rejecting call:", error);
    toast.error("Failed to reject call.");
  } finally {
    setIsLoading(false);
  }
};

  if (!incomingCall) return null;

  return (
    <div className="w-full h-full flex justify-center items-center z-40 fixed top-1">
      <div className="w-96 bg-cyan-950 z-40 rounded-xl flex flex-col items-center shadow-2xl shadow-black">
        <div className="flex flex-col gap-7 items-center">
          <span className="text-lg text-white mt-4">Incoming video call</span>
          <span className="text-3xl text-white font-bold">
            {incomingCall.callerName}
          </span>
        </div>
        <div className="flex m-5">
          <img
            className="w-24 h-24 rounded-full"
            src="/default-profile.png"
            alt="profile"
          />
        </div>
        <div className="flex m-2 mb-5 gap-7">
          <div
            className={`bg-green-500 w-12 h-12 text-white rounded-full flex justify-center items-center m-1 cursor-pointer ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <MdCall
              onClick={isLoading ? undefined : handleAcceptCall}
              className="text-3xl"
            />
          </div>
          <div
            className={`bg-red-500 w-12 h-12 text-white rounded-full flex justify-center items-center m-1 cursor-pointer ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <MdCallEnd
              onClick={isLoading ? undefined : handleRejectCall}
              className="text-3xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorIncomingVideocall;