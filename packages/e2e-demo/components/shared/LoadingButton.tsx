import { FC } from "react"
import DotLoader from "react-spinners/DotLoader"

import { classNames } from "../../lib/react-fns"
import Spinner from "./Spinner"

type Props = {
  className?: string
  loading: boolean
  onClick?: (e?) => void | Promise<void>
  type?: "button" | "submit" | "reset"
  style?: string
}

/**
 * An un-styled loading button, which displays a spinner when `loading` is set to true.
 *
 * @example
 *  const [isLoading, setIsLoading] = useState(false)
 *  ...
 *  <LoadingButton loading={isLoading} onClick={() => setIsLoading(true)}>Tap me!</LoadingButton>
 *
 * @param props.className - Additional class names to apply to the button.
 * @param props.loading - Whether the button is loading.
 * @param props.onClick - The function to call when the button is clicked.
 * @param props.style - The loader style, either `spinner` or `dot-loader` (default: `spinner`)
 * @param props.type - The button type, either `button` or `submit` (default: `button`)
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
