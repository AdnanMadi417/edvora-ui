'use client';

import { HiX } from 'react-icons/hi';
import { MdLogout } from 'react-icons/md';
import Links from './components/Links';
import logoImg from '/public/img/brand/Primary-Logo-Blue.png';
import { IRoute } from 'types/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function SidebarHorizon(props: { routes: IRoute[]; [x: string]: any }) {
  const { routes, open, setOpen } = props;
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push('/auth/sign-in');
  };

  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col pb-10 md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? 'translate-x-0' : '-translate-x-96 xl:translate-x-0'
      }`
    }
      style={{
        backgroundColor: 'var(--primary-bg)',
        boxShadow: '--shadow-sm',
      }}
    >
      <span
        className="absolute right-4 top-4 block cursor-pointer xl:hidden"
        onClick={() => setOpen(false)}
      >
        <HiX />
      </span>

      <div className="mx-[56px] mt-[40px] flex items-center">
        <div className="mb-5 mt-1 h-2.5 text-[26px] font-bold uppercase text-navy-700 dark:text-white">
          <div
            style={{
              margin: '0.7rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Image
              src={logoImg}
              alt="Unibexs Logo"
              width={160}
              height={80}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>
      </div>

      <div className=""
           style={{
             marginBottom: '7px',
             marginTop: '50px',
             backgroundColor: 'var(--border-color-default)',
             height: 'var(--border-thin)',
           }}
      />

      <ul className="mb-auto pt-1">
        <Links routes={routes} />
      </ul>

      <div className="mt-auto px-8">

        <button
          onClick={handleLogout}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex w-full items-center gap-2 rounded-xl px-4 py-2"
          style={{
            cursor: 'pointer',
            color: isHovered
              ? 'var(--failed-color-hover)'
              : 'var(--failed-color)',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--font-size-p1)',
            transition: 'var(--transition-medium)',
            marginLeft: isHovered ? '10px' : '0',
            padding: '0',
            margin: '0',
          }}
        >
          <MdLogout
            className=""
          />
          Logout
        </button>
      </div>

    </div>
  );
}

export default SidebarHorizon;
