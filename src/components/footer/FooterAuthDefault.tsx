/* eslint-disable */
export default function Footer() {
  return (
      <div className="z-[5] mx-auto flex w-full max-w-screen-sm flex-col items-center justify-between px-[20px] pb-4 lg:mb-6 lg:max-w-[100%] lg:flex-row xl:mb-2 xl:w-[1310px] xl:pb-6">
        <p
            className="mb-6 text-center md:text-base lg:mb-0"
            style={{
              color: "var(--muted-text-color)",
              fontSize: "var(--font-size-p2)",
            }}
        >
          ©{new Date().getFullYear()} Unibexs. All Rights Reserved.
        </p>

        <ul className="flex flex-wrap items-center sm:flex-nowrap">
          <li className="mr-12">
            <a
                target="blank"
                href="mailto:support@unibexs.com"
                className="transition-colors"
                style={{
                  color: "var(--muted-text-color)",
                  fontSize: "var(--font-size-p2)",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--accent-color)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--muted-text-color)")
                }
            >
              Support
            </a>
          </li>
          <li className="mr-12">
            <a
                target="blank"
                href="/license"
                className="transition-colors"
                style={{
                  color: "var(--muted-text-color)",
                  fontSize: "var(--font-size-p2)",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--accent-color)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--muted-text-color)")
                }
            >
              License
            </a>
          </li>
          <li className="mr-12">
            <a
                target="blank"
                href="/terms"
                className="transition-colors"
                style={{
                  color: "var(--muted-text-color)",
                  fontSize: "var(--font-size-p2)",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--accent-color)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--muted-text-color)")
                }
            >
              Terms of Use
            </a>
          </li>
          <li>
            <a
                target="blank"
                href="/blog"
                className="transition-colors"
                style={{
                  color: "var(--muted-text-color)",
                  fontSize: "var(--font-size-p2)",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--accent-color)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--muted-text-color)")
                }
            >
              Blog
            </a>
          </li>
        </ul>
      </div>
  );
}
