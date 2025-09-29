"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import InputField from "../../../components/fields/InputField";
import Checkbox from "../../../components/checkbox";
import logoImg from "/public/img/brand/Primary-Logo-White.png";
import loginImgBg from "/public/img/layout/Shield.png";

function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === "admin@gmail.com") {
      localStorage.setItem("role", "admin");
      localStorage.setItem("userEmail", email);
      router.push("/account-manager/applications");
    } else if (normalizedEmail === "partner@gmail.com") {
      localStorage.setItem("role", "partner");
      localStorage.setItem("userEmail", email);
      router.push("/partner/applications");
    } else {
      setError("Invalid email or password. Access denied.");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent to-primary">
      <div className="grid h-screen max-w-full grid-cols-1 lg:grid-cols-2">

        <div className="flex flex-col items-center justify-center gap-4 rounded-br-[80px] bg-accent px-6 py-8 sm:rounded-br-[40px]">
          <Image
            src={logoImg}
            alt="Company Logo"
            width={250}
            height={80}
            className="h-20 w-auto max-w-[250px] sm:max-w-[250px]"
          />
          <h2 className="text-center text-lg font-normal text-text-special">
            Trusted gateway to higher education in Malaysia
          </h2>
          <Image
            src={loginImgBg}
            alt="Students"
            width={250}
            height={250}
            className="h-[250px] w-[250px] object-contain sm:h-[250px] sm:w-[250px]"
          />
        </div>

        <div className="flex items-center justify-center rounded-tl-[80px] bg-primary px-6 py-8 sm:rounded-tl-[40px]">
          <div className="w-full rounded-md border border-default bg-card p-6 shadow-md max-w-[400px]">

            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-text-primary">Sign In</h1>
              <p className="mt-2 text-base text-text-secondary">
                Enter your email and password to sign in!
              </p>
            </div>

            <form className="flex flex-col gap-4 " onSubmit={handleSubmit}>
              <InputField
                variant="auth"
                extra="w-full"
                label="Email"
                placeholder="mail@gmail.com"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <InputField
                variant="auth"
                extra="w-full"
                label="Password"
                placeholder="Min. 8 characters"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              {/* Error Message */}
              {error && (
                <div className="rounded-md border border-danger bg-alert-danger px-4 py-2 text-center text-sm text-text-error">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <Checkbox />
                  <label
                    htmlFor="keep-logged-in"
                    className="ml-2 cursor-pointer text-sm font-medium text-text-secondary"
                  >
                    Keep me logged in
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-accent hover:text-accent-hover"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-accent px-4 py-3 text-p1 font-medium text-text-special transition-colors duration-200 hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default SignInPage;
