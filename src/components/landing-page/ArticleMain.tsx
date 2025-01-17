// import Image from "next/image"


// export default function ArticleMain() {



//   return (
//     <article style={{backgroundImage: "url('/img/bg.png')", backgroundSize: "cover"}} className="p-[20px_300px_28px] bg-[#ffffff] 1560:p-[20px_30px_28px]">

//       <section className="flex items-center justify-center 795:flex-col ">
//         <div id="article-left" className="flex flex-col 795:items-center gap-[24px] max-w-[650px] 795:max-w-[390px] 795:gap-[16px]">
//           <h3 className="text-[#132238] text-[72px] 795:text-[26px] font-[600]">
//             Hello, I’m
//             Asadbek
//           </h3>
//           <p className="text-[18px] 795:text-[14px] font-[400] 795:text-center text-[#556070]">
//             I am a Frontend Developer. I am passionate about creating interfaces that make interacting with websites and applications not only convenient but also enjoyable.
//           </p>
//         </div>

//         <div id="article-right" className="max-w-[536px] max-h-[636px] 995:max-w-[390px] 995:max-h-[490px]">
//           <Image width={536} height={636} className="max-w-[536px] max-h-[636px] 995:max-w-[390px] 995:max-h-[490px] 695:w-[300px] rounded-[22px]" src={"/img/me.png"} alt="#" priority />
//         </div>
//       </section>



//     </article>
//   )
// }




"use client"


import { motion } from "framer-motion";
import Image from "next/image";

export default function ArticleMain() {
  const textVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const imageVariant = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  };

  return (
    <article
      style={{ backgroundImage: "url('/img/bg.png')", backgroundSize: "cover" }}
      className="p-[20px_300px_28px] bg-[#ffffff] 1560:p-[20px_30px_28px]"
    >
      <section className="flex items-center justify-center 795:flex-col ">
        <motion.div
          id="article-left"
          className="flex flex-col 795:items-center gap-[24px] max-w-[650px] 795:max-w-[390px] 795:gap-[16px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={textVariant}
        >
          <h3 className="text-[#132238] text-[72px] 795:text-[26px] font-[600]">
            Hello, I’m Asadbek
          </h3>
          <p className="text-[18px] 795:text-[14px] font-[400] 795:text-center text-[#556070]">
            I am a Frontend Developer. I am passionate about creating interfaces
            that make interacting with websites and applications not only
            convenient but also enjoyable.
          </p>
        </motion.div>

        <motion.div
          id="article-right"
          className="max-w-[536px] max-h-[636px] 995:max-w-[390px] 995:max-h-[490px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={imageVariant}
        >
          <Image
            width={536}
            height={636}
            className="max-w-[536px] max-h-[636px] 995:max-w-[390px] 995:max-h-[490px] 695:w-[300px] rounded-[22px]"
            src={"/img/me.png"}
            alt="#"
            priority
          />
        </motion.div>
      </section>
    </article>
  );
}
