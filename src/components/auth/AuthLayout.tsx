import Image from "next/image";
import logoImg from "/public/img/brand/Primary-Logo-White.png";
import loginImgBg from "/public/img/layout/Shield.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-accent to-primary">
      <div className="grid h-screen max-w-full grid-cols-1 lg:grid-cols-2">

        <div className="flex flex-col items-center justify-center gap-4 rounded-br-[80px] bg-accent px-6 py-8 sm:rounded-br-[40px]">
          <Image
            src={logoImg}
            alt="Company Logo"
            width={200}
            height={200}
            className="h-20 w-auto max-w-[250px]"
          />
          <h2 className="text-center text-lg font-normal text-text-special">
            Trusted gateway to higher education in Malaysia
          </h2>
          <Image
            src={loginImgBg}
            alt="Students"
            width={250}
            height={250}
            className="h-[250px] w-[250px] object-contain"
          />
        </div>

        <div className="flex items-center justify-center rounded-tl-[80px] bg-primary px-6 py-8 sm:rounded-tl-[40px]">

          <div className="w-full rounded-lg border border-default bg-card p-6 max-w-[400px] animate-fadeIn">
            {children}
          </div>

        </div>

      </div>
    </div>
  );
}