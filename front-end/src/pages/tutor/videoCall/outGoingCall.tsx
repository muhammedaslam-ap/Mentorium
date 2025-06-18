import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { RootState } from "../../../redux/store"; // Adjust path
import { setShowVideoCall, setRoomId } from "../../../redux/slice/tutorSlice"; // Adjust slice
import { useSocketContext } from "../../../provider/socket";
import toast from "react-hot-toast";

function TrainerVideoCall() {
  const videoCallRef = useRef<HTMLDivElement | null>(null);
  const { showVideoCallTrainer, tutorDatas, roomIdTrainer } = useSelector((state: any) => state.tutor);
  const dispatch = useDispatch();
  const { socket } = useSocketContext();
  const tutorId = tutorDatas?._id || tutorDatas?.id;

  useEffect(() => {
    if (!roomIdTrainer) return;

    const appId = parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID);
    const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      serverSecret,
      roomIdTrainer.toString(),
      tutorId || Date.now().toString(), // Use tutorId if available, fallback to timestamp
      tutorDatas?.name || "Trainer"
    );

    let zp: any;
    try {
      zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: videoCallRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showPreJoinView: false,
        onLeaveRoom: () => {
          socket?.emit("leave-room", { to: tutorId });
          dispatch(setShowVideoCall(false));
          dispatch(setRoomId(null));
        },
        onError: (error:any) => {
          console.error("ZegoUIKit error:", error);
          toast.error("Video call failed to start.");
        },
      });
    } catch (error) {
      console.error("ZEGOCLOUD create error:", error);
      toast.error("Failed to initialize video call.");
    }

    socket?.on("user-left", () => {
      if (zp) zp.destroy();
      dispatch(setShowVideoCall(false));
      dispatch(setRoomId(null));
      localStorage.removeItem("roomId");
      localStorage.removeItem("showVideoCall");
    });

    // Emit acceptance if this is triggered by an incoming call
    if (showVideoCallTrainer && roomIdTrainer) {
      const acceptPayload = {
        callId: "someCallId", // Replace with actual callId from notification
        roomId: roomIdTrainer,
        receiverId: "studentId", // Replace with actual studentId from notification
        userId: tutorId,
      };
      socket?.emit("call_accepted", acceptPayload);
      console.log("Emitting call_accepted:", acceptPayload);
    }

    return () => {
      if (zp) zp.destroy();
      socket?.off("user-left");
    };
  }, [roomIdTrainer, tutorId, tutorDatas, showVideoCallTrainer, dispatch, socket]);

  if (!showVideoCallTrainer) return null;

  return <div ref={videoCallRef} className="w-screen h-screen bg-black absolute z-[100]" />;
}

export default TrainerVideoCall;