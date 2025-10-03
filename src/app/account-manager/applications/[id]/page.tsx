import Details from "components/applications/details/Details";
import ApplicationDocuments from "components/applications/details/ApplicationDocuments";
// import ApplicationAccountManagerTopBar from "components/applications/topBar/ApplicationAccountManagerTopBar";

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
