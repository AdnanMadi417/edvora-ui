import Card from "components/ub/data/Card";
import { cardPadding, iconTints } from "components/ub/recipes";

/** StatCard-style widget (brief §4.4): label with icon, value in data-lg tabular numerals. */
const Widget = (props: {
  icon: JSX.Element;
  title: string;
  subtitle: string;
}) => {
  const { icon, title, subtitle } = props;
  return (
    <Card extra={`!flex-row flex-grow items-center gap-4 ${cardPadding}`}>
      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-ub-md [&_svg]:h-6 [&_svg]:w-6 ${iconTints.blue}`}
        aria-hidden="true"
      >
        {icon}
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-1">
        <p className="text-ub-label-md text-ub-text-secondary">{title}</p>
        <p className="ub-tabular truncate text-ub-data-lg text-ub-text-primary">{subtitle}</p>
      </div>
    </Card>
  );
};

export default Widget;
