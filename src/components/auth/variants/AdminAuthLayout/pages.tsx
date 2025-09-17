'use client';
import InputField from '../../../../components/fields/InputField';
import Default from '../../../../components/auth/variants/DefaultAuthLayout';
import { FcGoogle } from 'react-icons/fc';
import Checkbox from '../../../../components/checkbox';

function SignInDefault() {
    return (
        <Default
            maincard={
                <div
                    className="mb-16 mt-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start"
                >
                    {/* Sign in section */}
                    <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
                        {/* Title */}
                        <h3
                            className="mb-2.5 text-4xl font-bold"
                            style={{ color: "var(--primary-text-color)" }}
                        >
                            Sign In
                        </h3>

                        {/* Description */}
                        <p
                            className="mb-9 ml-1 text-base"
                            style={{ color: "var(--secondary-text-color)" }}
                        >
                            Enter your email and password to sign in!
                        </p>

                        {/* Google Sign In Button */}
                        <div
                            className="mb-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl hover:cursor-pointer"
                            style={{
                                backgroundColor: "var(--accent-light)",
                                color: "var(--primary-text-color)",
                            }}
                        >

                            <div className="rounded-full text-xl">
                                <FcGoogle />
                            </div>

                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--primary-text-color)" }}
                            >
                                Sign In with Google
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="mb-6 flex items-center gap-3">
                            <div
                                className="h-px w-full"
                                style={{ backgroundColor: "var(--border-color)" }}
                            />
                            <p
                                className="text-base"
                                style={{ color: "var(--secondary-text-color)" }}
                            >
                                or
                            </p>
                            <div
                                className="h-px w-full"
                                style={{ backgroundColor: "var(--border-color)" }}
                            />
                        </div>

                        {/* Email Input */}
                        <InputField
                            variant="auth"
                            extra="mb-3"
                            label="Email*"
                            placeholder="mail@simmmple.com"
                            id="email"
                            type="text"
                        />

                        {/* Password Input */}
                        <InputField
                            variant="auth"
                            extra="mb-3"
                            label="Password*"
                            placeholder="Min. 8 characters"
                            id="password"
                            type="password"
                        />

                        {/* Checkbox and Forgot Password */}
                        <div className="mb-4 flex items-center justify-between px-2">
                            <div className="mt-2 flex items-center">
                                <Checkbox />
                                <p
                                    className="ml-2 text-sm font-medium"
                                    style={{ color: "var(--secondary-text-color)" }}
                                >
                                    Keep me logged In
                                </p>
                            </div>
                            <a
                                className="text-sm font-medium"
                                style={{ color: "var(--accent-color)" }}
                                href=" "
                            >
                                Forgot Password?
                            </a>
                        </div>

                        {/* Sign In Button */}
                        <button
                            className="w-full rounded-xl py-3 text-base font-medium transition duration-200"
                            style={{
                                backgroundColor: "var(--accent-color)",
                                color: "var(--special-text-color)",
                            }}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
                            }
                            onMouseOut={(e) =>
                                (e.currentTarget.style.backgroundColor = "var(--accent-color)")
                            }
                        >
                            Sign In
                        </button>

                        {/* Sign Up Link */}
                        <div className="mt-4">
              <span
                  className="text-sm font-medium"
                  style={{ color: "var(--secondary-text-color)" }}
              >
                Not registered yet?
              </span>
                            <a
                                href="/auth/sign-up/default"
                                className="ml-1 text-sm font-medium"
                                style={{ color: "var(--accent-color)" }}
                            >
                                Create an account
                            </a>
                        </div>
                    </div>
                </div>
            }
        />
    );
}

export default SignInDefault;
