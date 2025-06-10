export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  width = 36,
  height = 36,
  stroke = '#ADADAD',
  ...props
}) => {
  return (
    <svg fill='none' height={height} viewBox='0 0 16 16' width={width} xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M6.33325 11.3335L9.66659 8.00016L6.33325 4.66683'
        stroke={stroke}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.25'
      ></path>
    </svg>
  )
}

export default ArrowRightIcon
