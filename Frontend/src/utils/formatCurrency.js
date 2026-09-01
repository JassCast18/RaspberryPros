const currencyNumberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatCurrency(value) {
  const amount = Number(value)
  return `Q${currencyNumberFormatter.format(Number.isFinite(amount) ? amount : 0)}`
}

export default formatCurrency
