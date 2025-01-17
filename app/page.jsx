"use client"
import { BuyTokenCard } from "@/components/etc/BuyTokenCard";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { motion } from 'framer-motion'


export default function Home() {

  return (
    <div className="flex items-center justify-center w-full h-full">

        <motion.div
            className="h-full w-fit z-20"
           initial={{ opacity: 0, x: 200}}
           animate={{ opacity: 1, x: 0}}
           transition={{ duration: 0.3 }}
        >
            <Image priority src={"/assets/presale.png"} alt="PRESALE" width={81} height={209} className="z-20 w-auto h-full mr-[-15px]" />
        </motion.div>


        <BuyTokenCard />

        <div className='absolute bottom-[30px] right-[45px]'>
            <Link href={"/balance"}>
                <div className='py-[5px] px-[12px] rounded-full border-[0px] shadow-xl text-slate-50 hover:border-slate-200/50 hover:border-2 flex gap-2'>
                    See Balance <ArrowRight className='w-[15px]' />
                </div>
            </Link>
        </div>

        <div className="absolute left-2 bottom-2 flex flex-col text-slate-950">
        <div className="flex gap-2 items-center ml-2">
            <Image src={"/assets/sepolia.png"} alt="" width={30} height={30} />
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
