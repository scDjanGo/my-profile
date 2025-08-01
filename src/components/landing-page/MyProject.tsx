import Image from 'next/image';
import { PortfolioData, PetProjects } from './../../data/PorfolioData';
import Link from 'next/link';

export default function MyProject() {
    return (
        <>
        <section style={{backgroundImage: "url('/img/bg.png')", backgroundSize: "cover"}} className="bg-[#ffffff] p-[100px_300px_50px] 1560:p-[60px_30px_50px] flex flex-col items-center justify-center ">
            <div className="w-full flex items-center justify-center flex-col">
                <h2 className="text-[#132238] text-[48px] font-[600] 795:text-[26px]">Portfolio</h2>
                <p className="text-center font-[400] text-[#87909D] text-[18px]  795:text-[14px]">
                    even more projects can be seen in my GitHub
                </p>
            </div>

            <div className='w-full mt-[70px] grid grid-cols-[repeat(auto-fit,_minmax(280px,_auto))] gap-[32px] justify-center   drop-shadow-[0_10px_10px_rgba(43,56,76,0.1)]'>
                {PortfolioData.map(item =>
                    <Link  href={item.link}  target='blank' key={item.id} className='flex flex-col h-full justify-between rounded-[22px] cursor-pointer duration-200 group hover:scale-[1.02] '>
                        <div className='max-w-[424px] max-h-[248px]'>
                            <Image width={424} height={248} className='object-cover w-full min-h-[248px] h-full rounded-[22px_22px_0_0]  795:rounded-[10px_10px_0_0]' src={item.img} alt='#' />
                        </div>

                        <div className='p-[32px] 795:p-[14px] flex flex-col h-full bg-[#ffffff] rounded-[0_0_22px_22px] 795:rounded-[0_0_10px_10px] border-t-[1px] border-[#A53DFF]'>
                            <p className='text-[#87909D] text-[12px] font-[500]'>{item.tag}</p>
                            <h2 className='text-[#132238] text-[18px] mt-[4px] mb-[12px] font-[600]'>{item.title}</h2>
                            <h5 className='text-[#556070] mb-[20px] text-[14px] font-[500]'>{item.description}</h5>

                            <button className='flex w-[173px] 795:w-[120px] items-center duration-300 gap-[18px] group-hover:bg-[#A53DFF] p-[12px_24px] 795:p-[6px_12px] border-[1px] border-[#A53DFF] hover:border-[#ffffff] rounded-[4px]'>
                                <span className='text-[#A53DFF] group-hover:text-[#ffffff] text-[16px] font-[600] 795:text-[12px]'>case study</span>
                                <svg className='group-hover:fill-[#ffffff]' width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path className='group-hover:fill-[#ffffff]' d="M11.92 5.61994C11.8724 5.49719 11.801 5.38505 11.71 5.28994L6.71 0.289941C6.61676 0.196703 6.50607 0.122742 6.38425 0.0722818C6.26243 0.0218215 6.13186 -0.00415039 6 -0.00415039C5.7337 -0.00415039 5.4783 0.101638 5.29 0.289941C5.19676 0.38318 5.1228 0.49387 5.07234 0.615692C5.02188 0.737514 4.99591 0.868082 4.99591 0.999941C4.99591 1.26624 5.1017 1.52164 5.29 1.70994L8.59 4.99994H1C0.734784 4.99994 0.48043 5.1053 0.292893 5.29283C0.105357 5.48037 0 5.73472 0 5.99994C0 6.26516 0.105357 6.51951 0.292893 6.70705C0.48043 6.89458 0.734784 6.99994 1 6.99994H8.59L5.29 10.2899C5.19627 10.3829 5.12188 10.4935 5.07111 10.6154C5.02034 10.7372 4.9942 10.8679 4.9942 10.9999C4.9942 11.132 5.02034 11.2627 5.07111 11.3845C5.12188 11.5064 5.19627 11.617 5.29 11.7099C5.38296 11.8037 5.49356 11.8781 5.61542 11.9288C5.73728 11.9796 5.86799 12.0057 6 12.0057C6.13201 12.0057 6.26272 11.9796 6.38458 11.9288C6.50644 11.8781 6.61704 11.8037 6.71 11.7099L11.71 6.70994C11.801 6.61484 11.8724 6.50269 11.92 6.37994C12.02 6.13648 12.02 5.8634 11.92 5.61994Z" fill="#A53DFF" />
                                </svg>
                            </button>
                        </div>
                    </Link>
                )}
            </div>


            <div className='w-full flex justify-center mt-[50px]'>
                <Link href={"https://github.com/scDjanGo"} target='blank' className='bg-[#A53DFF] rounded-[4px] text-[#ffffff] p-[12px_24px] border-[1px] border-[#A53DFF] duration-200 hover:text-[#A53DFF] hover:bg-[#ffffff]'>More Project</Link>
            </div>



        </section>
        <section style={{backgroundImage: "url('/img/bg.png')", backgroundSize: "cover"}} className="bg-[#ffffff] p-[100px_300px_50px] 1560:p-[60px_30px_50px] flex flex-col items-center justify-center ">
            <div className="w-full flex items-center justify-center flex-col">
                <h2 className="text-[#132238] text-[48px] font-[600] 795:text-[26px]">Pet projects</h2>
                <p className="text-center font-[400] text-[#87909D] text-[18px]  795:text-[14px]">
                    My projects that are useful to people : )
                </p>
            </div>

            <div className='w-full mt-[70px] grid grid-cols-[repeat(auto-fit,_minmax(280px,_424px))] gap-[32px] justify-center   drop-shadow-[0_10px_10px_rgba(43,56,76,0.1)]'>
                {PetProjects.map(item =>
                    <Link  href={item.link}  target='blank' key={item.id} className='flex flex-col h-full justify-between rounded-[22px] cursor-pointer duration-200 group hover:scale-[1.02] '>
                        <div className='max-w-[424px] max-h-[248px]'>
                            <Image width={424} height={248} className='object-cover w-full min-h-[248px] h-full rounded-[22px_22px_0_0]  795:rounded-[10px_10px_0_0]' src={item.img} alt='#' />
                        </div>

                        <div className='p-[32px] 795:p-[14px] flex flex-col h-full bg-[#ffffff] rounded-[0_0_22px_22px] 795:rounded-[0_0_10px_10px] border-t-[1px] border-[#A53DFF]'>
                            <p className='text-[#87909D] text-[12px] font-[500]'>{item.tag}</p>
                            <h2 className='text-[#132238] text-[18px] mt-[4px] mb-[12px] font-[600]'>{item.title}</h2>
                            <h5 className='text-[#556070] mb-[20px] text-[14px] font-[500]'>{item.description}</h5>

                            <button className='flex w-[173px] 795:w-[120px] items-center duration-300 gap-[18px] group-hover:bg-[#A53DFF] p-[12px_24px] 795:p-[6px_12px] border-[1px] border-[#A53DFF] hover:border-[#ffffff] rounded-[4px]'>
                                <span className='text-[#A53DFF] group-hover:text-[#ffffff] text-[16px] font-[600] 795:text-[12px]'>case study</span>
                                <svg className='group-hover:fill-[#ffffff]' width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path className='group-hover:fill-[#ffffff]' d="M11.92 5.61994C11.8724 5.49719 11.801 5.38505 11.71 5.28994L6.71 0.289941C6.61676 0.196703 6.50607 0.122742 6.38425 0.0722818C6.26243 0.0218215 6.13186 -0.00415039 6 -0.00415039C5.7337 -0.00415039 5.4783 0.101638 5.29 0.289941C5.19676 0.38318 5.1228 0.49387 5.07234 0.615692C5.02188 0.737514 4.99591 0.868082 4.99591 0.999941C4.99591 1.26624 5.1017 1.52164 5.29 1.70994L8.59 4.99994H1C0.734784 4.99994 0.48043 5.1053 0.292893 5.29283C0.105357 5.48037 0 5.73472 0 5.99994C0 6.26516 0.105357 6.51951 0.292893 6.70705C0.48043 6.89458 0.734784 6.99994 1 6.99994H8.59L5.29 10.2899C5.19627 10.3829 5.12188 10.4935 5.07111 10.6154C5.02034 10.7372 4.9942 10.8679 4.9942 10.9999C4.9942 11.132 5.02034 11.2627 5.07111 11.3845C5.12188 11.5064 5.19627 11.617 5.29 11.7099C5.38296 11.8037 5.49356 11.8781 5.61542 11.9288C5.73728 11.9796 5.86799 12.0057 6 12.0057C6.13201 12.0057 6.26272 11.9796 6.38458 11.9288C6.50644 11.8781 6.61704 11.8037 6.71 11.7099L11.71 6.70994C11.801 6.61484 11.8724 6.50269 11.92 6.37994C12.02 6.13648 12.02 5.8634 11.92 5.61994Z" fill="#A53DFF" />
                                </svg>
                            </button>
                        </div>
                    </Link>
                )}
            </div>


            <div className='w-full flex justify-center mt-[50px]'>
                <Link href={"https://github.com/scDjanGo"} target='blank' className='bg-[#A53DFF] rounded-[4px] text-[#ffffff] p-[12px_24px] border-[1px] border-[#A53DFF] duration-200 hover:text-[#A53DFF] hover:bg-[#ffffff]'>More Project</Link>
            </div>



        </section>
        </>
    )
}
