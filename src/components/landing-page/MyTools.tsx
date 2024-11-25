import { Tools } from "@/data/Tools"
import Image from "next/image"

export default function MyTools() {
    return (
        <div id="myTools" className="flex flex-col items-center gap-[25px] justify-between bg-[#F0F1F3] p-[150px_300px] 1560:p-[100px_30px]">
            <h2 className="text-[#132238] text-center text-[64px] font-[700] 795:text-[32px] pt-[24px] px-[100px] 1240:px-[15px]">
                My Tools
            </h2>
            <div className="w-full grid grid-cols-[repeat(auto-fit,_minmax(90px,_130px))] gap-[25px] 795:grid-cols-[repeat(auto-fit,_minmax(80px,_90px))] justify-center px-[100px] py-[25px] 1240:px-[15px]">
                {Tools.map(item =>
                    <div key={item.id} className=" max-h-[150px] border-[1px] p-[15px] bg-[#ffffff] rounded-[22px] cursor-pointer hover:drop-shadow-[0_10px_10px_rgba(43,56,76,0.1)]">
                        <Image width={140} height={140} src={item.img} alt="#" className="h-full w-full" />
                    </div>
                )}
            </div>
        </div>
    )
}
