"use client"
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { ethers } from 'ethers';
import { presaleABI } from '@/lib/presaleABI';
import { Coins, CornerDownLeft, CornerLeftDown, Wallet } from 'lucide-react';

const TOKEN_ADDRESS = "0x529bBdF560b5b3F5467b47F1B86E9805e4bC1e60";
const PRESALE_ADDRESS = "0x1982262c44852d7CF18f7c3D32DdeeB356013d87";
const RATE = 100;
const DEPLOYMENT_TIME = new Date("Aug 03, 2024 05:49:12 UTC");
const PRESALE_DURATION = 24 * 60 * 60 * 1000;

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
    const [isBuying, setIsBuying] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });

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
            setIsBuying(true);
            const amountInETH = priceValue;
            const amountInWei = ethers.parseEther(amountInETH);
            console.log("Amount in Wei:", amountInWei.toString());

            const brskAmount = inputValue;

            const tx = await presaleContract.buyTokens({ value: amountInWei });
            setTransactionHash(tx.hash);
            await tx.wait();
            setPurchaseInfo({ hash: tx.hash, amount: amountInETH, brskAmount: brskAmount });
            setInputValue('');
            setShowPopup(true);
        } catch (error) {
            console.error("Error buying tokens:", error);
        } finally {
            setIsBuying(false);
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

useEffect(() => {
    const updateTimer = () => {
        const time = calculateTimeLeft();
        setTimeLeft(time);
    };

    updateTimer(); // Initial call to set the timer right away
    const intervalId = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(intervalId);
}, []);



    const calculateTimeLeft = () => {
        const now = new Date();
        const endTime = new Date(DEPLOYMENT_TIME.getTime() + PRESALE_DURATION);
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            return { hours: 0, minutes: 0 };
        } else {
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            return { hours, minutes };
        }
    };


    return (
        <div className='rounded-md h-fit w-[328px] flex flex-col bg-gray-800/70 border border-blue-200/20 drop-shadow-xl px-3 py-4 backdrop-blur-sm'>
            <div className='flex h-[82px] w-fit'>
                <div className='mr-2 z-20 flex'>
                    <Image src="/assets/logo.png" alt='Logo' width={82} height={82} className='border-2 border-slate-700/70 rounded-full' />
                </div>
                <div className='z-20 flex h-full flex-col justify-center'>
                    <h1 className='text-white text-3xl font-bold tracking-tight'>BUY <span className='text-black font-black text-4xl tracking-tighter shadow-md'>BRSK!💨</span></h1>
                    <h2 className='text-white text-md font-light tracking-wider'>NOW! ✨</h2>
                </div>
            </div>

            <div className="flex justify-center w-full bg-gray-900 rounded-lg py-2">
                <h1 className='text-xs text-slate-50 font-semibold z-20 flex'><CornerLeftDown className='w-[20px]' /> <span className='underline-offset-[6px] underline'>Connect your wallet and buy!</span></h1>
            </div>

            <div className='w-full flex flex-col mt-1 py-2'>
                <h1 className='flex items-center gap-1 text-white font-extralight text-xs'><Wallet className='w-[12px]'/>Wallet connected: </h1>
                <p className={`${connectedAddress ? "text-green-500 font-bold text-[6.8pt] select-all" : "text-red-500 font-bold text-[10.5pt]"}`}>
                    {connectedAddress ? String(connectedAddress.address) : "No wallet connected..."}
                </p>
                {connectedAddress ? (
                    <div className='w-full flex justify-center items-center mt-1'>
                        <button onClick={disconnectWallet} className='px-2 py-[1px] rounded-sm bg-slate-50 w-fit border-2 border-slate-50 text-xs mt-1 hover:bg-slate-200'>Disconnect Wallet</button>
                    </div>
                ) : (
                    <div className='w-full flex justify-center items-center mt-1'>
                        <button onClick={connectWallet} className='px-2 py-[1px] rounded-sm bg-slate-50 w-fit border-2 border-slate-50 text-xs mt-1 hover:bg-slate-200'>Connect Wallet</button>
                    </div>
                )}
            </div>

            <div className='mt-2 w-full bg-gray-50/10 flex justify-center py-3 rounded-sm flex-col items-center rounded-t-lg'>
                <p className='text-md text-slate-50 text-xs font-light'>
                    Buy BRSK with SepoliaETH
                </p>
                <p className='text-xl tracking-tighter text-slate-50 font-bold'>100 BRSK = 1 ETH</p>
            </div>

            <div className='w-full grid grid-cols-3 mt-2 py-4 px-8 bg-slate-50/10 rounded'>
                <div className='flex justify-center items-center'>
                    <Image src="/assets/logo.png" alt='BRSK' width={60} height={60} className='flex border-2 border-gray-600 rounded-full' />
                </div>
                <div className='flex justify-center items-center'>
                    <FaExchangeAlt className='text-slate-50 text-5xl rounded-lg bg-slate-800/20 backdrop-blur-md p-3' />
                </div>
                <div className='flex justify-center items-center'>
                    <Image src="/assets/eth.png" alt='ETH' width={60} height={60} className='flex border-2 border-gray-600 rounded-full' />
                </div>
            </div>

            <form className='w-full h-fit flex flex-col mt-2'>
                <div className='grid grid-cols-1 gap-2'>
                    <div className='flex justify-between items-center'>
                        <h1 className='text-slate-50 font-semibold underline-offset-4'>BRSK</h1>
                        <input
                            id="brsk_input"
                            type="number"
                            value={inputValue}
                            onChange={handleInputChange}
                            className='rounded focus:ring-0 focus:outline-none text-xs w-[175px] p-2'
                        />
                    </div>

                    <div className='flex justify-between items-center'>
                        <h1 className='text-slate-50 font-semibold underline-offset-4'>ETH</h1>
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
                    className='flex items-center justify-center gap-1 w-full py-2 border-2 border-slate-950/80 rounded-sm mt-3 font-bold tracking-tighter text-3xl text-slate-50 bg-red-700 hover:bg-red-600 hover:border-slate-50 hover:text-slate-50'
                >
                    <Coins size={40}/>
                    BUY TOKEN
                </button>

                {connectedAddress && (
                    <button
                        type="button"
                        onClick={claimTokens}
                        className='w-fit self-center px-4 py-2 border-2 border-green-500 rounded-lg mt-3 font-thin tracking-tighter text-md text-slate-50 bg-gray-900 hover:border-blue-200'
                    >
                        CLAIM TOKEN
                    </button>
                )}
            </form>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="p-4 rounded-lg shadow-lg bg-gray-800/90 border border-slate-50/10 drop-shadow-xl px-3 py-4 backdrop-blur-md">
                        <h2 className="text-xl font-bold mb-2 text-slate-50 select-none">Transaction Successful ✨</h2>
                        <p className="mb-2 select-none text-green-500">You bought <span className='font-bold'>{purchaseInfo.brskAmount} BRSK</span> for <span className='font-bold'>{purchaseInfo.amount} ETH</span></p>
                        <p className="mb-2 text-slate-50 text-xs select-none">Thank you for your purchase! ❤️</p>
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

            {isBuying && (
                <div className='absolute top-0 left-0 flex w-full h-full justify-center items-center z-50 bg-black/90 rounded-md backdrop-blur-xl flex-col'>
                    <Image src={"/assets/logo.png"} alt='LOGO' width={125} height={125} />
                    <h1 className='mt-4 text-slate-50/20 text-[9.4pt]'><span className='text-red-500 font-semibold text-[11pt]'>TRANSACTION IN PROGRESS</span><br/>Please wait.</h1>
                    <p></p>
                </div>
            )}

            <div className='w-full mt-3 flex justify-center items-center text-xs text-green-300'>Presale ends in {timeLeft.hours}h {timeLeft.minutes}m.</div>
        </div>
    );
};
