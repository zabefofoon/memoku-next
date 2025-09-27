interface Props {
  name: string
  className?: string
}

export function Icon(props: Props) {
  return (
    <span className={props.className}>
      <svg
        width='1em'
        height='1em'
        aria-hidden='true'>
        <use href={`/icons/icons.svg#icon-${props.name}`} />
      </svg>
    </span>
  )
}
