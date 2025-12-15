import UIModal from './UIModal'

interface Props {
  isShow: boolean
  done: () => void
  close: () => void
}

export function TodosDeleteModal({ isShow = false, done, close }: Props) {
  return (
    <UIModal
      header={() => <span>주의!</span>}
      open={isShow ?? false}
      close={() => close()}
      content={() => (
        <p className='text-[15px]'>
          삭제된 데이터는 복구할 수 없습니다.
          <br />
          진행하시겠습니까?
        </p>
      )}
      ok={() => (
        <button
          className='rounded-md bg-indigo-500 py-[12px]'
          onClick={() => done()}>
          <p className='text-white text-[15px] font-[700]'>삭제하기</p>
        </button>
      )}
      cancel={() => (
        <button
          className='rounded-md bg-gray-200 dark:bg-zinc-700 text-[15px] py-[12px]'
          onClick={() => close()}>
          <p className='text-[15px]'>취소하기</p>
        </button>
      )}
    />
  )
}
