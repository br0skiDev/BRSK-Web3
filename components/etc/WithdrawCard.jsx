"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ethers } from 'ethers';
import { presaleABI } from '@/lib/presaleABI';
import { Wallet, DollarSign } from 'lucide-react';

const PRESALE_ADDRESS = process.env(PRESALE_ADDRESS);

export const WithdrawCard = () => {
    const [connectedAddress, setConnectedAddress] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [presaleContract, setPresaleContract] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [ownerAddress, setOwnerAddress] = useState(null);

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

                const _ownerAddress = await _presaleContract.owner();
                setOwnerAddress(_ownerAddress);
                console.log("Owner : " + _ownerAddress);

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

    const fetchBalance = async () => {
        if (!presaleContract) {
            console.error("Presale contract is not initialized");
            return;
        }

        try {
            const balance = await provider.getBalance(PRESALE_ADDRESS);
            setBalance(ethers.formatEther(balance));
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    const withdrawFunds = async () => {
        if (!presaleContract) {
            console.error("Presale contract is not initialized");
            return;
        }

        try {
            setIsWithdrawing(true);
            const tx = await presaleContract.withdrawFunds();
            await tx.wait();
            alert("Funds withdrawn successfully");
            fetchBalance();
        } catch (error) {
            console.error("Error withdrawing funds:", error);
        } finally {
            setIsWithdrawing(false);
        }
    };

    useEffect(() => {
        if (presaleContract) {
            fetchBalance();
        }
    }, [presaleContract]);

    return (
        <div className='rounded-md h-fit w-[328px] flex flex-col bg-gray-800/70 border border-blue-200/20 drop-shadow-xl px-3 py-4 backdrop-blur-sm'>
            <div className='flex h-[82px] w-fit'>
                <div className='mr-2 z-20 flex'>
                    <Image src="/assets/logo.png" alt='Logo' width={82} height={82} className='border-2 border-slate-700/70 rounded-full' />
                </div>
                <div className='z-20 flex h-full flex-col justify-center'>
                    <h1 className='text-white text-3xl font-bold tracking-tight'>PRESALE</h1>
                    <h2 className='text-white text-md font-light tracking-wider'>BALANCE</h2>
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
                <p className='text-xl tracking-tighter text-slate-50 font-bold'>{balance !== null ? `${balance} ETH` : 'connect wallet first'}</p>
            </div>

            {connectedAddress && ownerAddress && connectedAddress.address.toLowerCase() === ownerAddress.toLowerCase() && (
                <button
                    type="button"
                    onClick={withdrawFunds}
                    className='flex items-center justify-center gap-1 w-full py-2 border-2 border-slate-950/80 rounded-sm mt-3 font-bold tracking-tighter text-3xl text-slate-50 bg-red-700 hover:bg-red-600 hover:border-slate-50 hover:text-slate-50'
                    disabled={isWithdrawing}
                >
                    <DollarSign size={22} />
                    WITHDRAW
                </button>
            )}

            {isWithdrawing && (
                <div className='absolute top-0 left-0 flex w-full h-full justify-center items-center z-50 bg-black/90 rounded-md backdrop-blur-xl flex-col'>
                    <Image src={"/assets/logo.png"} alt='LOGO' width={125} height={125} />
                    <h1 className='mt-4 text-slate-50/20 text-[9.4pt]'><span className='text-red-500 font-semibold text-[11pt]'>TRANSACTION IN PROGRESS</span><br />Please wait.</h1>
                </div>
            )}
        </div>
    );
};
