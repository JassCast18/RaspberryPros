function PageHeader({ eyebrow, title, description }) {
  return (
    <header className="page-header">
      <p className="page-header__eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-header__description">{description}</p>
    </header>
  )
}

export default PageHeader
