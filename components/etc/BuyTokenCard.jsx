"use client"
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { ethers } from 'ethers';
import { presaleABI } from '@/lib/presaleABI';

const TOKEN_ADDRESS = "0x529bBdF560b5b3F5467b47F1B86E9805e4bC1e60";
const PRESALE_ADDRESS = "0x1982262c44852d7CF18f7c3D32DdeeB356013d87";
const RATE = 100;

export const BuyTokenCard = () => {
    const [inputValue, setInputValue] = useState('');
    const [priceValue, setPriceValue] = useState('Choose BRSK amount');
    const [connectedAddress, setConnectedAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [presaleContract, setPresaleContract] = useState(null);
    const [transactionHash, setTransactionHash] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [purchaseInfo, setPurchaseInfo] = useState({ hash: '', amount: '' });

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    useEffect(() => {
        if (inputValue && RATE > 0) {
            const priceInETH = inputValue / RATE;
            setPriceValue(priceInETH.toString());
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

                const _presaleContract = new ethers.Contract(PRESALE_ADDRESS, presaleABI, _signer);
                setPresaleContract(_presaleContract);
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

            const tx = await presaleContract.buyTokens({ value: amountInWei });
            setTransactionHash(tx.hash);
            await tx.wait();
            setInputValue('');
            setPurchaseInfo({ hash: tx.hash, amount: amountInETH });
            setShowPopup(true);
        } catch (error) {
            console.error("Error buying tokens:", error);
        }
    };

    const claimTokens = async () => {
        if (!presaleContract) {
            console.error("Presale contract is not initialized");
            return;
        }

        try {
            const tx = await presaleContract.claimTokens();
            await tx.wait();
            alert("Tokens claimed successfully");
        } catch (error) {
            console.error("Error claiming tokens:", error);
            if (error.message.includes("Presale not ended")) {
                alert("The presale has not ended yet. Please wait until the presale period is over to claim your tokens.");
            } else if (error.message.includes("No tokens to claim")) {
                alert("You don't have any tokens to claim. Make sure you participated in the presale.");
            } else {
                alert("Error claiming tokens: " + error.message);
            }
        }
    };

    const closePopup = () => {
        setShowPopup(false);
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

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="p-4 rounded-lg shadow-lg bg-gray-800/90 border border-slate-50/10 drop-shadow-xl px-3 py-4 backdrop-blur-md">
                        <h2 className="text-xl font-bold mb-2 text-slate-50">Transaction Successful</h2>
                        <p className="mb-2 text-slate-50 select-none">You bought BRSK for {purchaseInfo.amount} ETH</p>
                        <p className="mb-2 text-slate-50 text-xs select-none">Thank you for your purchase!</p>
                        <p className="mb-2 text-slate-50/40 text-xs select-none">Transaction Hash: <span className='text-slate-50 font-bold select-all'>{purchaseInfo.hash}</span></p>

                        <button
                            onClick={closePopup}
                            className="mt-2 px-4 py-2 bg-slate-500 text-white rounded w-full hover:brightness-75"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
