"use client";
import React, { useEffect, useState } from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky z-40 flex flex-wrap items-center justify-between rounded-md bg-brand-50/10 p-2 backdrop-blur-xl transition-all duration-300 ${
        isScrolled ? "top-0" : "top-4"
      }`}
    >
      <div className="ml-[6px] flex flex-col">
        <div className="flex items-center text-sm sm:text-base">
          <a href="#" className="text-text-secondary no-underline">
            Pages
          </a>
          <span className="mx-1">/</span>
          <NavLink
            href="#"
            className="capitalize text-text-secondary no-underline font-normal"
          >
            {brandText}
          </NavLink>
        </div>

        <p className="shrink text-lg font-bold capitalize sm:text-2xl lg:text-3xl">
          <NavLink
            href="#"
            className="font-bold text-text-primary no-underline capitalize"
          >
            {brandText}
          </NavLink>
        </p>
      </div>

      <div className="relative mt-3 flex w-fit max-w-full flex-row items-center gap-4 rounded-full border border-default bg-card px-2 py-2">
        <span
          className="flex h-5 w-5 cursor-pointer items-center justify-center xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5 text-text-muted" />
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

          <div className="flex mt-[20px] py-5 px-4 w-56 flex-col justify-start rounded-[12px] border border-default bg-card bg-cover bg-no-repeat shadow-sm text-sm">
            <div className="ml-4 mt-3">
              <div className="flex items-center gap-2">
                <p className="text-text-primary font-semibold">Hey, Adela</p>
              </div>
            </div>

            <div className="border border-default mt-2 h-px w-full" />

            <div className="ml-4 mt-3 flex flex-col text-text-primary font-normal">
              <a
                href="#"
                className="text-text-primary no-underline transition-colors duration-200 hover:text-text-primary"
              >
                Profile Settings
              </a>
              <a
                href="#"
                className="mt-3 text-red-600 no-underline transition-colors duration-200 hover:text-red-700"
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
