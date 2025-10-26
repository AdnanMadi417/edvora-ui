import { useState } from "react";

const Footer = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex w-full flex-col items-center justify-between px-1 pb-8 pt-3 lg:px-8 xl:flex-row">
      <p className="mb-4 text-center text-p2 font-medium text-text-muted sm:!mb-0">
        ©{new Date().getFullYear()}{" "}
        <span className="text-text-primary">
          <a
            href="#"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              textDecoration: isHovered ? "line-through" : "none",
              color: isHovered
                ? "var(--secondary-text-color)"
                : "var(--muted-text-color)",
              transition: "all 0.3s ease",
            }}
          >
            Unibexs
          </a>
        </span>
        . All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
