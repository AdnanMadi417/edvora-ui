"use client";

import { useState } from "react";
import InputField from "../fields/InputField";
import Checkbox from "../checkbox";

interface SignInFormProps {
  onSubmit: (email: string, password: string) => Promise<void> | void;
}

export default function SignInForm({ onSubmit }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex w-full max-w-[400px] flex-col gap-4"
      onSubmit={handleSubmit}
    >
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-text-primary">Sign In</h1>
        <p className="mt-2 text-base text-text-secondary">
          Enter your email and password to sign in!
        </p>
      </div>

      <InputField
        variant="auth"
        extra="w-full"
        label="Email"
        placeholder="mail@gmail.com"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
      />

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center">
          <Checkbox id="remember" />
          <label
            htmlFor="remember"
            className="ml-2 cursor-pointer text-p2 font-normal text-text-secondary"
          >
            Keep me logged in
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-accent px-4 py-3 text-p2 font-medium text-text-special transition-colors duration-200 hover:bg-button-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
