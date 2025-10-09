import Details from "../../../../components/applications/details/account-manager/Details";
import ApplicationDocuments from "../../../../components/applications/details/account-manager/ApplicationDocuments";
import TimeLine from "components/applications/timeLine/TimeLine";

interface ApplicationPageProps {
  params: {
    id: string;
  };
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  return (
    <section className="min-[100vh]:">
      <Details params={params} />
      <ApplicationDocuments params={params} />
      <TimeLine params={params} />
    </section>
  );
}