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

// Klucz, pod którym dane będą zapisywane w pamięci przeglądarki (localStorage)
const STORAGE_KEY = 'zapisane_hasla'

export default function App() {
  // Stan przechowujący listę wszystkich haseł.
  // Funkcja początkowa wczytuje zapisane dane z localStorage przy starcie aplikacji.
  const [hasla, setHasla] = useState<HasloWpis[]>(() => {
    try {
      const zapisane = localStorage.getItem(STORAGE_KEY)
      if (zapisane) {
        const wczytane = JSON.parse(zapisane)
        // Odrzucamy ewentualne stare wpisy demonstracyjne
        return wczytane.filter((item: HasloWpis) => item.id !== '1' && item.id !== '2')
      }
    } catch (e) {
      console.error('Błąd podczas wczytywania danych z localStorage:', e)
    }
    // Jeśli nic nie ma w localStorage, zaczynamy od pustej listy
    return []
  })

  // Stany przechowujące wartości wpisane w polach formularza
  const [strona, setStrona] = useState('')
  const [login, setLogin] = useState('')
  const [haslo, setHaslo] = useState('')

  // Stan określający, czy hasło w formularzu dodawania ma być widoczne (typ 'text' czy 'password')
  const [pokazHasloForm, setPokazHasloForm] = useState(false)

  // Stan przechowujący tekst wpisany w wyszukiwarkę
  const [szukaj, setSzukaj] = useState('')

  // Obiekt przechowujący widoczność poszczególnych haseł na liście (klucz: id wpisu, wartość: boolean)
  const [odkryte, setOdkryte] = useState<Record<string, boolean>>({})

  // Identyfikator elementu, który został niedawno skopiowany (używany do wyświetlenia "✓ Skopiowano")
  const [skopiowanoKlucz, setSkopiowanoKlucz] = useState<string | null>(null)

  // Hook useEffect: automatycznie zapisuje aktualną listę haseł do localStorage przy każdej jej modyfikacji
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hasla))
  }, [hasla])

  // useMemo: optymalizacja filtrowania – przelicza listę tylko, gdy zmieni się lista haseł lub tekst wyszukiwania
  const listaHasel = useMemo(() => {
    return hasla.filter((item) => {
      // Jeśli wyszukiwarka jest pusta, zwracamy wszystkie elementy
      if (szukaj.trim() === '') return true
      const query = szukaj.toLowerCase()
      // Sprawdzamy, czy nazwa strony lub login zawiera wpisaną frazę
      return (
        item.strona.toLowerCase().includes(query) ||
        item.login.toLowerCase().includes(query)
      )
    })
  }, [hasla, szukaj])

  // Funkcja obsługująca zatwierdzenie formularza (dodanie nowego konta)
  const handleDodaj = (event: React.FormEvent) => {
    event.preventDefault() // Zapobiega przeładowaniu strony po wysłaniu formularza

    // Walidacja: upewniamy się, że użytkownik uzupełnił wszystkie 3 pola
    if (!strona.trim() || !login.trim() || !haslo.trim()) {
      alert('Uzupełnij wszystkie pola!')
      return
    }

    // Tworzenie nowego obiektu wpisu
    const nowyWpis: HasloWpis = {
      id: Date.now().toString(), // Unikalny identyfikator na podstawie bieżącego czasu
      strona: strona.trim(),
      login: login.trim(),
      haslo: haslo.trim(),
      data: new Date().toLocaleDateString('pl-PL') // Dzisiejsza data w formacie DD.MM.RRRR
    }

    // Dodanie nowego hasła na początek tablicy
    setHasla([nowyWpis, ...hasla])

    // Wyczyszczenie pól formularza po pomyślnym dodaniu
    setStrona('')
    setLogin('')
    setHaslo('')
    setPokazHasloForm(false)
  }

  // Funkcja usuwająca wybrane hasło z listy
  const handleUsun = (id: string) => {
    // Prośba o potwierdzenie przez użytkownika, aby zapobiec przypadkowemu usunięciu
    if (confirm('Czy na pewno chcesz usunąć to hasło?')) {
      // Filtrujemy tablicę, pozostawiając tylko elementy o innym id niż usuwany
      setHasla(hasla.filter((item) => item.id !== id))
    }
  }

  // Funkcja kopiująca podany tekst (login lub hasło) do schowka systemowego
  const handleKopiuj = (tekst: string, klucz: string) => {
    navigator.clipboard.writeText(tekst) // Zapisanie tekstu do schowka
    setSkopiowanoKlucz(klucz)            // Ustawienie informacji o skopiowaniu danego pola

    // Po 2 sekundach przywracamy domyślny napis na przycisku
    setTimeout(() => {
      setSkopiowanoKlucz((prev) => (prev === klucz ? null : prev))
    }, 2000)
  }

  // Funkcja przełączająca widoczność hasła na liście (odsłoń / ukryj kropkami)
  const handlePrzelaczWidocznosc = (id: string) => {
    setOdkryte((prev) => ({
      ...prev,
      [id]: !prev[id] // Odwraca wartość logiczną (true -> false lub false -> true)
    }))
  }

  // Funkcja generująca bezpieczne, losowe 14-znakowe hasło
  const handleGeneruj = () => {
    const znaki = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let wynik = ''
    for (let i = 0; i < 14; i++) {
      wynik += znaki.charAt(Math.floor(Math.random() * znaki.length))
    }
    // Wstawienie wygenerowanego hasła do pola formularza i jego natychmiastowe pokazanie
    setHaslo(wynik)
    setPokazHasloForm(true)
  }

  return (
    <div className="app-container">
      {/* Sekcja nagłówka aplikacji */}
      <header className="app-header">
        <div className="logo-badge">🔐</div>
        <div>
          <h1>Menedżer Haseł</h1>
          <p className="subtitle">Bezpiecznie przechowuj dane logowania w przeglądarce</p>
        </div>
      </header>

      <div className="main-content">
        {/* Karta z formularzem dodawania nowego hasła */}
        <section className="card">
          <h2 className="card-title">Dodaj nowe konto</h2>

          <form onSubmit={handleDodaj} className="form-grid">
            {/* Pole: Strona / Serwis */}
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

            {/* Pole: Login / E-mail */}
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

            {/* Pole: Hasło wraz z przyciskiem generatora oraz przełącznikiem podglądu */}
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

            {/* Przycisk wysyłający formularz */}
            <button type="submit" className="primary-btn">
              💾 Zapisz hasło
            </button>
          </form>
        </section>

        {/* Karta z listą zapisanych kont */}
        <section className="card">
          <div className="list-header">
            {/* Tytuł listy z licznikiem kont */}
            <div className="list-title-wrap">
              <h2>Zapisane konta</h2>
              <span className="count-badge">{listaHasel.length}</span>
            </div>

            {/* Pole wyszukiwarki filtrujące wpisy w czasie rzeczywistym */}
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Szukaj serwisu lub loginu..."
                value={szukaj}
                onChange={(e) => setSzukaj(e.target.value)}
              />
              {/* Przycisk czyszczenia wyszukiwarki (widoczny tylko, gdy wpisano tekst) */}
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

          {/* Renderowanie warunkowe: gdy brak haseł wyświetlamy komunikat, w przeciwnym razie listę kart */}
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
              {/* Iteracja po przefiltrowanej liście haseł */}
              {listaHasel.map((item) => {
                const czyOdkryte = !!odkryte[item.id]
                const skopiowanyLogin = skopiowanoKlucz === `login_${item.id}`
                const skopiowaneHaslo = skopiowanoKlucz === `haslo_${item.id}`
                // Pobranie pierwszej litery nazwy domeny do avatara (np. 'G' dla 'google.com')
                const inicjal =
                  item.strona.replace(/^(https?:\/\/)?(www\.)?/, '').charAt(0).toUpperCase() || '?'

                return (
                  <div key={`haslo_${item.id}`} className="password-card">
                    {/* Górna część karty: logo/inicjał, nazwa serwisu, data oraz przycisk usuwania */}
                    <div className="card-top">
                      <div className="site-badge">
                        <span className="avatar-circle">{inicjal}</span>
                        <div>
                          <h3 className="site-title">{item.strona}</h3>
                          <span className="date-tag">Dodano: {item.data}</span>
                        </div>
                      </div>

                      {/* Przycisk usuwania wybranego hasła */}
                      <button
                        type="button"
                        onClick={() => handleUsun(item.id)}
                        className="delete-btn"
                        title="Usuń wpis"
                      >
                        🗑️ Usuń
                      </button>
                    </div>

                    {/* Szczegóły konta: login oraz hasło z przyciskami akcji */}
                    <div className="entry-details">
                      {/* Wiersz loginu */}
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

                      {/* Wiersz hasła (zamaskowane kropkami lub jawne) */}
                      <div className="detail-row">
                        <span className="detail-label">Hasło:</span>
                        <span className="detail-value password-text">
                          {czyOdkryte ? item.haslo : '••••••••••••'}
                        </span>
                        <div className="btn-group">
                          {/* Przycisk Pokaż / Ukryj hasło */}
                          <button
                            type="button"
                            onClick={() => handlePrzelaczWidocznosc(item.id)}
                            className="toggle-visibility-btn"
                          >
                            {czyOdkryte ? 'Ukryj' : 'Pokaż'}
                          </button>
                          {/* Przycisk Kopiuj hasło */}
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
