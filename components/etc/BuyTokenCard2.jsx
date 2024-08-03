"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { ethers } from 'ethers';
import { presaleABI } from '@/lib/presaleABI'; // Stelle sicher, dass das ABI korrekt ist

const TOKEN_ADDRESS = "0x529bBdF560b5b3F5467b47F1B86E9805e4bC1e60"; // Neue Token-Adresse
const PRESALE_ADDRESS = "0x1982262c44852d7CF18f7c3D32DdeeB356013d87"; // Neue Presale-Adresse
const RATE = 100; // 1 ETH = 100 BRSK

export const BuyTokenCard2 = () => {
    const [inputValue, setInputValue] = useState('');
    const [priceValue, setPriceValue] = useState('Choose BRSK amount');
    const [connectedAddress, setConnectedAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [presaleContract, setPresaleContract] = useState(null);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    useEffect(() => {
        if (inputValue && RATE > 0) {
            const priceInETH = (inputValue / RATE).toFixed(6);
            setPriceValue(priceInETH);
        } else {
            setPriceValue('Choose BRSK amount');
        }
    }, [inputValue]);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                await _provider.send("eth_requestAccounts", []);
                const _signer = await _provider.getSigner();
                setProvider(_provider);
                setSigner(_signer);
                const accounts = await _provider.listAccounts();
                if (accounts.length > 0) {
                    setConnectedAddress(accounts[0]);
                } else {
                    setConnectedAddress(null);
                }

                // Initializing the Presale Contract
                const _presaleContract = new ethers.Contract(PRESALE_ADDRESS, presaleABI, _signer);
                setPresaleContract(_presaleContract);

                // Debugging: Log Contract Methods
                console.log("Presale Contract:", _presaleContract);
                console.log("Presale Contract Methods:", Object.keys(_presaleContract.interface.functions));
            } catch (error) {
                console.error("Error connecting to wallet:", error);
            }
        } else {
            console.error("MetaMask is not installed");
        }
    };

    const disconnectWallet = () => {
        setConnectedAddress(null);
        setProvider(null);
        setSigner(null);
        setPresaleContract(null);
    };

    const buyTokens = async () => {
        if (!presaleContract) {
            console.error("Presale contract is not initialized");
            return;
        }

        if (!inputValue) {
            console.error("Input value is not set");
            return;
        }

        try {
            const amountInETH = priceValue;
            const amountInWei = ethers.parseEther(amountInETH);
            console.log("Amount in Wei:", amountInWei.toString());

            // Execute transaction
            const tx = await presaleContract.buyTokens({ value: amountInWei });
            await tx.wait();
            alert("Transaction successful");
        } catch (error) {
            console.error("Error buying tokens:", error);
            alert("Error buying tokens: " + error.message);
        }
    };

    const claimTokens = async () => {
        if (!presaleContract) {
            console.error("Presale contract is not initialized");
            return;
        }

        try {
            // Call the claimTokens function on the contract
            const tx = await presaleContract.claimTokens();

            // Wait for the transaction to be mined
            await tx.wait();

            alert("Tokens claimed successfully");
        } catch (error) {
            console.error("Error claiming tokens:", error);

            // Provide more specific error messages based on the contract's requirements
            if (error.message.includes("Presale not ended")) {
                alert("The presale has not ended yet. Please wait until the presale period is over to claim your tokens.");
            } else if (error.message.includes("No tokens to claim")) {
                alert("You don't have any tokens to claim. Make sure you participated in the presale.");
            } else {
                alert("Error claiming tokens: " + error.message);
            }
        }
    };

    return (
        <div className='rounded-md h-fit w-[268px] flex flex-col bg-gray-800/70 border border-slate-50/10 drop-shadow-xl px-3 py-4 backdrop-blur-sm'>
            <div className='flex h-[82px] w-fit'>
                <div className='mr-2 z-20 flex'>
                    <Image src="/assets/logo.png" alt='Logo' width={82} height={82} className='border-2 border-violet-50/70 rounded-full' />
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
                <p className={`${connectedAddress ? "text-green-500 font-bold text-[6.8pt] select-all" : "text-red-500 font-bold text-[10.5pt]"}`}>
                    {connectedAddress ? String(connectedAddress.address) : "No wallet connected..."}
                </p>
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

            <div className='w-full grid grid-cols-3 mt-2 py-4 px-8 bg-slate-50/10 rounded'>
                <div className='flex justify-center items-center'>
                    <Image src="/assets/logo.png" alt='BRSK' width={48} height={48} className='flex border-2 border-slate-300 rounded-full' />
                </div>
                <div className='flex justify-center items-center'>
                    <FaExchangeAlt className='text-slate-50 text-3xl' />
                </div>
                <div className='flex justify-center items-center'>
                    <Image src="/assets/eth.png" alt='ETH' width={48} height={48} className='flex border-2 border-slate-300 rounded-full' />
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
                            readOnly
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={buyTokens}
                    className='w-full py-2 border-2 border-slate-50 rounded-lg mt-3 font-bold tracking-tighter text-3xl text-slate-50 bg-gray-900 hover:bg-opacity-50'
                >
                    BUY
                </button>

                {connectedAddress && (
                    <button
                        type="button"
                        onClick={claimTokens}
                        className='w-full py-2 border-2 border-slate-50 rounded-lg mt-3 font-bold tracking-tighter text-3xl text-slate-50 bg-gray-900 hover:bg-opacity-50'
                    >
                        CLAIM TOKENS
                    </button>
                )}
            </form>
        </div>
    );
};