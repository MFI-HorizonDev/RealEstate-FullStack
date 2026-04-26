import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from "@/hooks/api/authentication/useAuth";
import { useUserProfile } from "@/hooks/api/profile/UseGetProfile";
import { useUploadProfileImage } from "@/hooks/api/profile/UseUploadProfile";
import { useUpdateProfile } from "@/hooks/api/profile/UseUpdateProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Camera } from "lucide-react";
import { notify } from "@/lib/notifications";
import ImageCropperModal from '@/components/ImageCropperModal';
import { BASE_URL } from "@/hooks/api/config";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, refetch } = useUserProfile();
  const uploadProfileImage = useUploadProfileImage();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef(null);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [profileFormData, setProfileFormData] = useState({
    email: '',
  });

  useEffect(() => {
    if (!profile) return;
    setProfileFormData({
      email: profile?.email || user?.email || '',
    });
  }, [profile, user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  const displayFirstName = profile?.first_name || user.first_name;
  const displayLastName = profile?.last_name || user.last_name;
  const displayEmail = profile?.email || user.email;
  const displayGroups = profile?.groups || user.groups || [];

  const initials = `${user.first_name?.[0] || user.username?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  
  // Handle both absolute and relative image URLs
  let profileImage = profile?.profile?.profile_image;
  if (profileImage && !profileImage.startsWith('http')) {
    profileImage = `${BASE_URL}${profileImage}`;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        notify.error('File too large. Image size must be less than 5MB.');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        notify.error('Invalid file type. Please upload a valid image file (JPG, PNG, GIF, or WebP).');
        return;
      }

      // Show image cropper instead of uploading immediately
      setSelectedImageFile(file);
      setShowImageCropper(true);
    }
  };

  const handleCropComplete = (croppedBlob) => {
    // Create a File object from the cropped blob
    const croppedFile = new File([croppedBlob], 'profile-picture.jpg', {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    // Upload the cropped image
    uploadProfileImage.mutate(croppedFile, {
      onSuccess: () => {
        notify.success('Profile picture updated successfully!');
        setShowImageCropper(false);
        setSelectedImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Notify other components to refresh
        window.dispatchEvent(new Event('profile-updated'));
        // Refetch profile data to get the updated image URL
        setTimeout(() => {
          refetch();
        }, 500);
      },
      onError: (error) => {
        notify.error(error.message || 'Failed to upload image. Please try again.');
        setShowImageCropper(false);
        setSelectedImageFile(null);
      },
    });
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    updateProfile.mutate({
      email: profileFormData.email || "",
    }, {
      onSuccess: () => {
        notify.success("Profile updated successfully.");
        setIsEditingProfile(false);
        // Notify other components to refresh
        window.dispatchEvent(new Event('profile-updated'));
        refetch();
      },
      onError: (error) => {
        notify.apiError(error, "Failed to update profile.");
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Account Profile</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="md:col-span-1 shadow-md border-0 bg-blue-900 text-white overflow-hidden relative">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="flex justify-center mb-6 relative">
              <div className="relative h-24 w-24">
                <Avatar key={profileImage} className="h-24 w-24 border-4 border-blue-800 shadow-xl">
                  <AvatarImage 
                    src={profileImage} 
                    alt={user.username}
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                  <AvatarFallback className="bg-amber-600 text-white text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-2 shadow-lg transition-colors z-10"
                  disabled={uploadProfileImage.isPending}
                  title="Click to upload a new profile picture"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.webp,image/jpeg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadProfileImage.isPending}
              />
            </div>
            {uploadProfileImage.isPending && (
              <p className="text-sm text-blue-200 mb-2">Uploading image...</p>
            )}
            <CardTitle className="text-white text-2xl font-bold">
              {displayFirstName} {displayLastName}
            </CardTitle>
            <CardDescription className="text-blue-200 font-medium">@{user.username}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-10">
            <div className="flex flex-wrap gap-2 justify-center">
              {displayGroups?.map(group => (
                <Badge key={group} className="bg-blue-800/50 text-white border-blue-700 hover:bg-blue-700 px-3 py-1">
                  {group}
                </Badge>
              ))}
              {user.is_superuser && (
                <Badge className="bg-amber-600 text-white border-amber-500 px-3 py-1">Super Admin</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2 shadow-sm border border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl font-bold text-foreground">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Full Name</p>
                  <p className="text-foreground font-semibold text-lg">
                    {displayFirstName || 'Not provided'} {displayLastName || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                  <p className="text-foreground font-semibold text-lg">{displayEmail || 'Not provided'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">Profile Info</p>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingProfile((v) => !v)}
                  >
                    {isEditingProfile ? "Cancel" : "Edit"}
                  </Button>
                </div>

                {isEditingProfile && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" value={profileFormData.email} onChange={handleProfileFormChange} />
                    </div>
                    <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        imageFile={selectedImageFile}
        isOpen={showImageCropper}
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setShowImageCropper(false);
          setSelectedImageFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      />
    </div>
  );
}
