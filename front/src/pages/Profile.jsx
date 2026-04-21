import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/services/api/useAuth';
import { useUserProfile, useUploadProfileImage, useUpdateProfile } from '@/services/api/useProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Shield, Calendar, Camera, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from 'sonner';
import ImageCropperModal from '@/components/ImageCropperModal';

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
    email: user?.email || '',
    bio: profile?.profile?.bio || '',
    phone_number: profile?.profile?.phone_number || '',
    address: profile?.profile?.address || '',
    city: profile?.profile?.city || '',
    state: profile?.profile?.state || '',
    country: profile?.profile?.country || '',
    zipcode: profile?.profile?.zipcode || '',
  });

  useEffect(() => {
    if (!profile) return;
    setProfileFormData({
      email: profile?.email || user?.email || '',
      bio: profile?.profile?.bio || '',
      phone_number: profile?.profile?.phone_number || '',
      address: profile?.profile?.address || '',
      city: profile?.profile?.city || '',
      state: profile?.profile?.state || '',
      country: profile?.profile?.country || '',
      zipcode: profile?.profile?.zipcode || '',
    });
  }, [profile, user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const initials = `${user.first_name?.[0] || user.username?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  
  // Handle both absolute and relative image URLs
  let profileImage = profile?.profile?.profile_image;
  if (profileImage && !profileImage.startsWith('http')) {
    profileImage = `http://localhost:8000${profileImage}`;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Image size must be less than 5MB',
          duration: 3000,
        });
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)',
          duration: 3000,
        });
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
        toast.success('✓ Profile picture updated successfully!', {
          description: 'Your new profile picture is now live.',
          duration: 3000,
        });
        setShowImageCropper(false);
        setSelectedImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Refetch profile data to get the updated image URL
        setTimeout(() => {
          refetch();
        }, 500);
      },
      onError: (error) => {
        toast.error('Failed to upload image', {
          description: error.message || 'Please try again.',
          duration: 3000,
        });
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

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(profileFormData).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });
    try {
      await updateProfile.mutateAsync(formData);
      toast.success("Profile updated successfully.");
      setIsEditingProfile(false);
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Profile</h1>
        <p className="mt-2 text-lg text-gray-500">Manage your personal information and security settings.</p>
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
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadProfileImage.isPending}
              />
            </div>
            {uploadProfileImage.isPending && (
              <p className="text-sm text-blue-200 mb-2">Uploading image...</p>
            )}
            <CardTitle className="text-white text-2xl font-bold">
              {user.first_name} {user.last_name}
            </CardTitle>
            <CardDescription className="text-blue-200 font-medium">@{user.username}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-10">
            <div className="flex flex-wrap gap-2 justify-center">
              {user.groups?.map(group => (
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
        <Card className="md:col-span-2 shadow-sm border border-gray-100">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="text-xl font-bold text-gray-900">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                  <p className="text-gray-900 font-semibold text-lg">
                    {user.first_name || 'Not provided'} {user.last_name || ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-gray-900 font-semibold text-lg">{user.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                {!isEditingProfile ? (
                  <Button type="button" variant="outline" onClick={() => setIsEditingProfile(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileFormData.email}
                        onChange={handleProfileFormChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={profileFormData.bio}
                        onChange={handleProfileFormChange}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
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
