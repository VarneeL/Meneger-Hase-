import { useState, useEffect } from 'react'
import './index.css'

interface Haslo {
  id: string
  strona: string
  login: string
  haslo: string
  data: string
}

export default function App() {
  // Stan autoryzacji
  const [isLogged, setIsLogged] = useState(() => sessionStorage.getItem('logged') === 'true')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [authError, setAuthError] = useState('')

  // Stan haseł i formularza
  const [hasla, setHasla] = useState<Haslo[]>(() => JSON.parse(localStorage.getItem('hasla') || '[]'))
  const [strona, setStrona] = useState('')
  const [login, setLogin] = useState('')
  const [haslo, setHaslo] = useState('')
  const [szukaj, setSzukaj] = useState('')
  const [pokazHaslo, setPokazHaslo] = useState(false)
  const [odkryte, setOdkryte] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState('')

  // Zapis w localStorage
  useEffect(() => {
    localStorage.setItem('hasla', JSON.stringify(hasla))
  }, [hasla])

  // Logowanie
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (user === 'admin' && pass === 'admin123') {
      setIsLogged(true)
      sessionStorage.setItem('logged', 'true')
      setAuthError('')
    } else {
      setAuthError('Nieprawidłowy login lub hasło!')
    }
  }

  // Wylogowanie
  const handleLogout = () => {
    setIsLogged(false)
    sessionStorage.removeItem('logged')
  }

  // Dodawanie hasła
  const handleDodaj = (e: React.FormEvent) => {
    e.preventDefault()
    if (!strona.trim() || !login.trim() || !haslo.trim()) return

    const nowy: Haslo = {
      id: Date.now().toString(),
      strona: strona.trim(),
      login: login.trim(),
      haslo: haslo.trim(),
      data: new Date().toLocaleDateString('pl-PL')
    }

    setHasla([nowy, ...hasla])
    setStrona('')
    setLogin('')
    setHaslo('')
    setPokazHaslo(false)
  }

  // Usuwanie wpisu
  const handleUsun = (id: string) => {
    if (confirm('Usunąć to hasło?')) setHasla(hasla.filter(h => h.id !== id))
  }

  // Kopiowanie do schowka
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  // Generator losowego hasła
  const generuj = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    setHaslo(Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
    setPokazHaslo(true)
  }

  // Filtrowanie listy
  const lista = hasla.filter(h => (h.strona + h.login).toLowerCase().includes(szukaj.toLowerCase()))

  // 1. Ekran logowania
  if (!isLogged) {
    return (
      <div className="app-container login-container">
        <header className="app-header">
          <div className="header-brand">
            <div className="logo-badge">🔐</div>
            <div>
              <h1>Menedżer Haseł</h1>
              <p className="subtitle">Wprowadź dane, aby odblokować dostęp</p>
            </div>
          </div>
        </header>

        <section className="card">
          <h2 className="card-title">Zaloguj się</h2>
          {authError && <div className="error-banner">⚠️ {authError}</div>}
          <form onSubmit={handleLogin} className="form-grid">
            <div className="input-group">
              <label>Login</label>
              <input value={user} onChange={e => setUser(e.target.value)} placeholder="Wpisz login" required />
            </div>
            <div className="input-group">
              <label>Hasło</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Wpisz hasło" required />
            </div>
            <button type="submit" className="primary-btn">🔓 Zaloguj się</button>
          </form>
          <div className="login-hint">Domyślny login: <code>admin</code> | Hasło: <code>admin123</code></div>
        </section>
      </div>
    )
  }

  // 2. Główny ekran aplikacji
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-brand">
          <div className="logo-badge">🔐</div>
          <div>
            <h1>Menedżer Haseł</h1>
            <p className="subtitle">Bezpiecznie przechowuj dane logowania w przeglądarce</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">🚪 Wyloguj</button>
      </header>

      <div className="main-content">
        <section className="card">
          <h2 className="card-title">Dodaj nowe konto</h2>
          <form onSubmit={handleDodaj} className="form-grid">
            <div className="input-group">
              <label>Strona / Serwis</label>
              <input value={strona} onChange={e => setStrona(e.target.value)} placeholder="np. google.com" required />
            </div>
            <div className="input-group">
              <label>Login / E-mail</label>
              <input value={login} onChange={e => setLogin(e.target.value)} placeholder="np. jan@gmail.com" required />
            </div>
            <div className="input-group">
              <div className="label-with-action">
                <label>Hasło</label>
                <button type="button" className="text-btn" onClick={generuj}>⚡ Wygeneruj silne</button>
              </div>
              <div className="input-wrapper">
                <input
                  type={pokazHaslo ? 'text' : 'password'}
                  value={haslo}
                  onChange={e => setHaslo(e.target.value)}
                  placeholder="Wpisz lub wygeneruj hasło"
                  required
                />
                <button type="button" className="icon-btn-inline" onClick={() => setPokazHaslo(!pokazHaslo)}>
                  {pokazHaslo ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="primary-btn">💾 Zapisz hasło</button>
          </form>
        </section>

        <section className="card">
          <div className="list-header">
            <div className="list-title-wrap">
              <h2>Zapisane konta</h2>
              <span className="count-badge">{lista.length}</span>
            </div>
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Szukaj serwisu lub loginu..."
                value={szukaj}
                onChange={e => setSzukaj(e.target.value)}
              />
              {szukaj && <button className="clear-search-btn" onClick={() => setSzukaj('')}>✕</button>}
            </div>
          </div>

          {lista.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>Brak zapisanych haseł</h3>
              <p>{szukaj ? 'Brak wyników.' : 'Wypełnij formularz powyżej, aby dodać konto.'}</p>
            </div>
          ) : (
            <div className="items-list">
              {lista.map(item => (
                <div key={item.id} className="password-card">
                  <div className="card-top">
                    <div className="site-badge">
                      <span className="avatar-circle">{item.strona[0]?.toUpperCase() || '?'}</span>
                      <div>
                        <h3 className="site-title">{item.strona}</h3>
                        <span className="date-tag">Dodano: {item.data}</span>
                      </div>
                    </div>
                    <button onClick={() => handleUsun(item.id)} className="delete-btn">🗑️ Usuń</button>
                  </div>

                  <div className="entry-details">
                    <div className="detail-row">
                      <span className="detail-label">Login:</span>
                      <span className="detail-value">{item.login}</span>
                      <button
                        onClick={() => copy(item.login, `l_${item.id}`)}
                        className={`copy-btn ${copiedKey === `l_${item.id}` ? 'copied' : ''}`}
                      >
                        {copiedKey === `l_${item.id}` ? '✓ Skopiowano' : 'Kopiuj'}
                      </button>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Hasło:</span>
                      <span className="detail-value password-text">{odkryte[item.id] ? item.haslo : '••••••••••••'}</span>
                      <div className="btn-group">
                        <button onClick={() => setOdkryte(p => ({ ...p, [item.id]: !p[item.id] }))} className="toggle-visibility-btn">
                          {odkryte[item.id] ? 'Ukryj' : 'Pokaż'}
                        </button>
                        <button
                          onClick={() => copy(item.haslo, `p_${item.id}`)}
                          className={`copy-btn ${copiedKey === `p_${item.id}` ? 'copied' : ''}`}
                        >
                          {copiedKey === `p_${item.id}` ? '✓ Skopiowano' : 'Kopiuj'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
