"use client";

import { useState, useEffect } from "react";

export default function HeaderMain() {
    const [isVisible, setIsVisible] = useState(true);

    let lastScrollY = 0;

    const handleScroll = () => {
        if (typeof window !== "undefined") {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY) {
                setIsVisible(false)
            } else {
                setIsVisible(true)
            }
            lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);




    const handleToAboutMe = () => {
        const aboutMe = document.getElementById("aboutMe");
        if (!aboutMe) return;
        aboutMe.scrollIntoView({ behavior: "smooth" });
    };

    const handleToMyTools = () => {
        const myTools = document.getElementById("myTools");
        if (!myTools) return;
        myTools.scrollIntoView({ behavior: "smooth" });
    };

    const handleToCV = () => {
        const CV = document.getElementById("CV");
        if (!CV) return;
        CV.scrollIntoView({ behavior: "smooth" });
    };

    const handleToFooter = () => {
        const footer = document.getElementById("footer");
        if (!footer) return;
        footer.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <header
            className={`fixed w-full z-[2] bg-[#ffffff] p-[20px_300px_28px] 1560:p-[20px_30px_28px] flex items-center justify-end 695:justify-center transition-all duration-300 ${isVisible ? "top-0 " : "top-[-100%] "
                }`}
        >
            <ul className="flex items-center 695:justify-center gap-[8px] 695:gap-[4px]">
                <li onClick={handleToAboutMe} className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]">
                    About me
                </li>
                <li onClick={handleToMyTools} className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]">
                    Tools
                </li>
                <li
                    onClick={handleToCV}
                    className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]"
                >
                    CV
                </li>
                <li
                    onClick={handleToFooter}
                    className="text-[#333333] text-[16px] 695:text-[14px] 695:p-[6px_10px] font-[500] p-[12px_20px] cursor-pointer rounded-[4px] hover:bg-[#A53DFF] hover:text-[#ffffff]"
                >
                    Contact
                </li>
            </ul>
        </header>
    );
}
