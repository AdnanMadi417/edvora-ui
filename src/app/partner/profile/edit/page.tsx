"use client";

import React from "react";
import EditPartnerDetails from "features/partners/components/partner/PartnerProfileEdit";
import { useMe } from "hooks/useMe";

const EditProfile: React.FC = () => {
  const { user, loading, error } = useMe();

  if (loading) return <p>Loading profile...</p>;
  if (error)
    return <p className="text-ub-tone-danger-text">Failed to load profile: {error}</p>;

  if (!user) return <p>No user found</p>;

  return <EditPartnerDetails />;
};

export default EditProfile;
