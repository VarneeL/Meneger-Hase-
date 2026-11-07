import { useState, useEffect, useMemo } from 'react'
import './index.css'

// Definicja typu danych pojedynczego wpisu z hasłem
interface HasloWpis {
  id: string       // Unikalny identyfikator wpisu (np. znacznik czasu)
  strona: string   // Adres strony lub nazwa serwisu (np. facebook.com)
  login: string    // Login, nazwa użytkownika lub adres e-mail
  haslo: string    // Hasło w postaci jawnej
  data: string     // Data dodania wpisu sformatowana po polsku
}

// Klucz, pod którym dane haseł są zapisywane w pamięci przeglądarki (localStorage)
const STORAGE_KEY = 'zapisane_hasla'

// Domyślne dane dostępowe do logowania w aplikacji
const DOMYSLNY_LOGIN = 'admin'
const DOMYSLNE_HASLO = 'admin123'

export default function App() {
  // Stan logowania: sprawdza, czy użytkownik jest już zalogowany w bieżącej sesji przeglądarki
  const [czyZalogowany, setCzyZalogowany] = useState<boolean>(() => {
    return sessionStorage.getItem('czyZalogowany') === 'true'
  })

  // Stany formularza logowania
  const [loginAuth, setLoginAuth] = useState('')
  const [hasloAuth, setHasloAuth] = useState('')
  const [bladLogowania, setBladLogowania] = useState('')

  // Stan przechowujący listę wszystkich haseł (wczytywana z localStorage)
  const [hasla, setHasla] = useState<HasloWpis[]>(() => {
    try {
      const zapisane = localStorage.getItem(STORAGE_KEY)
      if (zapisane) {
        const wczytane = JSON.parse(zapisane)
        return wczytane.filter((item: HasloWpis) => item.id !== '1' && item.id !== '2')
      }
    } catch (e) {
      console.error('Błąd podczas wczytywania danych z localStorage:', e)
    }
    return []
  })

  // Stany formularza dodawania nowego hasła
  const [strona, setStrona] = useState('')
  const [login, setLogin] = useState('')
  const [haslo, setHaslo] = useState('')

  // Stan określający, czy hasło w formularzu dodawania ma być widoczne
  const [pokazHasloForm, setPokazHasloForm] = useState(false)

  // Stan przechowujący tekst wpisany w wyszukiwarkę haseł
  const [szukaj, setSzukaj] = useState('')

  // Obiekt przechowujący widoczność poszczególnych haseł na liście (id -> boolean)
  const [odkryte, setOdkryte] = useState<Record<string, boolean>>({})

  // Identyfikator elementu, który został niedawno skopiowany (dla efektu "✓ Skopiowano")
  const [skopiowanoKlucz, setSkopiowanoKlucz] = useState<string | null>(null)

  // Zapisywanie haseł do localStorage przy każdej zmianie listy
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hasla))
  }, [hasla])

  // useMemo: filtrowanie listy haseł w czasie rzeczywistym
  const listaHasel = useMemo(() => {
    return hasla.filter((item) => {
      if (szukaj.trim() === '') return true
      const query = szukaj.toLowerCase()
      return (
        item.strona.toLowerCase().includes(query) ||
        item.login.toLowerCase().includes(query)
      )
    })
  }, [hasla, szukaj])

  // Funkcja obsługująca formularz logowania
  const handleLogowanie = (event: React.FormEvent) => {
    event.preventDefault()

    // Sprawdzenie poprawności wpisanego loginu i hasła
    if (loginAuth === DOMYSLNY_LOGIN && hasloAuth === DOMYSLNE_HASLO) {
      setCzyZalogowany(true)
      sessionStorage.setItem('czyZalogowany', 'true') // Zapamiętanie zalogowania na czas otwartej karty
      setBladLogowania('')
      setLoginAuth('')
      setHasloAuth('')
    } else {
      setBladLogowania('Nieprawidłowy login lub hasło!')
    }
  }

  // Funkcja wylogowująca użytkownika
  const handleWyloguj = () => {
    setCzyZalogowany(false)
    sessionStorage.removeItem('czyZalogowany')
  }

  // Funkcja obsługująca dodanie nowego hasła do bazy
  const handleDodaj = (event: React.FormEvent) => {
    event.preventDefault()

    // Walidacja wypełnienia pól
    if (!strona.trim() || !login.trim() || !haslo.trim()) {
      alert('Uzupełnij wszystkie pola!')
      return
    }

    const nowyWpis: HasloWpis = {
      id: Date.now().toString(),
      strona: strona.trim(),
      login: login.trim(),
      haslo: haslo.trim(),
      data: new Date().toLocaleDateString('pl-PL')
    }

    setHasla([nowyWpis, ...hasla])
    setStrona('')
    setLogin('')
    setHaslo('')
    setPokazHasloForm(false)
  }

  // Funkcja usuwająca hasło z potwierdzeniem
  const handleUsun = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć to hasło?')) {
      setHasla(hasla.filter((item) => item.id !== id))
    }
  }

  // Funkcja kopiująca login lub hasło do schowka
  const handleKopiuj = (tekst: string, klucz: string) => {
    navigator.clipboard.writeText(tekst)
    setSkopiowanoKlucz(klucz)
    setTimeout(() => {
      setSkopiowanoKlucz((prev) => (prev === klucz ? null : prev))
    }, 2000)
  }

  // Funkcja przełączająca widoczność hasła (kropki / tekst jawny)
  const handlePrzelaczWidocznosc = (id: string) => {
    setOdkryte((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Funkcja generująca losowe, bezpieczne hasło
  const handleGeneruj = () => {
    const znaki = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let wynik = ''
    for (let i = 0; i < 14; i++) {
      wynik += znaki.charAt(Math.floor(Math.random() * znaki.length))
    }
    setHaslo(wynik)
    setPokazHasloForm(true)
  }

  // -------------------------------------------------------------
  // EKRAN LOGOWANIA (jeśli użytkownik nie jest jeszcze zalogowany)
  // -------------------------------------------------------------
  if (!czyZalogowany) {
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

          {/* Komunikat o błędnych danych */}
          {bladLogowania && (
            <div className="error-banner">
              ⚠️ {bladLogowania}
            </div>
          )}

          <form onSubmit={handleLogowanie} className="form-grid">
            <div className="input-group">
              <label htmlFor="authLogin">Login</label>
              <input
                id="authLogin"
                type="text"
                placeholder="Wpisz login"
                value={loginAuth}
                onChange={(e) => setLoginAuth(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="authHaslo">Hasło</label>
              <input
                id="authHaslo"
                type="password"
                placeholder="Wpisz hasło"
                value={hasloAuth}
                onChange={(e) => setHasloAuth(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="primary-btn">
              🔓 Zaloguj się
            </button>
          </form>

          {/* Pomocnicza wskazówka z danymi domyślnymi */}
          <div className="login-hint">
            Domyślny login: <code>admin</code> | Hasło: <code>admin123</code>
          </div>
        </section>
      </div>
    )
  }

  // -------------------------------------------------------------
  // GŁÓWNY EKRAN APLIKACJI (widoczny po poprawnym zalogowaniu)
  // -------------------------------------------------------------
  return (
    <div className="app-container">
      {/* Nagłówek aplikacji z przyciskiem wylogowania */}
      <header className="app-header">
        <div className="header-brand">
          <div className="logo-badge">🔐</div>
          <div>
            <h1>Menedżer Haseł</h1>
            <p className="subtitle">Bezpiecznie przechowuj dane logowania w przeglądarce</p>
          </div>
        </div>

        {/* Przycisk wylogowania */}
        <button
          type="button"
          onClick={handleWyloguj}
          className="logout-btn"
          title="Zakończ sesję"
        >
          🚪 Wyloguj
        </button>
      </header>

      <div className="main-content">
        {/* Formularz dodawania nowego hasła */}
        <section className="card">
          <h2 className="card-title">Dodaj nowe konto</h2>

          <form onSubmit={handleDodaj} className="form-grid">
            <div className="input-group">
              <label htmlFor="strona">Strona / Serwis</label>
              <input
                id="strona"
                type="text"
                placeholder="np. google.com, facebook.com"
                value={strona}
                onChange={(e) => setStrona(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="login">Login / E-mail</label>
              <input
                id="login"
                type="text"
                placeholder="np. jan.kowalski@gmail.com"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="label-with-action">
                <label htmlFor="haslo">Hasło</label>
                <button
                  type="button"
                  className="text-btn"
                  onClick={handleGeneruj}
                >
                  ⚡ Wygeneruj silne
                </button>
              </div>

              <div className="input-wrapper">
                <input
                  id="haslo"
                  type={pokazHasloForm ? 'text' : 'password'}
                  placeholder="Wpisz lub wygeneruj hasło"
                  value={haslo}
                  onChange={(e) => setHaslo(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="icon-btn-inline"
                  onClick={() => setPokazHasloForm(!pokazHasloForm)}
                  title={pokazHasloForm ? 'Ukryj' : 'Pokaż'}
                >
                  {pokazHasloForm ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="primary-btn">
              💾 Zapisz hasło
            </button>
          </form>
        </section>

        {/* Lista zapisanych haseł */}
        <section className="card">
          <div className="list-header">
            <div className="list-title-wrap">
              <h2>Zapisane konta</h2>
              <span className="count-badge">{listaHasel.length}</span>
            </div>

            {/* Wyszukiwarka haseł */}
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Szukaj serwisu lub loginu..."
                value={szukaj}
                onChange={(e) => setSzukaj(e.target.value)}
              />
              {szukaj && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSzukaj('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {listaHasel.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>Brak zapisanych haseł</h3>
              <p>
                {szukaj
                  ? 'Nie znaleziono kont pasujących do wyszukiwania.'
                  : 'Wypełnij formularz powyżej, aby dodać pierwsze konto.'}
              </p>
            </div>
          ) : (
            <div className="items-list">
              {listaHasel.map((item) => {
                const czyOdkryte = !!odkryte[item.id]
                const skopiowanyLogin = skopiowanoKlucz === `login_${item.id}`
                const skopiowaneHaslo = skopiowanoKlucz === `haslo_${item.id}`
                const inicjal =
                  item.strona.replace(/^(https?:\/\/)?(www\.)?/, '').charAt(0).toUpperCase() || '?'

                return (
                  <div key={`haslo_${item.id}`} className="password-card">
                    <div className="card-top">
                      <div className="site-badge">
                        <span className="avatar-circle">{inicjal}</span>
                        <div>
                          <h3 className="site-title">{item.strona}</h3>
                          <span className="date-tag">Dodano: {item.data}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUsun(item.id)}
                        className="delete-btn"
                        title="Usuń wpis"
                      >
                        🗑️ Usuń
                      </button>
                    </div>

                    <div className="entry-details">
                      <div className="detail-row">
                        <span className="detail-label">Login:</span>
                        <span className="detail-value">{item.login}</span>
                        <button
                          type="button"
                          onClick={() => handleKopiuj(item.login, `login_${item.id}`)}
                          className={`copy-btn ${skopiowanyLogin ? 'copied' : ''}`}
                        >
                          {skopiowanyLogin ? '✓ Skopiowano' : 'Kopiuj'}
                        </button>
                      </div>

                      <div className="detail-row">
                        <span className="detail-label">Hasło:</span>
                        <span className="detail-value password-text">
                          {czyOdkryte ? item.haslo : '••••••••••••'}
                        </span>
                        <div className="btn-group">
                          <button
                            type="button"
                            onClick={() => handlePrzelaczWidocznosc(item.id)}
                            className="toggle-visibility-btn"
                          >
                            {czyOdkryte ? 'Ukryj' : 'Pokaż'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleKopiuj(item.haslo, `haslo_${item.id}`)}
                            className={`copy-btn ${skopiowaneHaslo ? 'copied' : ''}`}
                          >
                            {skopiowaneHaslo ? '✓ Skopiowano' : 'Kopiuj'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
