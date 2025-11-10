import RecentApplications from "components/partner/applications/RecentApplications"
import PartnerDetails from "components/partner/cards/PartnerDetails"
import PartnerStudentsList from "components/partner/applications/PartnerStudentsList"


interface PartnerPageProps {
  params: {
    id: string;
  };
}

export default function PartnerPage({ params }: PartnerPageProps) {
  return (
    <section className="min-[100vh]">

      <PartnerDetails params={params} />

      <RecentApplications/>

      <PartnerStudentsList/>

    </section>
  );
}