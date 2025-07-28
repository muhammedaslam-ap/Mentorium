import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tutorService } from "@/services/tutorServices/tutorService";
import { useNavigate } from "react-router-dom";

interface ProfileResponse {
  profile?: {
    name?: string | null;
    specialization?: string | null;
    phone?: string | null;
    bio?: string | null;
    approvalStatus?: string | null; 
    rejectionReason?: string | null;
    verificationDocUrl?: string | null;
  } | null;
}

const UnderVerification: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [profile, setProfile] = useState<ProfileResponse["profile"] | null>(null);

  useEffect(() => {
    const fetchProfileStatus = async () => {
      try {
        const response = await tutorService.getProfile();
        console.log("Fetched profile in UnderVerification:", response);
        setProfile(response.profile);
        if (response.profile?.approvalStatus === "pending") {
          setIsPending(true);
        } else if (response.profile?.approvalStatus === "approved") {
          navigate("/dashboard"); // Redirect if approved
        } else {
          navigate("/tutor-profile"); // Redirect to profile if rejected or no status
        }
      } catch (error: any) {
        console.error("Failed to fetch profile status:", error);
        toast.error("Unable to check account status. Please try again.");
        navigate("/auth"); // Redirect to login on failure
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStatus();
  }, [navigate]);

  const handleRefresh = () => {
    setLoading(true);
    setIsPending(false);
    // Re-fetch profile status
    tutorService.getProfile()
      .then((response) => {
        console.log("Refreshed profile in UnderVerification:", response);
        setProfile(response.profile);
        if (response.profile?.approvalStatus === "pending") {
          setIsPending(true);
        } else if (response.profile?.approvalStatus === "approved") {
          navigate("/dashboard");
        } else {
          navigate("/tutor-profile");
        }
      })
      .catch((error: any) => {
        console.error("Refresh failed:", error);
        toast.error("Failed to refresh status. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-violet-50 flex items-center justify-center">
        <p className="text-violet-700">Loading...</p>
      </div>
    );
  }

  if (!isPending) {
    return null; // Should not reach here due to redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-violet-700">Account Verification</CardTitle>
            <CardDescription>Your account is being reviewed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-violet-600">
              Your account is currently under verification. Once approved by the admin, you will
              gain full access. This process may take some time.
            </p>
            {profile?.rejectionReason && (
              <p className="text-red-500">
                Reason for rejection (if applicable): {profile.rejectionReason}
              </p>
            )}
            <Button onClick={handleRefresh} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnderVerification;