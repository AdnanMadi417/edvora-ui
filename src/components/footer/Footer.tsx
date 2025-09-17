const Footer = () => {
  return (
      <div className="flex w-full flex-col items-center justify-between px-1 pb-8 pt-3 lg:px-8 xl:flex-row">
        <p
            className="mb-4 text-center font-medium sm:!mb-0"
            style={{ color: "var(--muted-text-color)", fontSize: "var(--font-size-p2)" }}
        >
        <span
            className="mb-4 text-center sm:!mb-0"
            style={{ color: "var(--muted-text-color)", fontSize: "var(--font-size-p1)" }}
        >
          ©{new Date().getFullYear()} Unibexs. All Rights Reserved.
        </span>
        </p>

        <div>
          <ul className="flex flex-wrap items-center gap-3 sm:flex-nowrap md:gap-10">
            <li>
              <a
                  target="blank"
                  href="mailto:hello@unibexs.com"
                  className="font-medium transition-colors"
                  style={{
                    color: "var(--muted-text-color)",
                    fontSize: "var(--font-size-p1)",
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
            <li>
              <a
                  target="blank"
                  href="/licenses"
                  className="font-medium transition-colors"
                  style={{
                    color: "var(--muted-text-color)",
                    fontSize: "var(--font-size-p1)",
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
            <li>
              <a
                  target="blank"
                  href="/terms-of-service"
                  className="font-medium transition-colors"
                  style={{
                    color: "var(--muted-text-color)",
                    fontSize: "var(--font-size-p1)",
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
                  className="font-medium transition-colors"
                  style={{
                    color: "var(--muted-text-color)",
                    fontSize: "var(--font-size-p1)",
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
      </div>
  );
};

export default Footer;
