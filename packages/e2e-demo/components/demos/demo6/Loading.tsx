import { FC } from "react"

import Spinner from "../../shared/Spinner"

const Loading: FC = () => {
  return (
    <div className="flex items-center justify-center pt-20">
      <Spinner className="w-12 h-12" />
    </div>
  )
}

export default Loading
