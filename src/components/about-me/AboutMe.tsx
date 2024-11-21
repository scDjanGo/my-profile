"use client"
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AboutMe() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const element = document.getElementById("about-me");
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                    setIsVisible(true);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="mt-[60px]">
            <h2 className="text-center text-[64px] font-[700] 795:text-[32px]">
                О себе
            </h2>
            <div
                id="about-me"
                className={`flex flex-col items-start justify-start gap-[24px] 795:gap-[16px] mt-[14px] px-[100px] 1240:px-[15px] min-h-[100dvh] transition-all duration-700 ease-in-out ${isVisible ? "scale-x-100" : "scale-x-0"
                    }`}
            >
                <div className="flex w-full items-center justify-between gap-[24px] 795:flex-col-reverse 795:gap-[16px]">
                    <Image
                        layout="responsive"
                        width={400}
                        height={200}
                        className="max-w-[400px] w-full rounded-[16px]"
                        src="/img/main2.png"
                        alt="#"
                    />
                    <div className="flex items-center justify-center gap-[8px] flex-col">
                        <h2 className="text-[22px] font-[700] text-[#333333] text-center max-w-[800px] 1240:text-[18px]">
                            Привет
                        </h2>
                        <h4 className="text-[18px] font-[400] text-[#333333] text-center max-w-[800px] 1240:text-[16px] text-content">
                            Меня зовут Асадбек, я — Frontend разработчик. Я увлечён созданием интерфейсов, которые делают взаимодействие с сайтами и приложениями не только удобным, но и приятным. Моя цель — делать технологии доступными и понятными для каждого пользователя, превращая их взаимодействие с продуктом в простой и приятный процесс.
                            Каждый проект для меня — это возможность найти баланс между функциональностью и дизайном, чтобы результат был не только эффективным, но и красивым. Я всегда стараюсь сделать так, чтобы конечный продукт приносил реальную пользу и оставлял хорошее впечатление.
                        </h4>
                    </div>
                </div>

                <div className="flex w-full items-center justify-between gap-[24px] 795:flex-col 795:gap-[16px]">
                    <div className="flex items-center justify-center gap-[8px] flex-col">
                        <h2 className="text-[22px] font-[700] text-[#333333] text-center max-w-[800px] 1240:text-[18px]">
                            Мои интересы
                        </h2>
                        <h4 className="text-[18px] font-[400] text-[#333333] text-center max-w-[800px] 1240:text-[16px] text-content">

                            Меня всегда интересовало, как всё работает. Будь то сложный аппарат или обычный инструмент — я люблю разбираться в устройстве вещей, понимать их принципы и механизм работы. Это увлечение не ограничивается только технологиями, но и распространяется на всё вокруг: от электроники до повседневных предметов. Я часто исследую, как и почему что-то функционирует, и это помогает мне подходить к решению задач с более глубоким пониманием и креативностью.
                        </h4>
                    </div>
                    <Image
                        layout="responsive"
                        width={400}
                        height={200}
                        className="max-w-[400px] w-full rounded-[16px]"
                        src="/img/main2.png"
                        alt="#"
                    />
                </div>

                <div className="flex w-full items-center justify-between gap-[24px] 795:flex-col-reverse 795:gap-[16px]">
                    <Image
                        layout="responsive"
                        width={400}
                        height={200}
                        className="max-w-[400px] w-full rounded-[16px]"
                        src="/img/main2.png"
                        alt="#"
                    />
                    <div className="flex items-center justify-center gap-[8px] flex-col">
                        <h2 className="text-[22px] font-[700] text-[#333333] text-center max-w-[800px] 1240:text-[18px]">
                            Моё любимое хобби
                        </h2>
                        <h4 className="text-[18px] font-[400] text-[#333333] text-center max-w-[800px] 1240:text-[16px] text-content">

                            Готовить — это одно из моих любимых хобби. Я превращаюсь в кулинара-экспериментатора: что-то подбрасываю, что-то добавляю, а потом с удивлением наблюдаю, что из этого получается. Иногда результат выходит прямо шедевр, а иногда… ну, по крайней мере, я знаю, что будет заготовка для следующего ужина. Главное — процесс! И, конечно, момент, когда все счастливо едят и хвалят, потому что никто не хочет говорить, что это на самом деле не так вкусно, как выглядело на фото в рецепте.
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
