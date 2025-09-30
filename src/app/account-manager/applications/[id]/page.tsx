import Details from "components/applications/details/Details";

interface ApplicationPageProps {
  params: {
    id: string;
  };
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  return <Details params={params} />;
}
