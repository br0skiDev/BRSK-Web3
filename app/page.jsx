import { BuyTokenCard } from "@/components/etc/BuyTokenCard";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


export default function Home() {

  return (
    <div className="flex items-center justify-center w-full h-full">


        <Image src={"/assets/presale.png"} alt="" width={90} height={600} className="z-50" />
        <BuyTokenCard />

        <div className='absolute bottom-[30px] right-[45px]'>
            <Link href={"/balance"}>
                <div className='py-[5px] px-[12px] rounded-full border-[0px] shadow-xl text-slate-50 hover:border-slate-200/50 hover:border-2 flex gap-2'>
                    See Balance <ArrowRight className='w-[15px]' />
                </div>
            </Link>
        </div>

        <div className="absolute left-2 bottom-2 flex flex-col text-slate-950">
        <div className="flex gap-2 items-center">
            <Image src={"/assets/sepolia.png"} alt="" width={34} height={34} />
            <h1 className="font-bold text-md text-emerald-300">SepoliaETH</h1>
        </div>
            <div className="w-fit h-fit select-none p-2 rounded-lg backdrop-blur-lg drop-shadow-xl text-xs font-light text-emerald-100">
                Token Contract: <span className="select-all font-black text-emerald-250 text-[10.5pt] ml-2">{process.env.NEXT_PUBLIC_TOKEN_ADDRESS}</span>
            </div>
            <div className="w-fit h-fit select-none p-2 rounded-lg backdrop-blur-lg drop-shadow-xl text-xs font-light text-emerald-100">
                Presale Contract: <span className="select-all font-black text-emerald-250 text-[10.5pt] ml-2">{process.env.NEXT_PUBLIC_PRESALE_ADDRESS}</span>
            </div>
        </div>
    </div>
  );
}
