import Image from "next/image"

export default function ArticleMain() {
  const arr = [
    
  ]



  return (
    <article style={{ backgroundImage: "url('/img/bg.png')", backgroundSize: "cover" }} className="p-[20px_300px_28px] 1560:p-[20px_30px_28px]">

      <section className=" flex items-center 795:flex-col ">
        <div className="flex flex-col 795:items-center gap-[24px] max-w-[650px] 795:max-w-[390px] 795:gap-[16px]">
          <h3 className="text-[#132238] text-[72px] 795:text-[26px] font-[600]">
            Hello, I’m
            Asadbek
          </h3>
          <p className="text-[18px] 795:text-[14px] font-[400] 795:text-center text-[#556070]">
            I am a Frontend Developer. I am passionate about creating interfaces that make interacting with websites and applications not only convenient but also enjoyable.
          </p>
        </div>

        <div className="max-w-[536px] max-h-[636px] 995:max-w-[390px] 995:max-h-[490px]">
          <Image width={536} height={636} className="max-w-[536px] max-h-[636px] 995:max-w-[390px] 995:max-h-[490px] 695:w-[300px]" src={"/img/1.png"} alt="#" priority />
        </div>
      </section>



      <div className="w-full items-center justify-center">
        <section className="max-w-[1320px] p-[112px]">
          <div className="relative">
            <Image width={424} height={468} className="max-w-[424px] max-h-[468px] 995:max-w-[212px] 995:max-h-[234px] 695:w-[180px]" src={"/img/1.png"} alt="#" priority />




            <div className="max-w-[264px]">

            </div>
          </div>

        </section>
      </div>


    </article>
  )
}
