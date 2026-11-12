"use client";

import React from "react";
import ProfileDetails from "features/partners/components/partner/PartnerProfile";
import { useMe } from "hooks/useMe";

const Profile: React.FC = () => {
  const { user, loading, error } = useMe();

  if (loading) return <p>Loading profile...</p>;
  if (error)
    return <p className="text-ub-tone-danger-text">Failed to load profile: {error}</p>;

  if (!user) return <p>No user found</p>;

  return <ProfileDetails id={user.id} />;
};

export default Profile;
