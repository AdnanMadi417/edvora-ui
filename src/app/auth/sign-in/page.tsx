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
      console.log("Admin login successful");
      router.push("/admin/default");
    } else if (normalizedEmail === "partner@gmail.com") {
      localStorage.setItem("role", "partner");
      localStorage.setItem("userEmail", email);
      console.log("Partner login successful");
      router.push("/partner/default");
    } else {
      setError("Invalid email or password. Access denied.");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="signin-page">
      <div className="container">

        <div className="branding-section">
          <Image
            src={logoImg}
            alt="Company Logo"
            width={320}
            height={80}
            className="logo-img"
          />
          <h2>Trusted gateway to higher education in Malaysia</h2>
          <Image
            src={loginImgBg}
            alt="Students"
            width={250}
            height={250}
            className="student-img"
          />
        </div>

        <div className="sign-in-section">
          <div className="form-wrapper">
            <div className="form-header">
              <h1>Sign In</h1>
              <p>Enter your email and password to sign in!</p>
            </div>

            <form className="form" onSubmit={handleSubmit}>
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
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-footer">
                <div className="keep-logged">
                  <Checkbox />
                  <label htmlFor="keep-logged-in">Keep me logged in</label>
                </div>
                <a href="#">Forgot Password?</a>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="dev-info">
              <p>
                <strong>Dev Mode:</strong><br />
                Admin: admin@gmail.com<br />
                Partner: partner@gmail.com
              </p>
            </div>

          </div>
        </div>

      </div>

      <style jsx>{`
          .signin-page {
              min-height: 100vh;
              background: linear-gradient(
                      to bottom,
                      var(--accent-color) 50%,
                      var(--primary-bg) 50%
              );
          }

          .container {
              display: grid;
              grid-template-columns: 1fr;
              max-width: 100%;
              height: 100vh;
          }

          .branding-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background: var(--accent-color);
              border-bottom-right-radius: 80px;
              gap: 1rem;
          }

          .branding-section h2 {
              color: var(--special-text-color);
              text-align: center;
              font-size: 1.25rem;
              font-weight: 400;
          }

          .logo-img {
              width: auto;
              max-width: 250px;
              height: 80px;
          }

          .student-img {
              width: 250px;
              height: 250px;
              object-fit: contain;
          }

          .sign-in-section {
              display: flex;
              justify-content: center;
              padding: 2rem;
              background-color: var(--primary-bg);
              border-top-left-radius: 80px;
              align-items: center;
          }

          .form-wrapper {
              max-width: 400px;
              width: 100%;
              min-height: 450px;
              background-color: var(--card-bg);
              padding: 2rem 1rem;
              border: var(--border-thin) solid var(--border-color-default);
              border-radius: var(--border-thick);
          }

          .form-header {
              text-align: center;
              margin-bottom: 1.5rem;
          }

          .form-header h1 {
              font-size: 2rem;
              font-weight: 700;
              color: var(--primary-text-color);
          }

          .form-header p {
              font-size: 1rem;
              color: var(--secondary-text-color);
          }

          .form {
              display: flex;
              flex-direction: column;
              gap: 1rem;
          }

          .error-message {
              background-color: #fee2e2;
              border: 1px solid #fecaca;
              color: #dc2626;
              padding: 0.75rem;
              border-radius: 0.375rem;
              font-size: 0.875rem;
              text-align: center;
          }

          .form-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 0.5rem;
              padding-top: 0.5rem;
          }

          .keep-logged {
              display: flex;
              align-items: center;
          }

          .keep-logged label {
              margin-left: 0.5rem;
              font-size: 0.875rem;
              font-weight: 500;
              cursor: pointer;
              color: var(--secondary-text-color);
          }

          .form-footer a {
              font-size: 0.875rem;
              font-weight: 500;
              color: var(--accent-color);
              text-decoration: none;
          }

          .form button {
              width: 100%;
              border-radius: var(--border-rounded);
              padding: 0.75rem;
              font-size: var(--font-size-p1);
              font-weight: 500;
              background-color: var(--accent-color);
              color: var(--special-text-color);
              border: none;
              cursor: pointer;
              transition: all 0.2s ease-in-out;
          }

          .form button:hover:not(:disabled) {
              background-color: var(--hover-button-bg);
          }

          .form button:disabled {
              opacity: 0.6;
              cursor: not-allowed;
          }

          .dev-info {
              margin-top: 1rem;
              padding: 0.75rem;
              background-color: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 0.375rem;
              font-size: 0.75rem;
              color: #1d4ed8;
          }

          @media (min-width: 1024px) {
              .container {
                  grid-template-columns: 1fr 1fr;
              }
          }

          @media (max-width: 1023px) {
              .logo-img {
                  max-width: 180px;
                  height: auto;
              }
              .student-img {
                  width: 150px;
                  height: 150px;
              }
          }

          @media (max-width: 639px) {
              .branding-section {
                  border-bottom-right-radius: 40px;
                  padding: 1.5rem;
              }
              .sign-in-section {
                  border-top-left-radius: 40px;
                  padding: 1.5rem;
              }
              .form-wrapper {
                  padding: 1.5rem 1rem;
              }
          }
      `}</style>
    </div>
  );
}

export default SignInPage;