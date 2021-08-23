import { PlusIcon } from "@heroicons/react/outline"
import { FC } from "react"
import DotLoader from "react-spinners/DotLoader"

type Props = {
  loading: boolean
  onClick: () => Promise<void>
  text: string
}

export const LoadingButton: FC<Props> = ({ loading, onClick, text }) => {
  return (
    <>
      <button
        onClick={onClick}
        type="button"
        disabled={loading}
        className={`${
          loading ? "opacity-50" : ""
        } inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        {loading ? (
          <DotLoader
            color="#FFF"
            size={20}
            css={`
              margin-left: -0.25rem;
              margin-right: 0.5rem;
            `}
          />
        ) : (
          <PlusIcon className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
        )}
        {text}
      </button>
    </>
  )
}
