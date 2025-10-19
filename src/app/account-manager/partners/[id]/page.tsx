import TopBar from "components/partner/cards/TopBar"
import RecentApplications from "components/partner/Applications/RecentApplications"


interface PartnerPageProps {
  params: {
    id: string;
  };
}

export default function PartnerPage({ params }: PartnerPageProps) {
  return (
    <section className="min-[100vh]">

      <TopBar params={params} />

      <RecentApplications/>

    </section>
  );
}