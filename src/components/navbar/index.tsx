import React from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify,  } from "react-icons/fi";
import NavLink from "components/link/NavLink";
import Image from "next/image";
import avatar from "/public/img/avatars/avatar4.png";

const Navbar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
  [x: string]: any;
}) => {
  const { onOpenSidenav, brandText } = props;

  return (
    <nav className="sticky top-4 z-40 flex flex-wrap items-center justify-between rounded-md bg-brand-50/10 p-2 backdrop-blur-xl">
      <div className="ml-[6px] flex flex-col">
        <div className="flex items-center text-p2 sm:text-base">
          <a
            href="#"
            className="text-gray-600"
            style={{
              textDecoration: "none",
              color: "var(--primary-text-color)",
              fontSize: "var(--font-size-p2)",
            }}
          >
            Pages
          </a>
          <span className="mx-1">/</span>
          <NavLink
            href="#"
            className="capitalize"
            style={{
              color: "var(--primary-text-color)",
              fontSize: "var(--font-size-p2)",
              textDecoration: "none",
              fontWeight: 400,
            }}
          >
            {brandText}
          </NavLink>
        </div>

        <p className="shrink text-lg font-bold capitalize sm:text-2xl lg:text-3xl">
          <NavLink
            href="#"
            style={{
              fontWeight: "bold",
              color: "var(--primary-text-color)",
              textDecoration: "none",
              textTransform: "capitalize",
            }}
          >
            {brandText}
          </NavLink>
        </p>
      </div>

      <div
        className=" relative mt-3 flex w-fit max-w-full flex-row items-center gap-4 rounded-full border border-default bg-card px-2 py-2"
      >

        <span
          className="flex h-5 w-5 cursor-pointer items-center justify-center text-p1 xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5 text-text-muted " />
        </span>

        <Dropdown
          button={
            <div className="flex cursor-pointer items-center gap-2">
              <Image
                width="40"
                height="40"
                className="h-10 w-10 rounded-full"
                src={avatar}
                alt="Profile"
              />
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        >
          <div className="shadow-shadow-500 flex h-48 w-56 flex-col justify-start rounded-[20px] bg-card bg-cover bg-no-repeat shadow-xl  text-p2">
            <div className="ml-4 mt-3">
              <div className="flex items-center gap-2">
                <p
                  className="text-text-primary font-semibold"
                >
                  Hey, Adela
                </p>
              </div>
            </div>

            <div className="bg-primary mt-3 h-px w-full" />

            <div
              className="ml-4 mt-3 flex flex-col text-text-primary font-normal ">
              <a
                href="#"
                className="transition-colors duration-200 hover:text-[var(--accent-hover)]"
              >
                Profile Settings
              </a>
              <a
                href="#"
                className="mt-3 text-text-error transition-colors duration-200 hover:text-[var(--failed-color-hover)]"
              >
                Log Out
              </a>
            </div>
          </div>
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
