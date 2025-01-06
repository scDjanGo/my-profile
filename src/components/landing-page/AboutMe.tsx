

"use client";

import { useState } from "react";

export default function AboutMe() {
    const AboutMe = [
        {
            id: 1,
            title: "My workflow",
            description:
                "My workflow involves analyzing tasks, developing responsive interfaces, implementing animations, and integrating with APIs. I quickly prototype, test across browsers and devices, and collaborate closely with the team to achieve project goals.",
        },
        {
            id: 2,
            title: "Hobby",
            description:
                "My hobby is cooking. I enjoy experimenting with recipes, trying new cuisines, and combining different ingredients. For me, it’s not just a way to relax but also a chance to be creative and make my loved ones happy with delicious meals.",
        },
        {
            id: 3,
            title: "Interests",
            description:
                "I’m always fascinated by understanding how things work. I enjoy diving into the details, exploring mechanisms, and figuring out solutions. This curiosity helps me deeply engage with projects, find efficient answers, and continuously improve my skills.",
        },
    ];

    const [hoveredId, setHoveredId] = useState<number | null>(null);

    const handleMouseEnter = (id: number) => {
        setHoveredId(id);
    };

    const handleMouseLeave = () => {
        setHoveredId(null);
    };

    return (
        // <div id="aboutMe" className="flex 795:flex-col items-center gap-[25px] justify-between bg-[#F0F1F3] p-[150px_300px] 1560:p-[100px_30px]">
        <div id="aboutMe" className="flex 795:flex-col items-center gap-[25px] justify-between p-[150px_300px] 1560:p-[100px_30px]">
            <div className="max-w-[530px] flex flex-col gap-[24px] 795:items-center">
                <h3 className="text-[48px] relative z-[3] font-[600] text-[#ffffff] 795:text-[26px]">What I do?</h3>

                <div className="flex flex-col gap-[16px]">
                    <p className="text-[#87909D] relative z-[3] text-[18px] font-[400] 795:text-[12px]">
                        As a Frontend developer, I specialize in building user interfaces for web applications that prioritize usability and intuitive interactions.{" "}
                    </p>
                    <p className="text-[#87909D] relative z-[3] text-[18px] font-[400] 795:text-[12px]">
                        I collaborate closely with designers and backend developers to deliver projects from concept to final product.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-[24px] max-w-[650px]">
                {AboutMe.map((item) => (
                    <div
                        key={item.id}
                        onMouseEnter={() => handleMouseEnter(item.id)}
                        onMouseLeave={handleMouseLeave}
                        className={`relative z-[3] p-[32px] 795:p-[16px] flex flex-col gap-[16px] rounded-[12px] bg-[#ffffff] hover:drop-shadow-[0_10px_10px_rgba(43,56,76,0.1)] cursor-pointer about-me-child ${item.id}  ${hoveredId === item.id && " !rounded-[0]"} `}
                    >
                        <h3 className="text-[#132238] relative z-[3] text-[24px] font-[600] 795:text-[18px]">{item.title}</h3>
                        <p className="text-[#424E60] relative z-[3] text-[16px] font-[400] 795:text-[12px]">{item.description}</p>

                        <div className={`bg-[#A53DFF] transition-all duration-200 ease-in-out absolute z-[1] top-0 left-[-5px] rounded-[12px_0_0_12px] ${hoveredId === item.id ? "w-[5px] min-h-full" : "w-0"}`}></div>
                        <div className={`bg-[#A53DFF] transition-all duration-200 ease-in-out absolute z-[1] top-0 right-[-5px] rounded-[0_12px_12px_0] ${hoveredId === item.id ? "w-[5px] min-h-full" : "w-0"}`}></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
