"use client";

import Slider from "./Slider";
import Link from "next/link";

export default function Footer() {
  const handleCopyWatsAppNumber = () => {
    const textToCopy = "+996557766997";
    navigator.clipboard.writeText(textToCopy);
  };

  const handleCopyEmail = () => {
    const textToCopy = "bek229101@gmail.com";
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <footer id="footer">
      <h3 className=" bg-[#2B384C] pt-[150px] 795:p-[50px] text-[#ffffff] text-center text-[64px] font-[700] 795:text-[46px]">
        My contacts
      </h3>

      <div className="relative p-[50px_300px_250px] 1560:p-[50px_30px_200px] bg-[#2B384C] flex flex-col gap-[60px] justify-center items-center">
        <Slider />
        <div className="max-w-[900px] w-full grid grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] gap-[12px] justify-center">
          <div className="flex flex-col items-center">
            <Link
              href={"https://github.com/scDjanGo/"}
              target="blank"
              className="text-[#F0F1F3] text-[32px] font-[400] duration-200 hover:scale-[1.05] cursor-pointer group"
            >
              <span className="group-hover:text-blue-300">G</span>
              <span className="group-hover:text-blue-600">i</span>
              <span className="group-hover:text-blue-300">t</span>
              <span className="group-hover:text-yellow-400">H</span>
              <span className="group-hover:text-blue-400">u</span>
              <span className="group-hover:text-yellow-400">b</span>
            </Link>
          </div>
          <div className="flex flex-col items-center">
            <Link
              href={
                "https://www.linkedin.com/in/asadbek-kasymov-ab080a31b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              }
              target="blank"
              className="text-[#F0F1F3] text-[32px] font-[400] duration-200 hover:scale-[1.05] cursor-pointer group"
            >
              Linked<span className="group-hover:text-blue-800">In</span>
            </Link>
          </div>
          <div className="flex flex-col items-center">
            <Link
              href={"https://t.me/scDjanGo"}
              target="blank"
              className="text-[#F0F1F3] text-[32px] font-[400] duration-200 hover:scale-105 cursor-pointer hover:text-blue-400"
            >
              Telegram
            </Link>
          </div>
          <div className="flex flex-col items-center">
            <Link
              href={
                "mailto:bek229101@gmail.com@example.com?subject=Hello&body=I%20have%20a%20question%20for%20you."
              }
              target="blank"
              className="text-[#F0F1F3] text-[32px] font-[400] duration-200 hover:scale-105 cursor-pointer group"
            >
              <span className="group-hover:text-blue-400">G</span>
              <span className="group-hover:text-red-400">m</span>
              <span className="group-hover:text-yellow-400">a</span>
              <span className="group-hover:text-green-400">i</span>
              <span className="group-hover:text-blue-400">l</span>
            </Link>
            <p
              onClick={handleCopyEmail}
              title="Copy email address"
              id="copyWatsApp"
              className="text-[#F0F1F3] text-[16px] font-[400] duration-200 hover:scale-[1.05] cursor-copy mt-[6px] hover:text-blue-400"
            >
              bek229101@gmail.com
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Link
              href={"https://wa.me/996557766997?text=Привет"}
              target="blank"
              className="text-[#F0F1F3] text-[32px] font-[400] duration-200 hover:scale-105 cursor-pointer hover:text-green-400"
            >
              WhatsApp
            </Link>
            <p
              onClick={handleCopyWatsAppNumber}
              title="Copy WatsApp number"
              id="copyWatsApp"
              className="text-[#F0F1F3] text-[16px] font-[400] duration-200 hover:scale-[1.05] cursor-copy mt-[6px] hover:text-green-400"
            >
              +996 (557) 766 997
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
