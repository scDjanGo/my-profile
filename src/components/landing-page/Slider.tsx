import Image from "next/image";

export default function Slider() {
    const arr = [
        { id: 3, img: "/svg/sass.svg", title: "SASS/SCSS" },
        { id: 5, img: "/svg/js.svg", title: "JavaScript" },
        { id: 7, img: "/svg/react.svg", title: "React" },
        { id: 6, img: "/svg/typescript.svg", title: "TypeScript" },
        { id: 4, img: "/svg/tailwindcss.svg", title: "tailwindcss" },
        { id: 2, img: "/svg/css.svg", title: "CSS" },
        { id: 14, img: "/svg/yarn.svg", title: "yarn" },
        { id: 15, img: "/svg/vscode.svg", title: "VSCode" },
        { id: 11, img: "/svg/github.svg", title: "GitHub" },
        { id: 8, img: "/img/logo-nextjs.png", title: "Next.js" },
        { id: 9, img: "/svg/redux.svg", title: "Redux" },
        { id: 12, img: "/svg/react-router.svg", title: "React-Router" },
        { id: 13, img: "/svg/git.svg", title: "Git" },
        { id: 10, img: "/svg/npm.svg", title: "npm" },
        { id: 1, img: "/svg/html.svg", title: "HTML" },
    ];

    return (
        <section className="absolute bg-[#333333] bg-opacity-[.5] pt-[10px] max-h-[10dvh] h-full bottom-0 left-0 overflow-hidden whitespace-nowrap w-full">
            <div className="flex animate-scroll h-full gap-[50px] 795:gap-[15px]">
                {arr.map((item) => (
                    <div key={item.id} className="mr-4 flex flex-col items-center justify-center gap-[3px]">
                        <div className="w-40px h-[40px]">
                            <Image width={40} height={40} className=" min-w-[40px] !w-[40px] h-[40px]" src={item.img} alt={item.title} />
                        </div>
                        <p className="whitespace-nowrap text-[12px] font-[400] text-[#ffffff]">{item.title}</p>
                    </div>
                ))}
                {arr.map((item) => (
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
