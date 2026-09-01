import { Link } from 'react-router-dom'

function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-card__brand" aria-hidden="true">
          RP
        </div>
        <p className="login-card__system">RaspberryPros</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p className="login-card__description">
          El acceso de usuarios se habilitará en un próximo sprint.
        </p>
        <Link className="primary-link" to="/">
          Ir al panel de demostración
        </Link>
        <span className="login-card__note">Acceso simulado · Sin autenticación</span>
      </section>
    </main>
  )
}

export default LoginPage
