import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useAppContext } from "@/provider/AppProvider";

interface CallRequest {
  roomId: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  timestamp: string;
  tutorId: string;
  callId?: string;
  callerName?: string;
}

interface CallNotificationProps {
  tutorId?: string;
}

export function CallNotification({ tutorId: propTutorId }: CallNotificationProps) {
  const { socket } = useAppContext();
  const currentUser = useSelector((state: any) => state.tutor?.tutorDatas || state.user?.userDatas);
  const tutorId = propTutorId || currentUser?._id || currentUser?.id || null;
  const isTutor =
    currentUser?.role === "tutor" || currentUser?.roles?.includes("tutor") || false;
  const navigate = useNavigate();
  const [callRequest, setCallRequest] = useState<CallRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const activeRoomId = useRef<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!isTutor || !tutorId) {
    console.log("CallNotification skipped: Not a tutor or no tutorId", { isTutor, tutorId });
    return null;
  }

  useEffect(() => {
    console.log("TUTOR ID", tutorId, isTutor, "SOCKET", socket?.id);
    if (!socket) {
      console.warn("No socket available, redirecting to login");
      if (!hasRedirected) {
        // toast.error("Please log in to receive call notifications.");
        setHasRedirected(true);
        navigate("/auth");
      }
      return;
    }

    socket.emit("join_user", tutorId, () => {
      console.log(`Tutor ${tutorId} joined room`);
    });

    const handleCallRequest = (data: CallRequest) => {
      console.log("Received call request:", data);
      if (activeRoomId.current === data.roomId) {
        console.log("Ignoring duplicate call request for roomId:", data.roomId);
        return;
      }
      if (isOpen && activeRoomId.current) {
        console.log(
          "Ignoring call request; modal already open for roomId:",
          activeRoomId.current
        );
        return;
      }
      if (data.tutorId !== tutorId) {
        console.log("Call request ignored, tutorId mismatch:", {
          requestTutorId: data.tutorId,
          tutorId,
        });
        return;
      }
      activeRoomId.current = data.roomId;
      setCallRequest(data);
      setIsOpen(true);
      toast.info(`Incoming call from ${data.callerName || "Student"} for ${data.courseTitle}`);

      timeoutRef.current = setTimeout(() => {
        if (isOpen) {
          handleReject();
          toast.error("Call request timed out.");
        }
      }, 30000);
    };

    socket.on("call_request", handleCallRequest);

    socket.on("call_rejected", (data: { message: string }) => {
      console.log("Call rejected:", data);
      setIsOpen(false);
      setCallRequest(null);
      activeRoomId.current = null;
      toast.error(data.message);
    });

    socket.on("error", (data: { message: string }) => {
      console.error("Socket error:", data.message);
      toast.error(data.message);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
      toast.error("Failed to connect to server.");
    });

    return () => {
      socket.off("call_request", handleCallRequest);
      socket.off("call_rejected");
      socket.off("error");
      socket.off("connect_error");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      console.log("Cleaned up socket listeners");
    };
  }, [socket, tutorId, isTutor, isOpen, navigate, hasRedirected]);

  const handleAccept = () => {
    if (!callRequest || !socket) return;
    console.log("Accepting call for room:", callRequest.roomId);
    socket.emit("call_accepted", {
      callId: callRequest.callId,
      callerId: callRequest.studentId,
      roomId: callRequest.roomId,
      receiverId: tutorId,
      socketId: socket.id,
    });
    const navigateUrl = `/video-call/${callRequest.roomId}`;
    console.log("Navigating to:", navigateUrl);
    setIsOpen(false);
    setCallRequest(null);
    activeRoomId.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    navigate(navigateUrl, {
      state: {
        isInitiator: false,
        courseTitle: callRequest.courseTitle,
        userId: tutorId,
        tutorId,
      },
    });
  };

  const handleReject = () => {
    if (!callRequest || !socket) return;
    console.log("Rejecting call for room:", callRequest.roomId);
    socket.emit("reject_call", {
      callId: callRequest.callId,
      callerId: callRequest.studentId,
      roomId: callRequest.roomId,
      tutorId,
    });
    setIsOpen(false);
    setCallRequest(null);
    activeRoomId.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    toast.info("Call rejected");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleReject();
        }
        setIsOpen(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Incoming Call Request</DialogTitle>
          <DialogDescription>
            {callRequest
              ? `${callRequest.callerName || "A student"} is requesting a video call for the course "${callRequest.courseTitle}".`
              : "No call request available."}
          </DialogDescription>
        </DialogHeader>
        {callRequest && (
          <div className="space-y-2">
            <p>
              <strong>Course:</strong> {callRequest.courseTitle}
            </p>
            <p>
              <strong>Student:</strong> {callRequest.callerName || callRequest.studentId}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {new Date(callRequest.timestamp).toLocaleString()}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleReject}>
            Reject
          </Button>
          <Button onClick={handleAccept}>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}