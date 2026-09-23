import { Link, useMatch } from 'react-router'

type MenuLinkProps = {
  label: string
  to: string
  icon: React.ReactNode
  index?: number
}

export default function MenuLink({ label, to, icon, index = 0 }: MenuLinkProps) {
  const isActive = useMatch(to)
  return (
    <li className="animate-slide-in-left animate-fill-both" style={{ animationDelay: `${index * 100}ms` }}>
      <Link
        className={`flex gap-2 items-center transition duration-200 py-2 px-4 rounded-lg hover:scale-105 ${isActive ? 'bg-primary shadow-lg hover:bg-primary-600/50 hover:text-neutral-300' : 'hover:bg-secondary'}`}
        aria-label={label}
        to={to}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  )
}
