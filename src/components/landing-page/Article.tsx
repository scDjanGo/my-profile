"use client"


import { useState, useEffect } from "react";
import { HandlerTypes } from "@/lib/types";
import Slider from "./Slider";
import { buttonsData } from "@/data/ButtonData";

export default function Article() {
    const [currentHandler, setCurrentHandler] = useState<null | HandlerTypes>(null);

    useEffect(() => {
        const currentClass = document.querySelectorAll(".currentClass") as NodeListOf<HTMLElement>
        const currentShow = document.querySelectorAll(".currentShow") as NodeListOf<HTMLElement>

        if (currentClass && currentClass.length > 0 && currentShow.length > 0) {
            const width = currentClass[0].offsetWidth;

            currentShow.forEach((item) => {
                item.style.width = `${width - 2}px`;
            });
        }

    }, [currentHandler]);

    const handleCurrentEnter = (i: number) => {

        setCurrentHandler(buttonsData.find((_, index) => index === i) || null);
    };

    const handleCurrentLeave = () => {
        setCurrentHandler(null);
    };

    return (
        <article
            style={{
                backgroundColor: currentHandler ? "#0000004D" : undefined,
                backgroundImage: currentHandler ? `url("${currentHandler.bgImage}")` : "",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
            }}
            className="relative h-[100dvh]"
        >

            <div
                style={{
                    backgroundImage: !currentHandler ? `url("/img/main4.png")` : "",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                }}
                className=" flex flex-col items-center justify-start gap-[22.5px] pb-[22.5px] h-[100dvh]"
            >
                <div
                    className={`w-full grid grid-cols-[repeat(auto-fit,_minmax(80px,_1fr))] border-y-[1px] border-t-[1px] border-[#EBEBEB]`}
                >
                    {buttonsData.map((item, index) => (
                        <div
                            onMouseEnter={() => handleCurrentEnter(index)}
                            onMouseLeave={() => handleCurrentLeave()}
                            key={index}
                            className={`${index !== 0 && "border-[#EBEBEB] border-l-[1px] border-t-[1px]"
                                }   !border-t-[1px] whitespace-nowrap flex items-center justify-center p-[31px_10px_29px]  mt-[8px] !1040:p-[10px_5px] cursor-pointer currentClass navbarButtonsParent`}
                        >
                            <p className=" text-[20px] text-center 1040:text-[12px] 1040:font-[600] font-[800] text-[#FFFFFF] navbarButtons">
                                {item.title}
                            </p>

                            <div
                                style={{
                                    backgroundColor: currentHandler ? currentHandler.bgColor : "",
                                }}
                                className={`absolute ${currentHandler && currentHandler.id === item.id
                                    ? `top-0 w-full max-h-[90%] 595:max-h-[90%]`
                                    : "top-[-100%] w-0 h-0"
                                    } h-full flex flex-col items-center justify-end pb-[40px] currentShow px-[40px] 795:px-[5px]`}
                            >
                                <div className="flex flex-col w-full items-center justify-center gap-[16px] 795:gap-[8px]">
                                    <h5 id="currentTop" className="text-[20px] 795:text-[12px] text-center text-[#FFFFFF] font-[800]">
                                        {currentHandler && currentHandler.desc}
                                    </h5>
                                    <p
                                        id="current"
                                        style={{ overflowWrap: "break-word" }}
                                        className="text-[14px] 795:text-[10px] mb-[27px] 795:mb-[14px] text-center w-full text-[#FFFFFF] max-w-full font-[400] "
                                    >
                                        {currentHandler && currentHandler.subDesc}
                                    </p>

                                    <div className="w-10 h-10 795:w-5 795:h-5 795:p-[4px] p-[12.5px] border-[1px] rounded-full border-[#EBEBEB] cursor-pointer hover:bg-[rgb(0,0,0,0.5)]">
                                        <img
                                            className="-rotate-90"
                                            src="/svg/arrow-down.svg"
                                            alt="*"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-10 h-10 p-[12.5px] border-[1px] rounded-full border-[#EBEBEB] cursor-pointer hover:bg-[#b2b2b2]">
                    <img src="/svg/arrow-down.svg" alt="*" />
                </div>


                <div
                    onMouseLeave={() => handleCurrentLeave()}
                    onMouseEnter={() => setCurrentHandler(currentHandler)} className="w-full">
                    <div className="flex flex-col items-center justify-center pt-[256px]">
                        <div className="relative flex flex-col items-center justify-center w-full">
                            <div className="w-full flex flex-col items-center justify-center absolute top-[-206px] z-[10] px-[15px]">
                                <h3
                                    className={`text-[64px] 1240:text-[32px] font-[800] ${!currentHandler ? "text-[#222222]" : "text-[#ffffff]"
                                        } text-center`}
                                >
                                    {!currentHandler ? (
                                        <span>
                                            Ремонт{" "}
                                            <span className="text-[#ffffff] text-transparent stroke-black">
                                                и
                                            </span>{" "}
                                            дизайн
                                        </span>
                                    ) : (
                                        currentHandler.title
                                    )}
                                </h3>
                                <h4
                                    className={`${!currentHandler ? "stroke-black" : "stroke-white"
                                        } text-[64px] 1240:text-[32px] font-[800] 1240:font-[600]  text-transparent text-center`}
                                >
                                    {!currentHandler
                                        ? "в Москве и Московской области"
                                        : currentHandler.subtitle}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Slider />

        </article>
    );
}
