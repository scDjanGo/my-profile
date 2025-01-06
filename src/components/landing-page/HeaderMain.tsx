"use client";

import Script from "next/script";
import { useState, useEffect, useRef } from "react";

export default function HeaderMain() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setIsVisible(currentScrollY <= lastScrollY.current);
    lastScrollY.current = currentScrollY;
  };

  // useEffect(() => {
  //   const loadSnowflakes = () => {
  //     if (typeof window !== "undefined" && !window.Snowflakes) {
  //       const script = document.createElement("script");
  //       script.src = "https://unpkg.com/magic-snowflakes/dist/snowflakes.min.js";
  //       script.onload = () => {
  //         if (window.Snowflakes) {
  //           new window.Snowflakes();
  //         } else {
  //           console.error("Snowflakes not loaded!");
  //         }
  //       };
  //       document.body.appendChild(script);
  //     }
  //   };

  //   loadSnowflakes();

  //   window.addEventListener("scroll", handleScroll);

  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={`fixed w-full z-[4] bg-[#ffffff] p-[20px_300px_28px] 1560:p-[20px_30px_28px] flex items-center justify-end 695:justify-center transition-all duration-300 ${isVisible ? "top-0" : "top-[-100%]"} `}
      >
        <ul className="flex items-center 695:justify-center gap-[8px] 695:gap-[4px]">
          <li
            onClick={() => handleScrollTo("aboutMe")}
            className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]"
          >
            About me
          </li>
          <li
            onClick={() => handleScrollTo("myTools")}
            className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]"
          >
            Tools
          </li>
          <li
            onClick={() => handleScrollTo("CV")}
            className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]"
          >
            CV
          </li>
          <li
            onClick={() => handleScrollTo("footer")}
            className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]"
          >
            Contact
          </li>
        </ul>
      </header>
      <Script
        src="/effects/smoke-effect.js"
        strategy="afterInteractive" // Эта стратегия гарантирует выполнение скрипта после загрузки всего контента
      />
    </>
  );
}
