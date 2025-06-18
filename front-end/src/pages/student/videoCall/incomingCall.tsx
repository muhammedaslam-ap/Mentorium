import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { useSocketContext } from '../../../provider/socket';
import { endCallUser, setRoomIdUser, setShowVideoCallUser } from '../../../redux/slice/userSlice';
import { MdCall, MdCallEnd } from "react-icons/md";
import toast from "react-hot-toast";

function IncomingVideocall() {
  const { showIncomingVideoCall } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const { socket } = useSocketContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleEndCall = async () => {
    if (!showIncomingVideoCall) {
      console.error("No incoming call to end.");
      return;
    }
    if (!socket) {
      toast.error("Connection error. Please try again.");
      return;
    }
    setIsLoading(true);
    try {
      await socket.emit("reject-call", {
        to: showIncomingVideoCall._id,
        sender: "user",
        name: showIncomingVideoCall.trainerName,
      });
      dispatch(endCallUser());
    } catch (error) {
      console.error("Error rejecting call:", error);
      toast.error("Failed to end call. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptCall = async () => {
    if (!showIncomingVideoCall) {
      console.error("No incoming call to accept.");
      return;
    }
    if (!socket) {
      toast.error("Connection error. Please try again.");
      return;
    }
    setIsLoading(true);
    try {
      console.log('Emitting accept-incoming-call with data:', {
        to: showIncomingVideoCall._id,
        from: showIncomingVideoCall.trainerId,
        roomId: showIncomingVideoCall.roomId,
      });
      socket.emit("accept-incoming-call", {
        to: showIncomingVideoCall._id,
        from: showIncomingVideoCall.trainerId,
        roomId: showIncomingVideoCall.roomId,
      });
      dispatch(setRoomIdUser(showIncomingVideoCall.roomId));
      dispatch(setShowVideoCallUser(true));
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Failed to accept call. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='w-full h-full flex justify-center items-center z-40 fixed top-1'>
        <div className='w-96 bg-cyan-950 z-40 rounded-xl flex flex-col items-center shadow-2xl shadow-black'>
          <div className='flex flex-col gap-7 items-center'>
            <span className='text-lg text-white mt-4'>Incoming video call</span>
            <span className='text-3xl text-white font-bold'>{showIncomingVideoCall?.trainerName}</span>
          </div>
          <div className='flex m-5'>
            <img
              className='w-24 h-24 rounded-full'
              src={showIncomingVideoCall?.trainerImage}
              alt='profile'
            />
          </div>
          <div className='flex m-2 mb-5 gap-7'>
            <div
              className={`bg-green-500 w-12 h-12 text-white rounded-full flex justify-center items-center m-1 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MdCall
                onClick={isLoading ? undefined : handleAcceptCall}
                className='text-3xl'
              />
            </div>
            <div
              className={`bg-red-500 w-12 h-12 text-white rounded-full flex justify-center items-center m-1 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MdCallEnd
                onClick={isLoading ? undefined : handleEndCall}
                className='text-3xl'
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default IncomingVideocall;