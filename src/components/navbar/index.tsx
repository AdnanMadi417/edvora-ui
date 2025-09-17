import React from 'react';
import Dropdown from 'components/dropdown';
import { FiAlignJustify, FiSearch } from 'react-icons/fi';
import NavLink from 'components/link/NavLink';
import Image from 'next/image';
import avatar from '/public/img/avatars/avatar4.png';

const Navbar = (props: {
    onOpenSidenav: () => void;
    brandText: string;
    secondary?: boolean | string;
    [x: string]: any;
}) => {
    const { onOpenSidenav, brandText } = props;

    return (
        <nav
            className="sticky top-4 z-40 flex flex-wrap items-center justify-between rounded-xl bg-brand-50/10 p-2 backdrop-blur-xl"
        >
            {/* Left side */}
            <div className="ml-[6px] flex flex-col">
                <div className="flex items-center text-sm sm:text-base">
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

                <p className="shrink text-lg sm:text-2xl lg:text-3xl capitalize font-bold">
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

            {/* Right side */}
            <div
                className="relative mt-3 flex w-full max-w-full flex-row gap-2 rounded-full px-2 py-2"
                style={{
                    backgroundColor: "var(--primary-bg)",
                    border: "var(--border-thin) solid var(--border-color-default)",
                    width: "fit-content",
                    alignItems: "center",
                }}
            >

                {/* Toggle sidenav (only mobile) */}
                <span
                    className="flex cursor-pointer text-xl text-gray-600 sm:hidden"
                    style={{ backgroundColor: "var(--primary-bg)" }}
                    onClick={onOpenSidenav}
                >
        <FiAlignJustify
            style={{
                color: "var(--primary-text-color)",
                width: "var(--icon-size)",
                height: "var(--icon-size)",
            }}
        />
      </span>

                {/* Profile dropdown */}
                <Dropdown
                    button={

                        <div className="flex items-center gap-2 cursor-pointer">

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
                    <div className="flex h-48 w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500">

                        <div className="ml-4 mt-3">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-navy-700"
                                   style={{
                                       color: "var(--primary-text-color)",
                                       fontWeight: "bold",
                                       fontSize: "var(--font-size-p1)",
                                   }}
                                >Hey, Adela</p>
                            </div>
                        </div>

                        <div className="mt-3 h-px w-full "

                             style={{
                                 backgroundColor: "var(--primary-bg)",
                             }}
                        />

                        <div
                            className="ml-4 mt-3 flex flex-col"
                            style={{
                                color: "var(--primary-text-color)",
                                fontSize: "var(--font-size-caption)",
                            }}
                        >
                            <a
                                href="#"
                                className="transition-colors duration-200 hover:text-[var(--accent-hover)]"
                            >
                                Profile Settings
                            </a>
                            <a
                                href="#"
                                className="mt-3 font-medium text-red-500 transition-colors duration-200 hover:text-[var(--failed-color-hover)]"
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
