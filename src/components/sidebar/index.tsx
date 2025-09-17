/* eslint-disable */

import { HiX } from 'react-icons/hi';
import Links from './components/Links';
import logoImg from '/public/img/brand/Primary-Logo-Blue.png';
import { IRoute } from 'types/navigation';
import Image from "next/image";


function SidebarHorizon(props: { routes: IRoute[]; [x: string]: any }) {
  const { routes, open, setOpen } = props;

  return (
      <div
          className={`duration-175 linear fixed !z-50 flex min-h-full flex-col pb-10 shadow-2xl shadow-white/5 transition-all xl:!z-0 ${
              open ? "translate-x-0" : "-translate-x-96 xl:translate-x-0"
          }`}
          style={{
            backgroundColor: "var(--primary-bg)",
            color: "var(--primary-text-color)",
          }}
      >
        {/* Close Button (mobile only) */}
        <span
            className="absolute right-4 top-4 block cursor-pointer xl:hidden"
            onClick={() => setOpen(false)}
        >
        <HiX style={{ color: "var(--secondary-text-color)" }} />
      </span>

        {/* Logo / Brand Name */}
        <div className="mx-[56px] mt-[50px] flex items-center">
          <div
              className="ml-1 mt-1 font-poppins text-[26px] font-bold uppercase"
              style={{ color: "var(--accent-color)" }}
          >
            {/* Replace with your actual company name or logo */}


              <Image
                  src={logoImg}
                  alt="Company Logo"
                  width={400}
                  height={100}
                  className="max-w-[160px] max-h-[80px] object-contain"
                  priority
              />


          </div>
        </div>

        {/* Divider */}
        <div
            className="mb-7 mt-[58px] h-px"
            style={{ backgroundColor: "var(--border-color)" }}
        />

        {/* Nav items */}
        <ul className="mb-auto pt-1">
          <Links routes={routes} />
        </ul>
      </div>
  );
}

export default SidebarHorizon;
