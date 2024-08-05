"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import { presaleABI } from '@/lib/presaleABI';
import { Wallet, DollarSign, Clock } from 'lucide-react';
import { LoadingDots } from './LoadingDots';

const PRESALE_ADDRESS = process.env.NEXT_PUBLIC_PRESALE_ADDRESS;

export const WithdrawCard = () => {
    const [connectedAddress, setConnectedAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [presaleContract, setPresaleContract] = useState(null);
    const [balance, setBalance] = useState(null);
    const [userBalance, setUserBalance] = useState(null);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [ownerAddress, setOwnerAddress] = useState(null);
    const [presaleEndTime, setPresaleEndTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);



    const fetchBalance = async () => {

        if (!provider || !PRESALE_ADDRESS) {
            console.error("Provider or Presale Address is not initialized");
            return;
        }

        try {
            const balance = await provider.getBalance(PRESALE_ADDRESS);
            console.log("Balance fetched:", ethers.formatEther(balance));
            setBalance(ethers.formatEther(balance));

            if (presaleContract && connectedAddress) {
                const userContribution = await presaleContract.contributions(connectedAddress.address);
                console.log("User contribution fetched:", ethers.formatEther(userContribution));
                setUserBalance(ethers.formatEther(userContribution));
            }
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    const withdrawFunds = async () => {
        console.log("Withdraw button clicked");
        console.log("presaleContract:", presaleContract);
        console.log("connectedAddress:", connectedAddress);
        console.log("ownerAddress:", ownerAddress);
        console.log("timeLeft:", timeLeft);

        if (!presaleContract) {
            console.error("Presale contract is not initialized");
            return;
        }

        if (!connectedAddress || !ownerAddress || connectedAddress.address.toLowerCase() !== ownerAddress.toLowerCase()) {
            console.error("Not authorized to withdraw");
            return;
        }

        if (timeLeft && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0)) {
            console.error("Presale has not ended yet");
            return;
        }

        try {
            setIsWithdrawing(true);
            console.log("Calling withdrawFunds on contract");
            const tx = await presaleContract.withdrawFunds();
            console.log("Transaction sent:", tx.hash);
            await tx.wait();
            console.log("Transaction confirmed");
            alert("Funds withdrawn successfully");
            fetchBalance();
        } catch (error) {
            console.error("Error withdrawing funds:", error);
            alert("Error withdrawing funds: " + error.message);
        } finally {
            setIsWithdrawing(false);
        }
    };

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

                        const _presaleContract = new ethers.Contract(PRESALE_ADDRESS, presaleABI, _signer);
                        setPresaleContract(_presaleContract);

                        const _ownerAddress = await _presaleContract.owner();
                        setOwnerAddress(_ownerAddress);

                        const _endTime = await _presaleContract.endTime();
                        setPresaleEndTime(new Date(Number(_endTime) * 1000));
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

    useEffect(() => {
        if (provider && PRESALE_ADDRESS) {
            console.log("Provider or PRESALE_ADDRESS updated, fetching balance...");
            fetchBalance();
            const intervalId = setInterval(fetchBalance, 30000); // Update balance every 30 seconds
            return () => clearInterval(intervalId);
        }
    }, [provider, PRESALE_ADDRESS]);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                await _provider.send("eth_requestAccounts", []);
                const _signer = await _provider.getSigner();

                console.log("Setting provider...");
                setProvider(_provider);

                setSigner(_signer);
                const accounts = await _provider.listAccounts();
                if (accounts.length > 0) {
                    setConnectedAddress(accounts[0]);
                } else {
                    setConnectedAddress(null);
                    throw new Error("No accounts found after connecting.");
                }

                if (!PRESALE_ADDRESS) {
                    throw new Error("PRESALE_ADDRESS is not set.");
                }

                const _presaleContract = new ethers.Contract(PRESALE_ADDRESS, presaleABI, _signer);
                setPresaleContract(_presaleContract);

                const _ownerAddress = await _presaleContract.owner();
                setOwnerAddress(_ownerAddress);

                const _endTime = await _presaleContract.endTime();
                setPresaleEndTime(new Date(Number(_endTime) * 1000));

                localStorage.setItem('walletDisconnected', 'false');

                console.log("Wallet connected, provider set. Waiting for state update before fetching balance...");
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
        setBalance(null);
        setOwnerAddress(null);
        setPresaleEndTime(null);
        setTimeLeft(null);
        localStorage.setItem('walletDisconnected', 'true');
    };

    return (
        <div className='rounded-md h-fit w-[328px] flex flex-col bg-gray-800/70 border border-blue-200/20 drop-shadow-xl px-3 py-4 backdrop-blur-sm'>
            <div className='flex h-[82px] w-fit'>
                <div className='mr-2 z-20 flex'>
                    <Image src="/assets/logo.png" alt='Logo' width={82} height={82} className='border-2 border-slate-700/70 rounded-full' />
                </div>
                <div className='z-20 flex h-full flex-col justify-center'>
                    <h1 className='text-white text-3xl font-bold tracking-tight'>PRESALE</h1>
                    <h2 className='text-white text-md font-light tracking-wider'>BALANCE💰</h2>
                </div>
            </div>

            <div className="flex justify-center w-full bg-gray-900 rounded-lg py-2">
                <h1 className='text-xs text-slate-50 font-semibold z-20 flex items-center'><DollarSign className='w-[12.8px] mr-1' /> <span className='underline-offset-[6px]'>Check the presale balance</span></h1>
            </div>

            <div className='w-full flex flex-col mt-1 py-2'>
                <h1 className='flex items-center gap-1 text-white font-extralight text-xs'><Wallet className='w-[12px]' /> Wallet connected: </h1>
                <p className={`${connectedAddress ? "text-green-500 font-bold text-[8.5pt] select-all" : "text-red-500 font-bold text-[10.5pt]"}`}>
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
            </div>

            <div className='mt-4 w-full bg-gray-50/10 flex justify-center py-3 rounded-sm flex-col items-center rounded-b-xl'>
                <p className='text-md text-slate-50 text-xs font-light'>
                    Presale Balance:
                </p>
                <p className='text-xl tracking-tighter text-slate-50 font-bold'>{balance !== null ? `${balance} ETH` : 'Connect wallet to see balance'}
                </p>
                {connectedAddress && (
                    <>
                        <p className='text-md text-slate-50 text-xs font-light mt-2'>
                            Your Contribution:
                        </p>
                        <p className='text-xl tracking-tighter text-slate-50 font-bold'>
                            {userBalance !== null ? `${userBalance / 250} ETH` : 'Loading...'}
                        </p>
                        <p className='text-md text-slate-50 text-xs font-light mt-2'>
                            Your BRSK Balance:
                        </p>
                        <p className='text-xl tracking-tighter text-slate-50 font-bold'>
                            {userBalance !== null ? `${userBalance} BRSK` : 'Loading...'}
                        </p>
                    </>
                )}
            </div>

            {timeLeft === null ? (
                <div className='w-full mt-3 flex justify-center items-center text-xs text-yellow-300'>
                    <Clock className="w-4 h-4 mr-1" /> Loading presale timer...
                </div>
            ) : timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 ? (
                <div className='w-full mt-3 flex justify-center items-center text-xs text-green-300'>
                    <Clock className="w-4 h-4 mr-1" /> Presale ends in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m.
                </div>
            ) : (
                <div className='w-full mt-3 flex justify-center items-center text-xs text-red-500'>
                    <Clock className="w-4 h-4 mr-1" /> Presale has ended.
                </div>
            )}

            {connectedAddress && ownerAddress && connectedAddress.address.toLowerCase() === ownerAddress.toLowerCase() && (
                <button
                    type="button"
                    onClick={withdrawFunds}
                    className={`flex items-center justify-center gap-1 w-full py-2 border-2 border-slate-950/80 rounded-sm mt-3 font-bold tracking-tighter text-3xl text-slate-50 ${
                        isWithdrawing || (timeLeft && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0))
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-red-700 hover:bg-red-600 hover:border-slate-50 hover:text-slate-50'
                    }`}
                    disabled={isWithdrawing || (timeLeft && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0))}
                >
                    <DollarSign size={22} />
                    WITHDRAW
                </button>
            )}

            {isWithdrawing && (
                <div className='absolute top-0 left-0 flex w-full h-full justify-center items-center z-50 bg-black/90 rounded-md backdrop-blur-xl flex-col'>
                <Image src={"/assets/logo.png"} alt='LOGO' width={125} height={125} />
                <h1 className='mt-4 text-slate-50/20 text-[9.4pt]'><span className='text-red-500 font-semibold text-[11pt]'>TRANSACTION IN PROGRESS</span><br/>Please wait.</h1>
                <LoadingDots />
            </div>
            )}
        </div>
    );
};
