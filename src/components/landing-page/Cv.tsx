import Image from "next/image"
import Link from "next/link"

export default function Cv() {
    return (

        <article style={{backgroundImage: "url('/img/bg.png')", backgroundSize: "cover"}} id="CV" className="p-[100px_300px_50px] 1560:p-[100px_30px_50px] bg-[#ffffff]">

            <div className="w-full items-center justify-center bg-[#ffffff] rounded-[22px]  drop-shadow-[0_10px_10px_rgba(43,56,76,0.2)]">
                <section className="max-w-[1320px] p-[112px] 1240:p-[30px] flex 695:flex-col gap-[25px] items-center justify-center">
                    <div className="relative">
                        <Image width={424} height={468} className="max-w-[424px] max-h-[468px] 995:max-w-[212px] 995:max-h-[234px] 695:w-[180px]" src={"/img/1.png"} alt="#" priority />


                    </div>


                    <div className="max-w-[536px] flex flex-col gap-[32px]">
                        <h3 className="text-[#132238] text-[38px] 895:text-[24px] 895:text-start font-[600]">
                            I am an experienced Frontend developer
                        </h3>

                        <div className="flex flex-col gap-[16px]">
                            <p className="text-[#556070] text-[18px] 895:text-[12px] font-[400]">
                                Specializing in creating modern and high-performance web applications for B2B and B2C segments. In my projects, I combine aesthetic design, user-friendly interfaces, and reliable functionality to help businesses effectively engage with clients and partners.
                            </p>


                            <p className="text-[#556070] text-[18px] 895:text-[12px] font-[400]">
                                I have a strong understanding of the needs of different audiences and know how to adapt my solutions to achieve the best results.
                            </p>
                        </div>


                        <div className=" flex justify-start ">
                            <Link href="/pdf/myResume.pdf" download={true} className="group w-[190px] !flex !flex-row items-center gap-[12px] rounded-[6px] border-[1px] justify-center border-[#A53DFF] p-[12px_24px] group hover:bg-[#A53DFF]">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path className="group-hover:fill-[#ffffff]" d="M19 12C18.7348 12 18.4804 12.1054 18.2929 12.2929C18.1054 12.4804 18 12.7348 18 13V17C18 17.2652 17.8946 17.5196 17.7071 17.7071C17.5196 17.8946 17.2652 18 17 18H3C2.73478 18 2.48043 17.8946 2.29289 17.7071C2.10536 17.5196 2 17.2652 2 17V13C2 12.7348 1.89464 12.4804 1.70711 12.2929C1.51957 12.1054 1.26522 12 1 12C0.734784 12 0.48043 12.1054 0.292893 12.2929C0.105357 12.4804 0 12.7348 0 13V17C0 17.7956 0.316071 18.5587 0.87868 19.1213C1.44129 19.6839 2.20435 20 3 20H17C17.7956 20 18.5587 19.6839 19.1213 19.1213C19.6839 18.5587 20 17.7956 20 17V13C20 12.7348 19.8946 12.4804 19.7071 12.2929C19.5196 12.1054 19.2652 12 19 12ZM9.29 13.71C9.3851 13.801 9.49725 13.8724 9.62 13.92C9.7397 13.9729 9.86913 14.0002 10 14.0002C10.1309 14.0002 10.2603 13.9729 10.38 13.92C10.5028 13.8724 10.6149 13.801 10.71 13.71L14.71 9.71C14.8983 9.5217 15.0041 9.2663 15.0041 9C15.0041 8.7337 14.8983 8.4783 14.71 8.29C14.5217 8.1017 14.2663 7.99591 14 7.99591C13.7337 7.99591 13.4783 8.1017 13.29 8.29L11 10.59V1C11 0.734784 10.8946 0.48043 10.7071 0.292893C10.5196 0.105357 10.2652 0 10 0C9.73478 0 9.48043 0.105357 9.29289 0.292893C9.10536 0.48043 9 0.734784 9 1V10.59L6.71 8.29C6.61676 8.19676 6.50607 8.1228 6.38425 8.07234C6.26243 8.02188 6.13186 7.99591 6 7.99591C5.86814 7.99591 5.73757 8.02188 5.61575 8.07234C5.49393 8.1228 5.38324 8.19676 5.29 8.29C5.19676 8.38324 5.1228 8.49393 5.07234 8.61575C5.02188 8.73757 4.99591 8.86814 4.99591 9C4.99591 9.13186 5.02188 9.26243 5.07234 9.38425C5.1228 9.50607 5.19676 9.61676 5.29 9.71L9.29 13.71Z" fill="#A53DFF" />
                                </svg>

                                <p className="text-[#A53DFF] text-[16px] font-[600] group-hover:text-[#ffffff]">Download CV</p>
                            </Link>
                        </div>
                    </div>

                </section>
            </div>
        </article>

    )
}
