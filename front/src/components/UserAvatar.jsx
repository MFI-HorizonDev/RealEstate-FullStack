import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/services/api/useAuth';

/**
 * Reusable UserAvatar component that displays user profile picture
 * and automatically updates when profile changes
 */
export const UserAvatar = ({ 
  size = 'default',
  className = '',
  showImage = true,
}) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const initials = `${user.first_name?.[0] || user.username?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  
  // Handle both absolute and relative image URLs
  let profileImage = user.profile?.profile_image;
  if (profileImage && !profileImage.startsWith('http')) {
    profileImage = `http://localhost:8000${profileImage}`;
  }

  // Use the user data's profile image
  const hasImage = showImage && profileImage;

  return (
    <Avatar size={size} className={className}>
      {hasImage ? (
        <AvatarImage 
          src={profileImage} 
          alt={user.username}
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      ) : null}
      <AvatarFallback className="bg-blue-600 text-white font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
