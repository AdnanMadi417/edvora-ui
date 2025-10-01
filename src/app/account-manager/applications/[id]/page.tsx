import Details from "components/applications/details/Details";
import ApplicationDocuments from "components/applications/details/ApplicationDocuments";

interface ApplicationPageProps {
  params: {
    id: string;
  };
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  return (
    <>
      <Details params={params} />
      <ApplicationDocuments params={params} />
    </>
  );
}
