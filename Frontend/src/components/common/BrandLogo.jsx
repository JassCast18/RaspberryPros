import logoUrl from '../../assets/branding/raspberrypros-logo.svg'

function BrandLogo({ className }) {
  return (
    <img
      className={className}
      src={logoUrl}
      alt=""
      aria-hidden="true"
      draggable="false"
    />
  )
}

export default BrandLogo
