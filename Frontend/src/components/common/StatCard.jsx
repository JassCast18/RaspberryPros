function StatCard({ label, value, detail, symbol }) {
  return (
    <article className="stat-card">
      <div className="stat-card__top">
        <p>{label}</p>
        <span className="stat-card__symbol" aria-hidden="true">
          {symbol}
        </span>
      </div>
      <strong className="stat-card__value">{value}</strong>
      <span className="stat-card__detail">{detail}</span>
    </article>
  )
}

export default StatCard
