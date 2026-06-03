"use client";

import React from "react";
import EditPartnerDetails from "features/partners/components/PartnerProfileEdit";
import { useMe } from "hooks/useMe";

const EditProfile: React.FC = () => {
  const { user, loading, error } = useMe();

  if (loading) return <p>Loading profile...</p>;
  if (error)
    return <p className="text-red-500">Failed to load profile: {error}</p>;

  if (!user) return <p>No user found</p>;

  return <EditPartnerDetails />;
};

export default EditProfile;
