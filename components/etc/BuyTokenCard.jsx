"use client"
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { ethers } from 'ethers';
import { presaleABI } from '@/lib/presaleABI';
import { ArrowUp, Coins, CornerDownLeft, CornerLeftDown, Wallet } from 'lucide-react';
import { LoadingDots } from './LoadingDots';

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const PRESALE_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;
const RATE = 250;
const minimumBRSK = 1;

export const BuyTokenCard = () => {
    const [presaleStartTime, setPresaleStartTime] = useState(null);
    const [presaleEndTime, setPresaleEndTime] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [emptyInputErr, setEmptyInputErr] = useState(false);
    const [amountErr, setAmountErr] = useState(false);
    const [walletNotConnectedErr, setWalletNotConnectedErr] = useState(false)
    const [priceValue, setPriceValue] = useState('---');
    const [connectedAddress, setConnectedAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [presaleContract, setPresaleContract] = useState(null);
    const [transactionHash, setTransactionHash] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [purchaseInfo, setPurchaseInfo] = useState({ hash: '', amount: '' });
    const [isBuying, setIsBuying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const checkWalletConnection = async () => {
            const walletDisconnected = localStorage.getItem('walletDisconnected');
            if (typeof window.ethereum !== 'undefined' && walletDisconnected !== 'true') {
                try {
                    const _provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await _provider.listAccounts();
                    if (accounts.length > 0) {
                        const _signer = await _provider.getSigner();
                        setProvider(_provider);
                        setSigner(_signer);
                        setConnectedAddress(accounts[0]);
                        setWalletNotConnectedErr(false);

                        const _presaleContract = new ethers.Contract(PRESALE_ADDRESS, presaleABI, _signer);
                        setPresaleContract(_presaleContract);
                    } else {
                        setConnectedAddress(null);
                    }
                } catch (error) {
                    console.error("Error checking wallet connection:", error);
                }
            } else {
                setConnectedAddress(null);
                setProvider(null);
                setSigner(null);
                setPresaleContract(null);
            }
        };

        checkWalletConnection();
    }, []);

    useEffect(() => {
        const initializePresale = async () => {
            if (presaleContract) {
                try {
                    const startTime = await presaleContract.startTime();
                    const endTime = await presaleContract.endTime();
                    const startTimeDate = new Date(Number(startTime) * 1000);
                    const endTimeDate = new Date(Number(endTime) * 1000);
                    setPresaleStartTime(startTimeDate);
                    setPresaleEndTime(endTimeDate);

                    const time = calculateTimeLeft(endTimeDate);
                    setTimeLeft(time);
                } catch (error) {
                    console.error("Error fetching presale times:", error);
                }
            }
        };

        initializePresale();
    }, [presaleContract]);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    useEffect(() => {
        if (inputValue && RATE > 0) {
            const priceInETH = inputValue / RATE;
            setPriceValue(priceInETH.toString());
        } else {
            setPriceValue('---');
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

                setWalletNotConnectedErr(false);
                localStorage.setItem('walletDisconnected', 'false');

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
        localStorage.setItem('walletDisconnected', 'true');
    };

    const buyTokens = async () => {
        if (!presaleContract) {
            console.error("Presale contract is not initialized");
            setWalletNotConnectedErr(true);
            setInputValue("")
            return;
        }

        setAmountErr(false);
        setEmptyInputErr(false);

        if (!inputValue) {
            console.error("Input value is not set");
            setEmptyInputErr(true);
            return;
        } else if (inputValue < minimumBRSK) {
            console.error(`You have to buy at least ${minimumBRSK} BRSK`);
            setAmountErr(true);
            return;
        } else {
            setInputValue('');
        }

        try {
            setIsBuying(true);
            const amountInETH = priceValue;
            const amountInWei = ethers.parseEther(amountInETH);
            const brskAmount = inputValue;

            const tx = await presaleContract.buyTokens({ value: amountInWei});
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
            setIsBuying(true);
            const tx = await presaleContract.claimTokens();
            await tx.wait();
            setIsBuying(false);
            alert("Tokens claimed successfully");
        } catch (error) {
            console.log("Error claiming tokens:", error);
            if (error.message.includes("Presale not ended")) {
                alert("The presale has not ended yet. Please wait until the presale period is over to claim your tokens.");
            } else if (error.message.includes("No tokens to claim")) {
                alert("You don't have any tokens to claim. Make sure you participated in the presale.");
            } else {
                console.log("Error: \n" + error.message);
            }
        } finally {
            setIsBuying(false);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    useEffect(() => {
        const updateTimer = () => {
            if (presaleEndTime) {
                const time = calculateTimeLeft(presaleEndTime);
                setTimeLeft(time);
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 60000);

        return () => clearInterval(intervalId);
    }, [presaleEndTime]);

    const calculateTimeLeft = (endTime) => {
        if (!endTime) return null;

        const now = new Date();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            return { days: 0, hours: 0, minutes: 0 };
        } else {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            return { days, hours, minutes };
        }
    };

    return (
        <div className='rounded-md h-fit w-[328px] flex flex-col bg-gray-800/70 border border-blue-200/20 drop-shadow-xl px-3 py-4 backdrop-blur-sm z-40'>
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
                    <div className='w-full flex justify-start items-center mt-1'>
                        <button onClick={disconnectWallet} className='px-2 py-[1px] rounded-sm bg-slate-50 w-fit border-2 border-slate-50 text-xs mt-1 hover:bg-slate-200'>Disconnect Wallet</button>
                    </div>
                ) : (
                    <div className='w-full flex justify-start items-center mt-1'>
                        <button onClick={connectWallet} className='px-2 py-[1px] rounded-sm bg-slate-50 w-fit border-2 border-slate-50 text-xs mt-1 hover:bg-slate-200'>Connect Wallet</button>
                    </div>
                )}
                {walletNotConnectedErr && (
                    <h1 className='text-xs flex items-center text-red-500'> <ArrowUp className='w-[10px]'/>Connect your wallet here!</h1>
                )}
            </div>

            <div className='mt-2 w-full bg-gray-50/10 flex justify-center py-3 rounded-sm flex-col items-center rounded-t-lg'>
                <p className='text-md text-slate-50 text-xs font-light'>
                    Buy BRSK with ETH
                </p>
                <p className='text-xl tracking-tighter text-slate-50 font-bold'>250 BRSK = 1 ETH</p>
            </div>

            <div className='w-full grid grid-cols-3 mt-2 py-4 px-8 bg-slate-50/10 rounded'>
                <div className='flex justify-center items-center'>
                    <Image src="/assets/logo.png" alt='BRSK' width={60} height={60} className='flex border-2 border-gray-600 rounded-full' />
                </div>
                <div className='flex justify-center items-center'>
                    <FaExchangeAlt className='text-slate-50 text-5xl rounded-full bg-slate-600/10 backdrop-blur-md p-3' />
                </div>
                <div className='flex justify-center items-center'>
                    <Image src="/assets/eth.png" alt='ETH' width={60} height={60} className='flex border-2 border-gray-600 rounded-full' />
                </div>
            </div>

            <form className='w-full h-fit flex flex-col mt-2'>
                <div className='grid grid-cols-1 gap-2'>
                    <h1 className='text-emerald-200 font-light text-sm'>You have to buy at least {minimumBRSK} BRSK</h1>
                    <div className='flex justify-between items-center'>
                        <h1 className='text-slate-50 font-semibold underline-offset-4'>BRSK</h1>
                        <input
                            id="brsk_input"
                            type="number"
                            value={inputValue}
                            onChange={handleInputChange}
                            className='rounded-none focus:ring-0 focus:outline-none text-xs w-[240px] p-2'
                        />
                    </div>

                    <div className='flex justify-between items-center'>
                        <h1 className='text-slate-50 font-semibold underline-offset-4'>ETH</h1>
                        <input
                            id="price_input"
                            type="text"
                            value={priceValue}
                            className='rounded-none focus:ring-0 focus:outline-none text-xs w-[240px] p-2'
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

                {amountErr && (
                    <div className='flex w-full items-center pt-1 justify-center'>
                        <p className='text-slate-50 font-light text-sm'>At least <span className='font-bold'>{minimumBRSK} BRSK</span>!</p>
                    </div>
                )}

                {emptyInputErr && (
                    <div className='flex w-full items-center pt-1 justify-center'>
                        <p className='text-slate-50 font-light text-[10.85px]'>You have to choose the amount of BRSK you want to buy!</p>
                    </div>
                )}

                {walletNotConnectedErr && (
                    <div className='flex w-full items-center pt-1 justify-center'>
                        <p className='text-slate-50 font-light text-[10.85px]'>No wallet connected...</p>
                    </div>
                )}

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
                <div className="fixed inset-0 flex items-center justify-center z-40">
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
                    <LoadingDots />
                </div>
            )}

        {timeLeft === null ? (
            <div className='w-full mt-3 flex justify-center items-center text-xs text-yellow-300'>
                Loading presale timer...
            </div>
        ) : timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 ? (
            <div className='w-full mt-3 flex justify-center items-center text-xs text-green-300'>
                ⏰ Presale ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m.
            </div>
        ) : (
            <div className='w-full mt-3 flex justify-center items-center text-xs text-green-300 flex-col'>
                <h1 className='text-red-500 font-light'>❌ Presale has ended. You can't buy anymore.</h1>
                <span className='flex items-center gap-1 text-[10px]'>But you can claim your <Image src={"/assets/logo.png"} alt='' width={25} height={25} /> BRSK Token now!</span>
            </div>
        )}
        </div>
    );
};
