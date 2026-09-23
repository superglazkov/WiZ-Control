type CardProps = {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  padding?: 'small' | 'medium' | 'large'
  shadow?: 'small' | 'medium' | 'large'
  rounded?: 'small' | 'medium' | 'large'
  className?: string
  hoverable?: boolean
}

export default function Card({
  children,
  variant = 'primary',
  padding = 'medium',
  shadow = 'medium',
  rounded = 'medium',
  className = '',
  hoverable = false
}: CardProps) {
  const baseStyles = 'transition-all duration-300'

  const variants = {
    primary: 'bg-primary',
    secondary: 'bg-secondary'
  }

  const paddings = {
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6'
  }

  const shadows = {
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg'
  }

  const roundeds = {
    small: 'rounded-sm',
    medium: 'rounded-md',
    large: 'rounded-lg'
  }

  const hoverEffect = hoverable
    ? 'transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg'
    : ''

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${shadows[shadow]}
        ${roundeds[rounded]}
        ${hoverEffect}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
