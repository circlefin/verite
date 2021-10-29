import { FC } from "react"
import DotLoader from "react-spinners/DotLoader"
import { classNames } from "../lib/react-fns"
import Spinner from "./Spinner"

type Props = {
  className?: string
  loading: boolean
  onClick?: () => void | Promise<void>
  type?: "button" | "submit" | "reset"
  style?: string
}

/**
 * An un-styled loading button
 */
export const LoadingButton: FC<Props> = ({
  children,
  className,
  loading,
  onClick,
  style,
  type
}) => {
  return (
    <>
      <button
        onClick={onClick}
        type={type || "button"}
        disabled={loading}
        className={classNames(
          loading ? "opacity-50 cursor-not-allowed" : "",
          className
        )}
      >
        {style === "dot-loader" ? (
          <>
            {loading && (
              <DotLoader
                color="#FFF"
                size={20}
                css={`
                  margin-left: -0.25rem;
                  margin-right: 0.5rem;
                `}
              />
            )}
          </>
        ) : (
          <Spinner
            className={classNames(
              loading ? "inline" : "hidden",
              "w-5 h-5 mr-2 -ml-1"
            )}
          />
        )}

        {children}
      </button>
    </>
  )
}
