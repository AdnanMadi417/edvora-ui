import LanguageCenterDetails from "features/universities/language-centers/LanguageCenterDetails";
export default async function LanguageCenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LanguageCenterDetails id={id} basePath="/admin" />;
}
