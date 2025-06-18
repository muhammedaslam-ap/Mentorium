import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { RootState } from "../../../redux/store"; // Adjust path
import { setShowVideoCallUser, setRoomIdUser, setVideoCallUser, setShowIncomingVideoCall } from "../../../redux/slice/userSlice";
import { useSocketContext } from "../../../provider/socket";
import toast from "react-hot-toast";

function VideoCall() {
  const videoCallRef = useRef<HTMLDivElement | null>(null);
  const { roomIdUser, userDatas, videoCallUser, showIncomingVideoCall } = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const { socket } = useSocketContext();
  const userId = userDatas?._id || userDatas?.id;

  useEffect(() => {
    if (!roomIdUser) return;

    const appId = parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID);
    const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      serverSecret,
      roomIdUser.toString(),
      userId || Date.now().toString(), // Use userId if available, fallback to timestamp
      userDatas?.name || "User"
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
          socket?.emit("leave-room", { to: videoCallUser?.tutorId || showIncomingVideoCall?.trainerId });
          dispatch(setShowVideoCallUser(false));
          dispatch(setRoomIdUser(null));
          dispatch(setVideoCallUser(null));
          dispatch(setShowIncomingVideoCall(null));
          localStorage.removeItem("roomId");
          localStorage.removeItem("showVideoCall");
        },
        onError: (error:any) => {
          console.error("ZegoUIKit error:", error);
          toast.error("Video call failed to start.");
        },
      });
    } catch (error:any) {
      console.error("ZEGOCLOUD create error:", error);
      toast.error("Failed to initialize video call.");
    }

    socket?.on("user-left", () => {
      if (zp) zp.destroy();
      dispatch(setShowVideoCallUser(false));
      dispatch(setRoomIdUser(null));
      dispatch(setVideoCallUser(null));
      dispatch(setShowIncomingVideoCall(null));
      localStorage.removeItem("roomId");
      localStorage.removeItem("showVideoCall");
    });

    // Emit call request if videoCallUser is present
    if (videoCallUser?.tutorId) {
      const callRequestPayload = {
        roomId: roomIdUser,
        studentId: userId,
        tutorId: videoCallUser.tutorId,
        callerName: userDatas?.username || "Unknown",
        courseId: videoCallUser.courseId ?? "unknown",
        courseTitle: videoCallUser.courseTitle ?? "Unknown Course",
        timestamp: new Date().toISOString(),
      };
      socket?.emit("call_request", callRequestPayload);
      console.log("Emitting call_request:", callRequestPayload);
    }

    return () => {
      if (zp) zp.destroy();
      socket?.off("user-left");
    };
  }, [roomIdUser, userId, userDatas, videoCallUser, showIncomingVideoCall, dispatch, socket]);

  return <div ref={videoCallRef} className="w-screen h-screen bg-black absolute z-[100]" />;
}

export default VideoCall;