
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { addUser } from "@/redux/slice/userSlice";
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
              dispatch(addUser(user));
              toast.success(response.data.message);
              if (role === "tutor") {
                navigate("/tutor/home");
              } else {
                navigate("/");
              }
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