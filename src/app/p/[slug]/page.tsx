import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { partnersApi } from "features/partners/services";
import PartnerPublicProfile from "features/partners/components/public/PartnerPublicProfile";
import type { PublicPartnerProfile } from "features/partners/types";

// This one page is deliberately server-rendered (every other page in this
// app is a client shell reading `useParams()`) — it's the one page meant
// to be pasted into WhatsApp/social, so link-preview metadata actually
// matters. Fetched fresh on every request: it's a live, editable profile.
//
// generateMetadata and the page component both need this data, and
// partnersApi uses axios (not the native `fetch` Next.js auto-dedupes) —
// wrapped in React's cache() so both calls within one request share a
// single network round-trip instead of firing two.
const fetchProfile = cache(async (slug: string): Promise<PublicPartnerProfile | null> => {
  try {
    const res = await partnersApi.getPublicProfile(slug);
    return res.data;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await fetchProfile(slug);
  if (!profile) return { title: "Advisor not found | Unibexs" };

  const name = profile.display_name || profile.name;
  const description =
    profile.bio?.slice(0, 160) || `Connect with ${name}, a Unibexs advisor.`;

  return {
    title: `${name} | Unibexs`,
    description,
    openGraph: {
      title: name,
      description,
      images: profile.profile_photo_file_url ? [profile.profile_photo_file_url] : undefined,
    },
    twitter: {
      card: "summary",
      title: name,
      description,
    },
  };
}

export default async function PartnerPublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await fetchProfile(slug);
  if (!profile) notFound();

  return <PartnerPublicProfile profile={profile} />;
}
