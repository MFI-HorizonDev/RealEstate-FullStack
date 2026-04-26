import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetMyProfile } from "@/features/profile/hooks/useProfile";
import { useAuth } from "@/features/auth/context/AuthContext";
import { LoadingSpinner } from "@/shared/components/LoadingAndErrorStates";
import { Mail, Phone, MapPin, Edit, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * Profile - Display user profile with edit option
 */
export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: profile, isLoading } = useGetMyProfile();

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  const displayUser = profile || user;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your account information</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/dashboard/profile/edit")}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Edit size={18} />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            onClick={logout}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <p className="text-lg font-semibold mt-1">
                {displayUser?.first_name} {displayUser?.last_name}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Mail size={16} />
                Email
              </label>
              <p className="text-lg font-semibold mt-1">{displayUser?.email}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Phone size={16} />
                Phone
              </label>
              <p className="text-lg font-semibold mt-1">
                {displayUser?.phone || "Not provided"}
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <p className="text-lg font-semibold mt-1 capitalize">
                {(displayUser?.role || displayUser?.user_role || "customer").toLowerCase()}
              </p>
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <MapPin size={16} />
                Location
              </label>
              <p className="text-lg font-semibold mt-1">
                {displayUser?.address || "Not provided"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start" disabled>
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            Notification Preferences
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" disabled>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
