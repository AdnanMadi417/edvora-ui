import type { IconType } from "react-icons";

export interface IRoute {
  name: string;
  layout: string;
  path: string;
  icon: IconType;
  children?: IRoute[];
}
