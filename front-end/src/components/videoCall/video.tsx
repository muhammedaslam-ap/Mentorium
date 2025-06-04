import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import {
  Loader,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  X,
} from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";

// Initialize socket (ideally this should come from a context or singleton)
const socket: Socket = io("http://localhost:3000", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export function VideoCall() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(
    (state: any) => state.tutor?.tutorDatas || state.user?.userDatas
  );
  const userId = user?._id || user?.id;
  const isInitiator = location.state?.isInitiator || false;
  const courseTitle = location.state?.courseTitle || "Video Call";
  const tutorId = location.state?.tutorId || roomId?.split("_")[3];

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "failed" | "retrying" | "invalid"
  >("connecting");
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [peerSocketId, setPeerSocketId] = useState<string | null>(null); // Track peer's socket ID
  const maxRetries = 3;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callContainerRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasJoinedRoom = useRef(false);
  const hasSentCallRequest = useRef(false);
  const candidateQueue = useRef<RTCIceCandidateInit[]>([]);

  // Validate props on mount
  useEffect(() => {
    if (!roomId || !userId || !tutorId) {
      console.error("Invalid props", { roomId, userId, tutorId });
      toast.error("Invalid call parameters. Please try again.");
      setConnectionStatus("invalid");
      setIsDialogOpen(true);
    } else {
      console.log("Props validated", { roomId, userId, tutorId, isInitiator });
      setConnectionStatus("connecting");
    }
  }, [roomId, userId, tutorId]);

  // Socket connection handling
  useEffect(() => {
    let isMounted = true;

    const connectSocket = () => {
      if (!socket.connected) {
        console.log("Attempting socket connection");
        socket.connect();
        setConnectionStatus("connecting");
      }
    };

    socket.on("connect", () => {
      if (isMounted) {
        console.log("Socket connected", { socketId: socket.id });
        setIsSocketConnected(true);
        // Join user room for notifications
        socket.emit("join_user", userId, () => {
          console.log(`User ${userId} joined user room`);
        });
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
      toast.error("Failed to connect to call server. Retrying...");
      setConnectionStatus("retrying");
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        if (isMounted) {
          setTimeout(connectSocket, 5000);
        }
      } else {
        setConnectionStatus("failed");
        toast.error("Max retries reached. Call failed.");
      }
    });

    socket.on("error", (data) => {
      console.error("Socket error:", data);
      toast.error(data.message || "Socket error occurred");
    });

    connectSocket();

    return () => {
      isMounted = false;
      socket.off("connect");
      socket.off("connect_error");
      socket.off("error");
    };
  }, [userId, retryCount]);

  // Check WebRTC support
  useEffect(() => {
    if (!window.RTCPeerConnection) {
      console.error("WebRTC not supported");
      toast.error("WebRTC is not supported in this browser");
      setConnectionStatus("failed");
      setIsDialogOpen(true);
    }
  }, []);

  // Initialize media stream
  useEffect(() => {
    if (connectionStatus === "invalid") return;
    let isMounted = true;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (isMounted) {
          console.log("Media stream acquired", { streamId: stream.id });
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current
              .play()
              .catch((err) => console.error("Local video play error:", err));
          }
        }
      })
      .catch((err) => {
        console.error("Media access failed:", err);
        toast.error(
          "Cannot access camera/microphone. Please check permissions."
        );
        setConnectionStatus("failed");
        setIsDialogOpen(true);
      });

    return () => {
      isMounted = false;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
    };
  }, [connectionStatus]);

  // Toggle audio
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const newMuteState = !isMuted;
        audioTracks.forEach((track) => {
          track.enabled = !newMuteState;
          console.log(`Audio track ${track.id} enabled: ${track.enabled}`);
        });
        setIsMuted(newMuteState);
        toast.success(newMuteState ? "Microphone muted" : "Microphone unmuted");
      } else {
        console.warn("No audio tracks found in local stream");
      }
    } else {
      console.warn("Local stream not available for toggling mute");
    }
  }, [localStream, isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const newVideoState = !isVideoOff;
        videoTracks.forEach((track) => {
          track.enabled = !newVideoState;
          console.log(`Video track ${track.id} enabled: ${track.enabled}`);
        });
        setIsVideoOff(newVideoState);
        toast.success(newVideoState ? "Video off" : "Video on");
      } else {
        console.warn("No video tracks found in local stream");
      }
    } else {
      console.warn("Local stream not available for toggling video");
    }
  }, [localStream, isVideoOff]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!callContainerRef.current) return;
    if (!document.fullscreenElement) {
      callContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("Fullscreen error:", err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error("Exit fullscreen error:", err);
        });
    }
  }, []);

  // Cleanup function
  const cleanupCall = useCallback(() => {
    console.log("Cleaning up call", { roomId, userId });
    setIsConnected(false);
    setConnectionStatus("failed");

    if (socket.connected) {
      socket.emit("end_call", { to: roomId });
      console.log("Emitted end_call to room:", roomId);
      socket.emit("leave_room", roomId);
      console.log("Left video call room:", roomId);
    }

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
      console.log("Closed peer connection");
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      console.log("Stopped local stream");
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      console.log("Cleared remote video");
    }
    setRemoteStream(null);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    candidateQueue.current = [];

    setIsDialogOpen(false);
    navigate(-1);
  }, [localStream, roomId, userId, navigate]);

  // Emit call_request for initiator (student) after confirming room join
  useEffect(() => {
    if (
      !isInitiator ||
      !roomId ||
      !userId ||
      !isSocketConnected ||
      !tutorId ||
      connectionStatus === "invalid"
    )
      return;

    const handleJoinedRoom = () => {
      if (!hasSentCallRequest.current) {
        console.log("Joining room");
        socket.emit("call_request", {
          roomId,
          studentId: userId,
          courseId: roomId.split("_")[1],
          courseTitle,
          tutorId,
          timestamp: new Date().toISOString(),
          callerName: user?.name || "Student",
        });
        console.log("Emitted call_request", { roomId, userId, tutorId });
        hasSentCallRequest.current = true;
      }
    };

    socket.on("joined_room", handleJoinedRoom);

    if (!hasJoinedRoom.current) {
      socket.emit("join_room", roomId);
      hasJoinedRoom.current = true;
      console.log("Joined video call room", { roomId, socketId: socket.id });
    }

    return () => {
      socket.off("joined_room", handleJoinedRoom);
    };
  }, [
    isInitiator,
    roomId,
    userId,
    isSocketConnected,
    tutorId,
    connectionStatus,
    courseTitle,
    user?.name,
  ]);

  // WebRTC and socket handling
  useEffect(() => {
    if (
      !localStream ||
      !roomId ||
      !userId ||
      !isSocketConnected ||
      !tutorId ||
      connectionStatus === "invalid"
    )
      return;

    let isMounted = true;

    // Initialize peer connection with STUN and TURN servers
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        // Replace with your TURN server details
        {
          urls: "turn:your-turn-server:3478",
          username: "username",
          credential: "password",
        },
      ],
    });
    peerRef.current = peer;

    // Add local tracks to peer connection
    localStream.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
      console.log("Added track to peer connection:", track.kind);
    });

    // Handle remote stream
    peer.ontrack = (event) => {
      console.log("Received remote stream:", event.streams[0]);
      setRemoteStream(event.streams[0]);
      setIsConnected(true); // Set isConnected when remote stream is received
      if (remoteVideoRef.current) {
        const video = remoteVideoRef.current;
        video.srcObject = event.streams[0];
        video.onloadedmetadata = () => {
          video.play().catch((err) => {
            console.error("Remote video play error:", err);
          });
        };
      }
    };

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate && peerSocketId) {
        console.log("Sending ICE candidate to:", peerSocketId);
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: peerSocketId, // Send to specific peer
        });
      }
    };

    // Monitor ICE connection state
    peer.oniceconnectionstatechange = () => {
      const state = peer.iceConnectionState;
      console.log("ICE connection state:", state);
      if (state === "connected" || state === "completed") {
        setIsConnected(true);
        setConnectionStatus("connected");
        toast.success("Connected to the call!");
      }
      if (state === "failed") {
        console.error("ICE connection failed");
        setConnectionStatus("failed");
        toast.error("Failed to connect to the call. Please try again.");
      }
      if (state === "disconnected") {
        console.log("Call disconnected");
        setConnectionStatus("failed");
        toast.info("Call disconnected.");
        cleanupCall();
      }
    };

    // Socket event handlers
    socket.on("call_accepted", ({ callId, receiverId }) => {
      console.log(`Call ${callId} accepted by ${receiverId}`);
      if (isInitiator) {
        // Student sends offer after tutor accepts
        const startCall = async () => {
          try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socket.emit("offer", { offer, to: roomId });
            console.log("Sent offer:", offer);
          } catch (error) {
            console.error("Error creating offer:", error);
          }
        };
        startCall();
      } else {
        console.log("Not the initiator, waiting for offer...");
      }
    });

    peer.onsignalingstatechange = () => {
      console.log("Signaling state changed:", peer.signalingState);
    };

    socket.on("offer", async ({ offer, from }) => {
      console.log("Received offer from:", from);
      setPeerSocketId(from); // Store peer's socket ID
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("answer", { answer, to: from }); // Send answer to specific peer
        console.log("Sent answer to:", from);

        // Process any queued ICE candidates
        while (candidateQueue.current.length) {
          const candidate = candidateQueue.current.shift();
          if (candidate) {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    socket.on("answer", async ({ answer, from }) => {
      console.log("Received answer from:", from);
      setPeerSocketId(from); // Store peer's socket ID
      try {
        if (peer.signalingState === "have-local-offer") {
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
        } else {
          console.warn(
            "Skipping answer: unexpected signaling state",
            peer.signalingState
          );
        }
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    });

    socket.on("ice-candidate", async ({ candidate, from }) => {
      console.log("Received ICE candidate from:", from);
      setPeerSocketId(from); // Store peer's socket ID
      try {
        if (peer.remoteDescription) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          candidateQueue.current.push(candidate);
          console.log("Queued ICE candidate as remote description not set");
        }
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    });

    socket.on("call_rejected", ({ message }) => {
      console.log("Call rejected:", message);
      toast.error(message);
      setConnectionStatus("failed");
      setIsDialogOpen(true);
    });

    socket.on("call_ended", () => {
      console.log("Call ended by remote user");
      cleanupCall();
    });

    return () => {
      isMounted = false;
      socket.off("call_accepted");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("call_rejected");
      socket.off("call_ended");
    };
  }, [
    localStream,
    roomId,
    userId,
    isSocketConnected,
    tutorId,
    isInitiator,
    courseTitle,
    cleanupCall,
  ]);

  const handleDialogClose = useCallback(() => {
    if (connectionStatus === "connected") {
      cleanupCall();
    } else {
      setIsDialogOpen(false);
      navigate(-1);
    }
  }, [connectionStatus, cleanupCall, navigate]);

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "failed":
        return "Connection Failed";
      case "retrying":
        return `Retrying (${retryCount}/${maxRetries})`;
      case "invalid":
        return "Invalid Call Parameters";
      default:
        return "Connecting...";
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogContent
        className="max-w-full p-0 overflow-hidden bg-gray-900 text-white rounded-xl"
        ref={callContainerRef}
      >
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 bg-gray-800">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
                <Badge>{getStatusText()}</Badge>
                {courseTitle}
              </DialogTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleDialogClose}
                      variant="outline"
                      size="icon"
                      className="w-4 h-8 rounded-full bg-gray-700 hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Close Call</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DialogDescription className="sr-only">
              Video call dialog for {courseTitle}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px] max-h-[70vh]">
            {connectionStatus === "invalid" || connectionStatus === "failed" ? (
              <div className="col-span-2 flex flex-col items-center justify-center text-gray-400">
                <p>{getStatusText()}</p>
                {connectionStatus === "failed" && (
                  <Button
                    onClick={() => {
                      setConnectionStatus("connecting");
                      setRetryCount(0);
                      hasJoinedRoom.current = false;
                      hasSentCallRequest.current = false;
                      socket.emit("call_request", {
                        roomId,
                        studentId: userId,
                        courseId: roomId!.split("_")[1],
                        courseTitle,
                        tutorId,
                        timestamp: new Date().toISOString(),
                        callerName: user?.name || "Student",
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Retry Call
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div
                  className={`relative rounded-xl overflow-hidden w-full bg-gray-800 border-gray-700 border shadow-lg aspect-video ${
                    isConnected ? "md:col-span-1" : "md:col-span-2"
                  }`}
                >
                  {!isConnected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader className="w-10 h-10 animate-spin" />
                      <p>
                        Waiting for {isInitiator ? "tutor" : "student"} to
                        join...
                      </p>
                    </div>
                  )}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${
                      !isConnected ? "opacity-0" : ""
                    }`}
                  />
                </div>
                <div className="relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shadow-lg aspect-video">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${
                      isVideoOff ? "opacity-0" : ""
                    }`}
                  />
                </div>
              </>
            )}
          </div>
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={toggleMute}
                      variant="outline"
                      size="icon"
                      className={`w-10 h-10 rounded-full ${
                        isMuted ? "bg-red-500" : "bg-indigo-700"
                      }`}
                    >
                      {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={toggleVideo}
                      variant="outline"
                      size="icon"
                      className={`w-10 h-10 rounded-full ${
                        isVideoOff ? "bg-red-500" : "bg-indigo-700"
                      }`}
                    >
                      {isVideoOff ? <VideoOff /> : <Video />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isVideoOff ? "Turn on camera" : "Turn off camera"}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={toggleFullscreen}
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full bg-indigo-700"
                    >
                      <Maximize2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={cleanupCall}
                      variant="destructive"
                      size="icon"
                      className="w-10 h-10 rounded-full bg-red-600"
                    >
                      <PhoneOff />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>End Call</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}