import { HiX } from 'react-icons/hi';
import Links from './components/Links';
import { MdLogout } from "react-icons/md";
import logoImg from '/public/img/brand/Primary-Logo-Blue.png';
import { IRoute } from 'types/navigation';
import Image from 'next/image';

interface SidebarProps {
  routes: IRoute[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

function SidebarHorizon({ routes, open, setOpen }: SidebarProps) {
  return (
    <div
      className={`duration-175 linear fixed !z-50 flex min-h-full flex-col pb-10 transition-all xl:!z-0 ${
        open ? 'translate-x-0' : '-translate-x-96 xl:translate-x-0'
      }`}
      style={{
        backgroundColor: 'var(--primary-bg)',
        color: 'var(--primary-text-color)',
        width: '300px',
        borderRight: 'var(--border-thin) solid var(--border-color)',
      }}
    >
      <button
        className="absolute right-4 top-4 block cursor-pointer rounded-md p-2 hover:bg-opacity-10 xl:hidden"
        onClick={() => setOpen(false)}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          transition: 'var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--card-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Close sidebar"
      >
        <HiX
          style={{
            color: 'var(--secondary-text-color)',
            fontSize: 'var(--icon-size-b)',
          }}
        />
      </button>

      <div
        className="mx-6 mt-6 flex items-center justify-center"
        style={{ padding: '1rem 0' }}
      >
        <Image
          src={logoImg}
          alt="Company Logo"
          width={400}
          height={100}
          className="max-h-[80px] max-w-[160px] object-contain"
          priority
        />
      </div>

      <div
        className="mx-6 mb-7 mt-8 h-px"
        style={{ backgroundColor: 'var(--border-color)' }}
      />

      <nav
        className="mb-auto flex-1 overflow-y-auto pt-1"
        style={{
          width: '100%',
          paddingBottom: '2rem',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <Links routes={routes} />
      </nav>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "var(--font-size-p1)",
          color: "var(--muted-text-color)",
          textAlign: "start",
          marginLeft: "20px",
          cursor: "pointer",
          transition: "var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--error-text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--muted-text-color)";
        }}
      >
        <MdLogout style={{ fontSize: "var(--icon-size)" }} />
        <span>Logout</span>
      </div>

    </div>
  );
}

export default SidebarHorizon;
