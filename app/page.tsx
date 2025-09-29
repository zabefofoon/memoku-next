import { HomeRecents } from '../components/HomeRecents'

export default function Home() {
  return (
    <>
      <div className='mb-[24px]'>
        <h1 className='text-[20px] opacity-80'>Welcome Memoku!</h1>
        <p className='text-[16px] opacity-50'>Enjoy Memo and enforce your life!</p>
      </div>
      <div className='flex items-center flex-col lg:flex-row gap-[24px]'>
        <HomeRecents />
        <div className='w-full'></div>
      </div>
    </>
  )
}
