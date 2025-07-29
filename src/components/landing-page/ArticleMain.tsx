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

"use client";

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
          <div style={{ maxWidth: 536, height: 636, overflow: "hidden" }}>
            <svg width="0" height="0">
              <defs>
                <clipPath id="moreWavesBlob" clipPathUnits="objectBoundingBox">
                  <path
                    d="
          M0,0.15
          C0.1,0.05 0.2,0.2 0.3,0.15
          C0.4,0.1 0.5,0.25 0.6,0.15
          C0.7,0.05 0.8,0.2 0.9,0.15
          C1,0.1 1,0.2 1,0.15
          L1,0.85
          C0.9,0.95 0.8,0.8 0.7,0.85
          C0.6,0.9 0.5,0.75 0.4,0.85
          C0.3,0.95 0.2,0.8 0.1,0.85
          C0,0.9 0,0.8 0,0.85
          Z
        "
                  />
                </clipPath>
              </defs>
            </svg>

            <Image
              width={536}
              height={636}
              src="/img/me_3.png"
              alt="#"
              priority
              style={{ clipPath: "url(#moreWavesBlob)" }}
              className="w-full h-full object-cover "
            />
          </div>
        </motion.div>
      </section>
    </article>
  );
}
