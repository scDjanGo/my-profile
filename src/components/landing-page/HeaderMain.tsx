// "use client";
// import Head from "next/head";

// import { useState, useEffect } from "react";

// export default function HeaderMain() {
//     const [isVisible, setIsVisible] = useState(true);

//     let lastScrollY = 0;

//     const handleScroll = () => {
//         if (typeof window !== "undefined") {
//             const currentScrollY = window.scrollY;

//             if (currentScrollY > lastScrollY) {
//                 setIsVisible(false)
//             } else {
//                 setIsVisible(true)
//             }
//             lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
//         }
//     };

//     useEffect(() => {
//         const interval = setInterval(() => {
//             if (typeof window !== "undefined" && window.Snowflakes) {
//                 new window.Snowflakes();
//                 clearInterval(interval);
//             }
//         }, 100);
//     }, []);

//     useEffect(() => {
//         window.addEventListener("scroll", handleScroll);
//         return () => {
//             window.removeEventListener("scroll", handleScroll);
//         };
//     }, []);




//     const handleToAboutMe = () => {
//         const aboutMe = document.getElementById("aboutMe");
//         if (!aboutMe) return;
//         aboutMe.scrollIntoView({ behavior: "smooth" });
//     };

//     const handleToMyTools = () => {
//         const myTools = document.getElementById("myTools");
//         if (!myTools) return;
//         myTools.scrollIntoView({ behavior: "smooth" });
//     };

//     const handleToCV = () => {
//         const CV = document.getElementById("CV");
//         if (!CV) return;
//         CV.scrollIntoView({ behavior: "smooth" });
//     };

//     const handleToFooter = () => {
//         const footer = document.getElementById("footer");
//         if (!footer) return;
//         footer.scrollIntoView({ behavior: "smooth" });
//     };

//     return (

//         <>
//             <Head>
//                 <script
//                     src="https://unpkg.com/magic-snowflakes/dist/snowflakes.min.js"
//                     defer
//                 ></script>
//             </Head>
//             <header
//                 className={`fixed w-full z-[2] bg-[#ffffff] p-[20px_300px_28px] 1560:p-[20px_30px_28px] flex items-center justify-end 695:justify-center transition-all duration-300 ${isVisible ? "top-0 " : "top-[-100%] "
//                     }`}
//             >
//                 <ul className="flex items-center 695:justify-center gap-[8px] 695:gap-[4px]">
//                     <li onClick={handleToAboutMe} className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]">
//                         About me
//                     </li>
//                     <li onClick={handleToMyTools} className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]">
//                         Tools
//                     </li>
//                     <li
//                         onClick={handleToCV}
//                         className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]"
//                     >
//                         CV
//                     </li>
//                     <li
//                         onClick={handleToFooter}
//                         className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]"
//                     >
//                         Contact
//                     </li>
//                 </ul>
//             </header>
//         </>
//     );
// }



"use client";

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
  //     const script = document.createElement("script");
  //     script.src = "https://unpkg.com/magic-snowflakes/dist/snowflakes.min.js";
  //     script.onload = () => {
  //       if (typeof window !== "undefined" && window.Snowflakes) {
  //         new window.Snowflakes();
  //       } else {
  //         console.error("Snowflakes not loaded!");
  //       }
  //     };
  //     document.body.appendChild(script);
  //   };

  //   loadSnowflakes();
  // }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id:string) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* <Head>
        <script
          src="https://unpkg.com/magic-snowflakes/dist/snowflakes.min.js"
          defer
        ></script>
      </Head> */}
      <header
        className={`fixed w-full z-[2] bg-[#ffffff] p-[20px_300px_28px] 1560:p-[20px_30px_28px] flex items-center justify-end 695:justify-center transition-all duration-300 ${
          isVisible ? "top-0" : "top-[-100%]"
        }`}
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
    </>
  );
}
