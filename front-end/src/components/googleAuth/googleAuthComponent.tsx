import { authAxiosInstance } from "@/api/authAxiosInstance";
import { addStudent } from "@/redux/slice/userSlice";
import { addTutor } from "@/redux/slice/tutorSlice";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface GoogleAuthProps {
  role: "student" | "tutor";
}

export const GoogleAuth = ({ role }: GoogleAuthProps) => {
  const clientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          authAxiosInstance
            .post("/auth/google-auth", { credentialResponse, role })
            .then((response) => {
              const user = response.data.userData;

              // Dispatch according to role
              if (role === "tutor") {
                dispatch(addTutor(user));
                navigate("/tutor/home");
              } else {
                dispatch(addStudent(user));
                navigate("/");
              }

              toast.success(response.data.message);
            })
            .catch((error) => {
              toast.error(error.response?.data?.message || "Google login failed");
            });
        }}
        onError={() => {
          toast.error("Google login failed");
        }}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="100%"
      />
    </GoogleOAuthProvider>
  );
};
