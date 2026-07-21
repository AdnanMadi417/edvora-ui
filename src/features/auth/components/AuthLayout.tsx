import logoImg from "/public/img/brand/Primary-Logo-Blue.png";
import Image from "next/image";

export default function AuthLayout({ children, hideLogo }: { children: React.ReactNode; hideLogo?: boolean }) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] rounded-2xl bg-white shadow-sm border border-slate-200 py-8 px-7">

        {!hideLogo && (
          <div className="flex justify-center mb-7">
            <a href="https://www.unibexs.com" target="_blank" rel="noopener noreferrer">
              <Image
                src={logoImg}
                alt="Unibexs"
                width={130}
                height={44}
                className="object-contain"
                priority
              />
            </a>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
