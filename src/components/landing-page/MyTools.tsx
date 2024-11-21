import { Tools } from "@/data/Tools"
import Image from "next/image"

export default function MyTools() {
    return (
        <div className="mt-[60px] bg-[#333333] text-[#ffffff]">
            <h2 className="text-center text-[64px] font-[700] 795:text-[32px] pt-[24px] px-[100px] 1240:px-[15px]">
                Мой стек
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(120px,_130px))] 795:grid-cols-[repeat(auto-fit,_minmax(80px,_90px))] justify-center px-[100px] py-[25px] 1240:px-[15px]">
                {Tools.map(item =>
                    <div key={item.id} className="max-h-[150px] border-[1px] p-[15px]">
                        <Image width={140} height={140} src={item.img} alt="#" className="h-full w-full" />
                    </div>
                )}
            </div>

            <div className=" px-[100px] 1240:px-[15px]  py-[24px]">

                <h3 className="text-[32px] font-[700] 795:text-[22px] pt-[24px]">Коротко о моем стеке</h3>


                <ul className="flex flex-col gap-[15px] mt-[12px]">
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer hover:drop-shadow-[0_40px_40px_#ffffff]"><strong>React</strong> — для создания динамичных интерфейсов.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>Redux</strong> — управление состоянием приложений.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>React-Router</strong> — для маршрутизации и навигации.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>Axios</strong> — для работы с API и обработки HTTP-запросов.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>TypeScript</strong> — помогает писать надёжный и типизированный код.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>JavaScript</strong> — основа для интерактивности и функционала.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>Tailwind CSS</strong> — для быстрой и удобной стилизации.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>SASS/SCSS</strong>, <strong>CSS</strong>, <strong>HTML</strong> — для создания адаптивных и стильных интерфейсов.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>Next.js</strong> — для серверного рендеринга и оптимизации приложений.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>Git</strong>, <strong>GitHub</strong> — для управления версиями и командной работы.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>npm</strong>, <strong>yarn</strong> — для управления зависимостями в проектах.</li>
                    <li className="border-b-[1px] border-[#ffffff] w-auto hover:scale-[1.03] cursor-pointer "><strong>VSCode</strong> — мой основной редактор для написания и отладки кода.</li>
                </ul>


            </div>

        </div>
    )
}
