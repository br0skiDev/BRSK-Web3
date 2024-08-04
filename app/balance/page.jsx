import { WithdrawCard } from '@/components/etc/WithdrawCard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className='w-full h-full flex justify-center items-center'>
        <div className='absolute bottom-[30px] left-[45px]'>
            <Link href={"/"}>
                <div className='py-[5px] px-[12px] rounded-full border-[0px] shadow-xl text-slate-50 hover:border-slate-200/50 hover:border-2 flex gap-2'>
                    <ArrowLeft className='w-[15px]' /> Go Back
                </div>
            </Link>
        </div>
        <WithdrawCard />
    </div>
  )
}

export default page
