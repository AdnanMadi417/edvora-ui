"use client";

import { HiX } from 'react-icons/hi';
import Links from './components/Links';
import { MdLogout } from "react-icons/md";
import logoImg from '/public/img/brand/Primary-Logo-Blue.png';
import { IRoute } from 'types/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  routes: IRoute[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

function SidebarHorizon({ routes, open, setOpen }: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/admin/sign-in");
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--primary-bg)',
        color: 'var(--primary-text-color)',
        width: '300px',
        borderRight: 'var(--border-thin) solid var(--border-color)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '2.5rem',
        transition: 'transform 0.175s linear',
        transform: open ? 'translateX(0)' : '-24rem',
      }}
    >

      <button
        onClick={() => setOpen(false)}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem',
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
        <HiX style={{ color: 'var(--secondary-text-color)', fontSize: 'var(--icon-size-b)' }} />
      </button>

      <div style={{ margin: '1rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
        <Image
          src={logoImg}
          alt="Company Logo"
          width={160}
          height={80}
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>

      <div style={{ margin: '2rem 1.5rem 1.75rem', height: '1px', backgroundColor: 'var(--border-color)' }} />

      <nav style={{ flexGrow: 1, overflowY: 'auto', width: '100%', paddingBottom: '2rem' }} role="navigation" aria-label="Main navigation">
        <Links routes={routes} />
      </nav>

      <div
        onClick={handleLogout}
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
          padding: "0.5rem 1rem",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--error-text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--muted-text-color)";
        }}
      >
        <MdLogout style={{ fontSize: "var(--icon-size-b)" }} />
        <span>Logout</span>
      </div>
    </div>
  );
}

export default SidebarHorizon;
