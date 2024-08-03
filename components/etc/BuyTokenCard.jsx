"use client"
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { FaExchangeAlt } from "react-icons/fa";


export const BuyTokenCard = () => {

    const [inputValue, setInputValue] = useState('');
    const [priceValue, setPriceValue] = useState('Choose BRSK amount');
    const [connectedAddress, setConnectedAddress] = useState(null);

    const handleInputChange = (event) => {
      setInputValue(event.target.value);
    };

    useEffect(() => {
        const price = inputValue * 0.0038364
        if(inputValue){
            setPriceValue(price)
        }
    }, [inputValue])


    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setConnectedAddress(accounts[0]);
            } catch (error) {
                console.error("Error connecting to wallet:", error);
            }
        } else {
            console.error("Metamask is not installed");
        }
    };

    const disconnectWallet = () => {
        setConnectedAddress(null);
    };


  return (
    <div className='rounded-md h-fit w-[268px] flex flex-col bg-gray-800/70 border border-slate-50/10 drop-shadow-xl px-3 py-4'>
        <div className='flex h-[82px] w-fit'>
            <div className='mr-2 z-20 flex'>
                <Image src={"/assets/logo.png"} alt='' width={82} height={82} className='border-2 border-violet-50/70 rounded-full' />
            </div>
            <div className='z-20 flex h-full flex-col justify-center'>
                <h1 className='text-white text-2xl font-black tracking-tight'>Buy BRSK</h1>
                <h2 className='text-white text-xl font-light tracking-wider'>now!</h2>
            </div>
        </div>

        <div className="w-full bg-gray-900 rounded-lg p-2">
            <h1 className='text-xs text-slate-50 font-semibold z-20'>Get your Token!</h1>
        </div>

        <div className='w-full flex flex-col mt-2'>
            <h1 className='text-white font-extralight text-xs'>Wallet connected: </h1>
            <p className={`${connectedAddress ? "text-xs text-green-500 font-bold text-[7.2pt]" : "text-xs text-red-500 font-bold text-[7.2pt]"}`}>{connectedAddress ? connectedAddress : "No wallet connected..."}</p>
                {connectedAddress ? (
                    <div className='w-full flex justify-center items-center'>
                        <button onClick={disconnectWallet} className='px-2 py-[1px] rounded-full bg-slate-50 w-fit border-2 border-slate-50 text-xs mt-1 hover:bg-slate-200'>Disconnect Wallet</button>
                    </div>
                    ) : (
                        <div className='w-full flex justify-center items-center'>
                            <button onClick={connectWallet} className='px-2 py-[1px] rounded-full bg-slate-50 w-fit border-2 border-slate-50 text-xs mt-1 hover:bg-slate-200'>Connect Wallet</button>
                        </div>
                    )}
            </div>


        <div className='mt-2 w-full bg-gray-50/10 flex justify-center py-3 rounded-sm'>
            <p className='text-md text-slate-100'>
                Buy BRSK with SepoliaETH
            </p>
        </div>

        <div className='w-full grid grid-cols-3 mt-2 py-4 px-2 bg-slate-50/10 rounded'>
            <div className='flex justify-center items-center'>
                <Image src={"/assets/logo.png"} alt='BRSK' width={60} height={60} className='flex border-2 border-slate-300 rounded-full' />
            </div>
            <div className='flex justify-center items-center'>
                <FaExchangeAlt className='text-slate-50 text-4xl'/>
            </div>
            <div className='flex justify-center items-center'>
                <Image src={"/assets/eth.png"} alt='ETH' width={60} height={60} className='flex border-2 border-slate-300 rounded-full' />
            </div>
        </div>

        <form className='w-full h-fit flex flex-col mt-2'>
            <div className='grid grid-cols-1 gap-2'>
                <div className='flex justify-between items-center'>
                    <h1 className='text-slate-50 font-semibold underline-offset-4 underline'>BRSK</h1>
                        <input
                        id="brsk_input"
                        type="number"
                        value={inputValue}
                        onChange={handleInputChange}
                        className='rounded focus:ring-0 focus:outline-none text-xs w-[175px] p-2'
                        />
                </div>

                <div className='flex justify-between items-center'>
                    <h1 className='text-slate-50 font-semibold underline-offset-4 underline'>Sepolia</h1>
                    <input
                    id="price_input"
                    type="text"
                    value={priceValue}
                    className='rounded focus:ring-0 focus:outline-none text-xs w-[175px] p-2'
                    />
                </div>
            </div>

            <button onClick={() => {console.log("Kaka")}} className='w-full py-2 border-2 border-slate-50 rounded-lg mt-3 font-bold tracking-tighter text-3xl text-slate-50 bg-gray-900 hover:bg-opacity-50'>BUY</button>
        </form>


    </div>
  )
}
