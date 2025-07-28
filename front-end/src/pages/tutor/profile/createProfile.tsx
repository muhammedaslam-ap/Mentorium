// src/pages/CreateTutorProfile.tsx
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tutorService } from "@/services/tutorServices/tutorService";
import { useNavigate } from "react-router-dom";

interface TutorProfile {
  tutorId: string;
  name: string;
  specialization: string;
  phone: string;
  bio: string;
}

interface ProfileData {
  name: string;
  specialization: string;
  phone: string;
  bio?: string;
}

export default function CreateTutorProfile() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<TutorProfile>({
    tutorId: "",
    name: "",
    specialization: "",
    phone: "",
    bio: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Set tutorId from localStorage on component mount
  useEffect(() => {
   const tutorId = localStorage.getItem("tutorId");
    if (tutorId) {
    setProfile((prev) => ({ ...prev, tutorId }));
    } else {
    toast.error("No tutor ID found. Please log in again.");
    navigate("/auth");
    }
  }, [navigate]);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\(\)-+]/g, "");
    return /^\d{10,15}$/.test(cleaned);
  };

  const validateName = (name: string): string | null => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    if (name.trim().length > 100) return "Name must be under 100 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return "Name can only contain letters, spaces, apostrophes, or hyphens";
    return null;
  };

  const validateSpecialization = (specialization: string): string | null => {
    const specializations = specialization
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    if (specializations.length === 0) return "At least one specialization required";
    if (specializations.some((s) => s.length < 2)) return "Each specialization must be at least 2 characters";
    if (specializations.length > 5) return "Maximum 5 specializations allowed";
    return null;
  };

  const validateBio = (bio: string): string | null => {
    if (bio.length > 1000) return "Bio must be under 1000 characters";
    if (bio && bio.trim().length < 10) return "Bio must be at least 10 characters if provided";
    return null;
  };

  const validateFile = (file: File | null): string | null => {
    if (!file) return "Please upload a verification document";
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return "File size exceeds 5MB";
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      return "Upload PDF, JPG, or PNG only";
    }
    return null;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const nameError = validateName(profile.name);
    if (nameError) errors.name = nameError;

    const specializationError = validateSpecialization(profile.specialization);
    if (specializationError) errors.specialization = specializationError;

    if (!validatePhoneNumber(profile.phone)) {
      errors.phone = "Phone number must be 10-15 digits";
    }

    const bioError = validateBio(profile.bio);
    if (bioError) errors.bio = bioError;

    const fileError = validateFile(selectedFile);
    if (fileError) errors.document = fileError;

    if (!profile.tutorId) {
      errors.tutorId = "Tutor ID is missing. Please log in again.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    
    if (name === "phone") {
      setPhoneError(validatePhoneNumber(value) ? null : "Invalid phone number format");
    } else if (name === "name") {
      setFormErrors((prev) => ({ ...prev, name: validateName(value) || "" }));
    } else if (name === "specialization") {
      setFormErrors((prev) => ({ ...prev, specialization: validateSpecialization(value) || "" }));
    } else if (name === "bio") {
      setFormErrors((prev) => ({ ...prev, bio: validateBio(value) || "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileError = validateFile(file);
      if (fileError) {
        toast.error(fileError);
        setFormErrors((prev) => ({ ...prev, document: fileError }));
        return;
      }
      setSelectedFile(file);
      setFormErrors((prev) => ({ ...prev, document: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);
    try {
      const profileData: ProfileData = {
        name: profile.name,
        specialization: profile.specialization,
        phone: profile.phone,
        bio: profile.bio || undefined, // Handle optional bio
      };
      console.log("Sending profile data:", { tutorId: profile.tutorId, profileData, selectedFile }); // Debug input
      const result = await tutorService.createProfileDirect(profile.tutorId, profileData, selectedFile!);
      console.log("Profile creation result:", result); // Debug returned data
      toast.success("Profile created successfully!");
      setProfile((prev) => ({
        tutorId: prev.tutorId,
        name: "",
        specialization: "",
        phone: "",
        bio: "",
      }));
      setSelectedFile(null);
      localStorage.removeItem("tutorId");
      navigate("/auth");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      console.error("Submission failed:", error.response?.data || error.message || error);
      toast.error(error?.message || "Failed to create profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-violet-700 mb-2">
          Create Tutor Profile
        </h1>
        <p className="text-sm text-violet-500 mb-6">
          Provide accurate details and a valid document.
        </p>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Create Profile</CardTitle>
              <CardDescription>
                This information will appear to students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Math, Physics, Chemistry"
                  className={formErrors.specialization ? "border-red-500" : ""}
                />
                {formErrors.specialization && (
                  <p className="text-xs text-red-500">
                    {formErrors.specialization}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., +91-9876543210"
                  className={
                    formErrors.phone || phoneError ? "border-red-500" : ""
                  }
                />
                {(formErrors.phone || phoneError) && (
                  <p className="text-xs text-red-500">
                    {formErrors.phone || phoneError}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  placeholder="Tell students about yourself (minimum 10 characters)"
                  className={formErrors.bio ? "border-red-500" : ""}
                />
                {formErrors.bio && (
                  <p className="text-xs text-red-500">{formErrors.bio}</p>
                )}
                {profile.bio && (
                  <p className="text-xs text-muted">
                    {profile.bio.length}/1000 characters
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="document">Verification Document</Label>
                <Input
                  id="document"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={saving}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={formErrors.document ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted">
                  PDF, JPG, or PNG — max 5MB
                </p>
                {selectedFile && (
                  <p className="text-sm text-violet-600">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                {formErrors.document && (
                  <p className="text-xs text-red-500">
                    {formErrors.document}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}