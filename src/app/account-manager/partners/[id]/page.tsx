import PartnerDetails from "components/partner/cards/PartnerDetails"


interface PartnerPageProps {
  params: {
    id: string;
  };
}

export default function PartnerPage({ params }: PartnerPageProps) {
  return (
    <section className="min-[100vh]">

      <PartnerDetails params={params} />

    </section>
  );
}