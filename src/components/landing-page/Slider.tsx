import Image from "next/image";

import { Tools } from "@/data/Tools";

export default function Slider() {

    return (
        <section className="absolute bg-[#333333] bg-opacity-[.5] pt-[10px] max-h-[10dvh] h-full bottom-0 left-0 overflow-hidden whitespace-nowrap w-full">
            <div className="flex animate-scroll h-full gap-[50px] 795:gap-[15px]">
                {Tools.map((item) => (
                    <div key={item.id} className="mr-4 flex flex-col items-center justify-center gap-[3px]">
                        <div className="w-40px h-[40px]">
                            <Image width={40} height={40} className=" min-w-[40px] !w-[40px] h-[40px]" src={item.img} alt={item.title} />
                        </div>
                        <p className="whitespace-nowrap text-[12px] font-[400] text-[#ffffff]">{item.title}</p>
                    </div>
                ))}
                {Tools.map((item) => (
                    <div key={`duplicate-${item.id}`} className="mr-4 flex flex-col items-center justify-center gap-[3px]">
                        <div className="w-40px h-[40px]">
                            <Image width={40} height={40} className=" min-w-[40px] !w-[40px] h-[40px]" src={item.img} alt={item.title} />
                        </div>
                        <p className="whitespace-nowrap text-[12px] font-[400] text-[#ffffff]">{item.title}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
