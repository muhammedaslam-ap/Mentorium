import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  User,
  Edit,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  GraduationCap,
  FileText,
  Phone,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { tutorService } from "@/services/tutorServices/tutorService";
import { Header } from "../components/header";
import { Sidebar } from "../components/sideBar";

interface TutorProfile {
  name: string;
  specialization: string;
  phone: string;
  bio: string;
  approvalStatus?: string;
  rejectionReason?: string;
  verificationDocUrl?: string;
}

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

export default function TutorProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profile, setProfile] = useState<TutorProfile>({
    name: "",
    specialization: "",
    phone: "",
    bio: "",
    verificationDocUrl: "",
  });
  const [originalProfile, setOriginalProfile] = useState<TutorProfile | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [presignedUrl, setPresignedUrl] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    specialization?: string;
    phone?: string;
    bio?: string;
    document?: string;
  }>({});
  const [removeDocument, setRemoveDocument] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\(\)-+]/g, '');
    const isNumeric = /^\d+$/.test(cleaned);
    const isValidLength = cleaned.length >= 10 && cleaned.length <= 15;
    return isNumeric && isValidLength;
  };

  const validateForm = () => {
    const errors: { name?: string; specialization?: string; phone?: string; bio?: string; document?: string } = {};

    if (!profile.name.trim()) {
      errors.name = "Full name is required";
    } else if (profile.name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters long";
    } else if (profile.name.trim().length > 100) {
      errors.name = "Full name must not exceed 100 characters";
    }

    const specializations = profile.specialization
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);
    if (specializations.length === 0) {
      errors.specialization = "At least one specialization is required";
    } else if (profile.specialization.length > 100) {
      errors.specialization = "Total specialization must not exceed 100 characters";
    } else {
      const invalidSpec = specializations.find((s) => s.length < 2 || s.length > 100);
      if (invalidSpec) {
        errors.specialization = "Each specialization must be 2-100 characters";
      }
    }

    if (!profile.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhoneNumber(profile.phone)) {
      errors.phone = "Invalid phone number. Use 10-15 digits.";
    }

    if (profile.bio.trim().length > 1000) {
      errors.bio = "Bio must not exceed 1000 characters";
    }

    if (!hasProfile && !selectedFile) {
      errors.document = "Please upload a verification document";
    } else if (hasProfile && removeDocument && !selectedFile) {
      errors.document = "Please upload a new document after removing the existing one";
    }

    setFormErrors(errors);
    console.log("Validation errors:", errors);
    return Object.keys(errors).length === 0;
  };

  const renderSpecializationChips = (specialization: string) => {
    const specializations = specialization
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);
    console.log("Rendering chips for:", specializations);
    return specializations.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {specializations.map((spec, index) => (
          <Badge
            key={index}
            className="bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200"
          >
            {spec}
          </Badge>
        ))}
      </div>
    ) : (
      <span className="text-violet-600">Your Specialization</span>
    );
  };

  useEffect(() => {
    let isMounted = true;
    console.log("useEffect: Fetching tutor profile");
    fetchTutorProfile().catch((error) => {
      if (isMounted) {
        console.error("fetchTutorProfile failed in useEffect:", error);
        toast.error("Failed to load profile data");
        setHasProfile(false);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (editMode) {
      validateForm();
    } else {
      setFormErrors({});
    }
    console.log("removeDocument state:", removeDocument);
  }, [profile, selectedFile, removeDocument, editMode]);

  const fetchTutorProfile = async () => {
    setLoading(true);
    try {
      const response: ProfileResponse = await tutorService.getProfile();
      console.log("fetchTutorProfile response:", response);
      if (response?.profile) {
        const profileData: TutorProfile = {
          name: response.profile.name ?? "",
          specialization: response.profile.specialization ?? "",
          phone: response.profile.phone ?? "",
          bio: response.profile.bio ?? "",
          approvalStatus: response.profile.approvalStatus ?? "",
          rejectionReason: response.profile.rejectionReason ?? "",
          verificationDocUrl: response.profile.verificationDocUrl ?? "",
        };
        console.log("Profile data:", profileData);
        console.log("verificationDocUrl:", profileData.verificationDocUrl);
        setProfile(profileData);
        setOriginalProfile(profileData);
        setHasProfile(!!profileData.name);
        setRemoveDocument(false); 

        if (profileData.verificationDocUrl) {
          setUrlLoading(true);
          try {
            const url = await tutorService.getDocumentPresignedUrl();
            console.log("Presigned URL:", url);
            setPresignedUrl(url);
          } catch (error) {
            console.error("Failed to fetch pre-signed URL:", error);
            toast.error("Unable to load document URL");
          } finally {
            setUrlLoading(false);
          }
        }
      } else {
        setHasProfile(false);
        setProfile({
          name: "",
          specialization: "",
          phone: "",
          bio: "",
          approvalStatus: "",
          rejectionReason: "",
          verificationDocUrl: "",
        });
        setRemoveDocument(false);
      }
    } catch (error: any) {
      console.error("Failed to fetch tutor profile:", error);
      toast.error("Failed to load profile data");
      setHasProfile(false);
      setProfile({
        name: "",
        specialization: "",
        phone: "",
        bio: "",
        approvalStatus: "",
        rejectionReason: "",
        verificationDocUrl: "",
      });
      setRemoveDocument(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name === "phone") {
      if (value.trim() && !validatePhoneNumber(value)) {
        setPhoneError("Invalid phone number. Use 10-15 digits.");
      } else {
        setPhoneError(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; 
      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit");
        setFormErrors((prev) => ({ ...prev, document: "File size exceeds 5MB limit" }));
        return;
      }
      if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Invalid file type. Please upload PDF, JPG, or PNG");
        setFormErrors((prev) => ({ ...prev, document: "Invalid file type. Please upload PDF, JPG, or PNG" }));
        return;
      }
      setSelectedFile(file);
      setRemoveDocument(false);
      setFormErrors((prev) => ({ ...prev, document: undefined }));
    }
  };

  const handleRemoveDocument = () => {
    setSelectedFile(null);
    setRemoveDocument(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFormErrors((prev) => ({ ...prev, document: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);
    try {
      if (hasProfile) {
        await tutorService.updateProfile(
          {
            name: profile.name,
            specialization: profile.specialization,
            phone: profile.phone,
            bio: profile.bio,
          },
          selectedFile,
          removeDocument
        );
        toast.success("Profile updated successfully");
      } else {
        await tutorService.createProfile(
          {
            name: profile.name,
            specialization: profile.specialization,
            phone: profile.phone,
            bio: profile.bio,
          },
          selectedFile!
        );
        setHasProfile(true);
        toast.success("Profile created successfully");
      }
      setSelectedFile(null);
      setRemoveDocument(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchTutorProfile();
      setEditMode(false);
      setFormErrors({});
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      toast.error(error?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setSelectedFile(null);
    setRemoveDocument(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setEditMode(false);
    setPhoneError(null);
    setFormErrors({});
  };

  const getStatusBadge = () => {
    if (profile.approvalStatus === "approved") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">
          <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approved
        </Badge>
      );
    } else if (profile.approvalStatus === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">
          <XCircle className="mr-1 h-3.5 w-3.5" /> Rejected
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">
          <Clock className="mr-1 h-3.5 w-3.5" /> Pending Approval
        </Badge>
      );
    }
  };

  function getFileName(url: string) {
    if (!url) return "Unknown Document";
    const parts = url.split('/');
    return parts[parts.length - 1] || "Unknown Document";
  }

  const isImage = () => {
    return profile.verificationDocUrl?.match(/\.(jpeg|jpg|png)$/i);
  };

  const handleViewDocument = () => {
    console.log("handleViewDocument: Opening modal, presignedUrl:", presignedUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("handleCloseModal: Closing modal");
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
        <Header />
        <div className="flex">
          <Sidebar sidebarOpen={sidebarOpen} />
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
            <div className="flex h-[80vh] items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin"></div>
                <p className="mt-4 text-violet-700 font-medium">Loading profile...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!hasProfile && !editMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
        <Header />
        <div className="flex">
          <Sidebar sidebarOpen={sidebarOpen} />
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} p-4 md:p-8 flex items-center justify-center`}>
            <div className="container mx-auto max-w-lg text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-4">
                Tutor Profile
              </h1>
              <Card className="border-violet-100 shadow-md">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50">
                  <CardTitle className="text-violet-800">No Profile Found</CardTitle>
                  <CardDescription className="text-violet-600">
                    You haven't created your tutor profile yet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-8">
                  <div className="flex flex-col items-center space-y-4">
                    <User className="h-16 w-16 text-violet-300" />
                    <p className="text-violet-600 max-w-md">
                      Create your professional profile to showcase your expertise and connect with students.
                    </p>
                    <Button
                      onClick={() => setEditMode(true)}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-lg px-8 py-3 rounded-lg"
                      aria-label="Add tutor profile data"
                    >
                      <Edit className="mr-2 h-5 w-5" />
                      Add Profile Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
      <Header />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} p-4 md:p-8`}>
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">
                  Tutor Profile
                </h1>
                <p className="text-violet-600">Manage your professional profile information</p>
              </div>
              {!editMode && hasProfile && (
                <Button
                  onClick={() => setEditMode(true)}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  aria-label="Edit tutor profile"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            {profile.approvalStatus === "rejected" && profile.rejectionReason && (
              <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-800 font-medium">Your profile verification was rejected</AlertTitle>
                <AlertDescription className="text-red-700">
                  Reason: {profile.rejectionReason}
                </AlertDescription>
              </Alert>
            )}

            {profile.approvalStatus === "pending" && (
              <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
                <Clock className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-800 font-medium">Your profile is pending approval</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Our team is reviewing your profile. You'll be notified once the review is complete.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Overview Card */}
                <Card className="border-violet-100 shadow-sm md:col-span-1">
                  <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-violet-800">Overview</CardTitle>
                      {hasProfile && getStatusBadge()}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 border-4 border-violet-200">
                      <AvatarImage src="/placeholder.svg?height=96&width=96&text=T" alt="Tutor" />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl">
                        {profile.name?.charAt(0) || "T"}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-bold text-violet-900">{profile.name || "Your Name"}</h2>
                    {renderSpecializationChips(profile.specialization)}

                    <Separator className="my-6 bg-violet-200" />

                    <div className="w-full space-y-4">
                      {hasProfile && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-violet-700 font-medium">Status:</span>
                            <span className="text-violet-900">
                              {profile.approvalStatus === "approved"
                                ? "Approved"
                                : profile.approvalStatus === "rejected"
                                ? "Rejected"
                                : "Pending"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-violet-700 font-medium">Role:</span>
                            <span className="text-violet-900">Tutor</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-violet-700 font-medium">Documents:</span>
                            {urlLoading ? (
                              <span className="text-violet-900">
                                <Loader2 className="inline h-4 w-4 animate-spin" /> Loading...
                              </span>
                            ) : profile.verificationDocUrl && !removeDocument ? (
                              <Button
                                type="button"
                                variant="link"
                                className="text-violet-600 hover:underline p-0 h-auto"
                                onClick={handleViewDocument}
                                aria-label="View verification document"
                              >
                                View Document
                              </Button>
                            ) : (
                              <span className="text-violet-900">None</span>
                            )}
                          </div>
                        </>
                      )}
                      {editMode && !hasProfile && (
                        <p className="text-sm text-violet-600 text-center">
                          Complete your profile to get started as a tutor on our platform.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Details Card */}
                <Card className="border-violet-100 shadow-sm md:col-span-2">
                  <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                    <CardTitle className="text-violet-800">
                      {!hasProfile ? "Create Profile" : "Profile Details"}
                    </CardTitle>
                    <CardDescription className="text-violet-600">
                      {editMode
                        ? hasProfile
                          ? "Edit your profile information"
                          : "Complete your tutor profile"
                        : "Your professional information"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-violet-700">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-violet-500" />
                        <Input
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          className={`pl-10 border-violet-200 focus:border-violet-400 focus:ring-violet-400 ${formErrors.name ? "border-red-500" : ""}`}
                          disabled={!editMode}
                          required
                          aria-required="true"
                          aria-describedby="name-error"
                        />
                      </div>
                      {formErrors.name && (
                        <p id="name-error" className="text-xs text-red-500">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-violet-700">
                        Specialization
                      </Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-violet-500" />
                        <Input
                          id="specialization"
                          name="specialization"
                          value={profile.specialization}
                          onChange={handleInputChange}
                          placeholder="e.g., Mathematics, Physics, Computer Science"
                          className={`pl-10 border-violet-200 focus:border-violet-400 focus:ring-violet-400 ${formErrors.specialization ? "border-red-500" : ""}`}
                          disabled={!editMode}
                          required
                          aria-required="true"
                          aria-describedby="specialization-error"
                        />
                      </div>
                      {editMode && (
                        <div className="mt-2">
                          {renderSpecializationChips(profile.specialization)}
                        </div>
                      )}
                      {formErrors.specialization && (
                        <p id="specialization-error" className="text-xs text-red-500">
                          {formErrors.specialization}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-violet-700">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-violet-500" />
                        <Input
                          id="phone"
                          name="phone"
                          value={profile.phone}
                          onChange={handleInputChange}
                          placeholder="Your phone number (e.g., +1-123-456-7890)"
                          className={`pl-10 border-violet-200 focus:border-violet-400 focus:ring-violet-400 ${formErrors.phone || phoneError ? "border-red-500" : ""}`}
                          disabled={!editMode}
                          required
                          aria-required="true"
                          aria-describedby="phone-error"
                        />
                      </div>
                      {(formErrors.phone || phoneError) && (
                        <p id="phone-error" className="text-xs text-red-500">
                          {formErrors.phone || phoneError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-violet-700">
                        Professional Bio
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profile.bio}
                        onChange={handleInputChange}
                        placeholder="Tell students about your background, experience, and teaching style..."
                        className={`min-h-[150px] border-violet-200 focus:border-violet-400 focus:ring-violet-400 ${formErrors.bio ? "border-red-500" : ""}`}
                        disabled={!editMode}
                        aria-describedby="bio-error"
                      />
                      {editMode && (
                        <p className="text-xs text-violet-500">
                          A compelling bio helps students understand your expertise and teaching approach.
                        </p>
                      )}
                      {formErrors.bio && (
                        <p id="bio-error" className="text-xs text-red-500">
                          {formErrors.bio}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="document-upload" className="text-violet-700">
                        Verification Document 
                      </Label>

                      {editMode && hasProfile && profile.verificationDocUrl && !removeDocument ? (
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-violet-500" />
                          <span className="text-sm text-violet-600">{getFileName(profile.verificationDocUrl)}</span>
                          {presignedUrl && (
                            <Button
                              type="button"
                              variant="link"
                              className="text-violet-600 hover:underline p-0 h-auto"
                              onClick={handleViewDocument}
                              aria-label="View current verification document"
                            >
                              View
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 p-0 h-auto"
                            onClick={handleRemoveDocument}
                            aria-label="Remove current verification document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : editMode && hasProfile && !profile.verificationDocUrl && !removeDocument ? (
                        <p className="text-sm text-violet-600">No document uploaded.</p>
                      ) : null}
                      {editMode && (
                        <>
                          <Input
                            id="document-upload"
                            type="file"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className={`border-violet-200 focus:border-violet-400 focus:ring-violet-400 ${formErrors.document ? "border-red-500" : ""}`}
                            disabled={saving}
                            aria-describedby="document-upload-error"
                          />
                          <p className="text-xs text-violet-500">
                            Accepted formats: PDF, JPG, PNG. Maximum size: 5MB.
                          </p>
                        </>
                      )}
                      {selectedFile && (
                        <p className="text-sm text-violet-600">Selected file: {selectedFile.name}</p>
                      )}
                      {removeDocument && !selectedFile && (
                        <p className="text-sm text-violet-600">Current document removed. Please upload a new one.</p>
                      )}
                      {formErrors.document && (
                        <p id="document-upload-error" className="text-xs text-red-500">
                          {formErrors.document}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  {editMode && (
                    <CardFooter className="border-t border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="border-violet-200 text-violet-700 hover:bg-violet-100"
                        disabled={saving}
                        aria-label="Cancel profile edits"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                        disabled={saving || !!Object.keys(formErrors).length}
                        aria-label={hasProfile ? "Save profile changes" : "Create profile"}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {hasProfile ? "Saving Changes..." : "Creating Profile..."}
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {hasProfile ? "Save Profile" : "Create Profile"}
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </form>

            {isModalOpen && presignedUrl && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-labelledby="document-modal-title" aria-modal="true">
                <Card className="bg-white dark:bg-gray-800 max-w-3xl w-full mx-4 max-h-[80vh] overflow-auto border-violet-100 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 flex justify-between items-center">
                    <CardTitle id="document-modal-title" className="text-violet-800">
                      Verification Document
                    </CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseModal}
                      className="text-violet-600 hover:text-violet-800 p-1"
                      aria-label="Close document modal"
                    >
                      <XCircle className="h-6 w-6" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isImage() ? (
                      <img
                        src={presignedUrl}
                        alt="Verification document"
                        className="w-full h-auto max-h-[60vh] object-contain"
                        onError={() => toast.error("Failed to load document image")}
                      />
                    ) : (
                      <iframe
                        src={presignedUrl}
                        title="Verification document"
                        className="w-full h-[60vh] border-0"
                        onError={() => toast.error("Failed to load document PDF")}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}