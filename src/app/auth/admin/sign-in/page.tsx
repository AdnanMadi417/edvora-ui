"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import InputField from "../../../../components/fields/InputField";
import Checkbox from "../../../../components/checkbox";
import logoImg from "/public/img/brand/Primary-Logo-White.png";
import loginImgBg from "/public/img/layout/Shield.png";


function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.setItem("role", "admin"); // or "partner" depending on page


    console.log("Email:", email);
    console.log("Password:", password);


    router.push("/admin/default");

  };
  return (
    <div className="signin-page">
      <div className="container">

        {/* Branding Section */}
        <div className="branding-section">
          <Image
            src={logoImg}
            alt="Company Logo"
            width={320}
            height={80}
            className="logo-img"
          />
          <h2>Your gateway to system administration</h2>
          <Image
            src={loginImgBg}
            alt="Students"
            width={250}
            height={250}
            className="student-img"
          />
        </div>

        {/* Sign In Section */}
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
              />
              <InputField
                variant="auth"
                extra="w-full"
                label="Password"
                placeholder="Min. 8 characters"
                id="password"
                type="password"
              />

              <div className="form-footer">
                <div className="keep-logged">
                  <Checkbox />
                  <label htmlFor="keep-logged-in">Keep me logged in</label>
                </div>
                <a href="#">Forgot Password?</a>
              </div>

              <button type="submit">Sign In</button>
            </form>
          </div>
        </div>

      </div>

      {/* CSS */}
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
          height: 450px;
          background-color: var(--card-bg);
          padding: 2rem 1rem ;
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

        .form button:hover {
            background-color: var(--hover-button-bg);
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
        }
        
      `}</style>
    </div>
  );
}

export default SignInPage;