"use client";

import { useParams } from "next/navigation";
import ReviewerPartnerProfile from "features/partners/components/reviewer/ReviewerPartnerProfile";

export default function ReviewerPartnerProfilePage() {
  const params = useParams();
  const id = params.id as string;

  return <ReviewerPartnerProfile id={id} />;
}
