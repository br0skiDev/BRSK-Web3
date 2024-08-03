import { BuyTokenCard } from "@/components/etc/BuyTokenCard";
import Image from "next/image";


export default function Home() {

  return (
    <div className="flex items-center justify-center w-full h-full">
        <BuyTokenCard />
        <div className="absolute left-2 bottom-2 flex flex-col text-slate-950">
            <h1 className="font-bold text-md text-emerald-300">Sepolia ETH Netzwerk</h1>
            <div className="w-fit h-fit select-none p-2 rounded-lg backdrop-blur-lg drop-shadow-xl text-xs font-light text-emerald-100">
                Token Contract: <span className="select-all font-black text-slate-950 text-[10.5pt] ml-2">0x529bBdF560b5b3F5467b47F1B86E9805e4bC1e60</span>
            </div>
            <div className="w-fit h-fit select-none p-2 rounded-lg backdrop-blur-lg drop-shadow-xl text-xs font-light text-emerald-100">
                Presale Contract: <span className="select-all font-black text-slate-950 text-[10.5pt] ml-2">0x1982262c44852d7CF18f7c3D32DdeeB356013d87</span>
            </div>
        </div>
    </div>
  );
}
