import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fdf2f8] flex flex-col font-sans text-gray-800">
      <div className="soft-bg" />

      {/* Header / Nav */}
      <header className="w-full bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Cute Logo Placeholder */}
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-300 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-pink-500">CareMatch</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-pink-500 transition-colors hidden sm:block">
              Accedi
            </Link>
            <Link href="/login" className="bg-pink-400 hover:bg-pink-500 text-white px-6 py-2.5 rounded-full font-bold shadow transition-all">
              Inizia Gratuitamente
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20 md:py-32 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-800 leading-tight mb-8">
          Risolviamo la carenza di personale<br className="hidden md:block" /> nell'assistenza con il <span className="text-pink-500">matching.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 font-medium">
          CareMatch è la piattaforma che connette chi offre assistenza con famiglie e istituzioni.
          Dalle ore a chiamata al lavoro fisso, realizziamo il matching perfetto.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login?role=worker"
            className="w-full sm:w-auto px-8 py-4 bg-pink-500 text-white text-lg font-bold rounded-full hover:bg-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Sei un Caregiver? Inizia qui
          </Link>
          <Link
            href="/login?role=family"
            className="w-full sm:w-auto px-8 py-4 bg-white text-pink-500 border-2 border-pink-200 hover:border-pink-300 text-lg font-bold rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Cerchi assistenza? Clicca qui
          </Link>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="w-full bg-white py-24 relative z-10 border-t border-b border-pink-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-pink-500 mb-4">Come funziona CareMatch</h2>
            <p className="text-gray-500 text-lg font-medium">Matching semplice in 3 passaggi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-pink-50 rounded-3xl p-8 text-center flex flex-col items-center shadow-sm border border-pink-100">
              <div className="w-16 h-16 bg-white text-pink-500 rounded-full flex items-center justify-center text-3xl font-black shadow mb-6">1</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Registrati</h3>
              <p className="text-gray-600 leading-relaxed font-medium text-sm">
                Inserisci le informazioni come caregiver o famiglia. Compila requisiti, orari e condizioni desiderate.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-blue-50 rounded-3xl p-8 text-center flex flex-col items-center shadow-sm border border-blue-100">
              <div className="w-16 h-16 bg-white text-blue-500 rounded-full flex items-center justify-center text-3xl font-black shadow mb-6">2</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Trova & Candidati</h3>
              <p className="text-gray-600 leading-relaxed font-medium text-sm">
                Cerca tra familiari o assistenti in zona. Ti interessa? Basta un clic per inviare la tua richiesta o proposta.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-green-50 rounded-3xl p-8 text-center flex flex-col items-center shadow-sm border border-green-100">
              <div className="w-16 h-16 bg-white text-green-500 rounded-full flex items-center justify-center text-3xl font-black shadow mb-6">3</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Matching Fatto!</h3>
              <p className="text-gray-600 leading-relaxed font-medium text-sm">
                Conversa in chat e accordatevi rapidamente sui dettagli. Dal lavoro a chiamata al supporto fisso continuo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="bg-white rounded-[2rem] p-10 border-4 border-pink-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <span className="text-9xl">🩺</span>
            </div>
            <h3 className="text-2xl font-black text-pink-500 mb-6">Per chi offre assistenza</h3>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="bg-pink-100 text-pink-500 p-1 rounded-full">✨</span>
                <span className="text-gray-700 font-medium">Lavora negli orari che preferisci (anche spot)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-pink-100 text-pink-500 p-1 rounded-full">✨</span>
                <span className="text-gray-700 font-medium">Incontri solo profili adatti alle tue certificazioni</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-pink-100 text-pink-500 p-1 rounded-full">✨</span>
                <span className="text-gray-700 font-medium">Nessuna pressione, decidi con chi vuoi collaborare</span>
              </li>
            </ul>
            <Link href="/login" className="inline-block text-pink-500 font-bold hover:text-pink-600 underline underline-offset-4">
              Registrati come Operatore ➔
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] p-10 border-4 border-blue-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <span className="text-9xl">🏡</span>
            </div>
            <h3 className="text-2xl font-black text-blue-500 mb-6">Per Famiglie e Istituzioni</h3>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-500 p-1 rounded-full">✨</span>
                <span className="text-gray-700 font-medium">Risolvi urgenze in poche ore con personale disponibile</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-500 p-1 rounded-full">✨</span>
                <span className="text-gray-700 font-medium">Affidati a recensioni e profili verificati con punteggi</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-500 p-1 rounded-full">✨</span>
                <span className="text-gray-700 font-medium">Da aiuto domiciliare fino alle richieste istituzionali</span>
              </li>
            </ul>
            <Link href="/login" className="inline-block text-blue-500 font-bold hover:text-blue-600 underline underline-offset-4">
              Registrati come Famiglia/Ente ➔
            </Link>
          </div>

        </div>
      </section>

      {/* Footer CTA & Footer */}
      <section className="w-full bg-pink-500 py-20 text-center px-6 mt-auto">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Cambiamo insieme il futuro della cura.</h2>
        <p className="text-pink-100 text-lg mb-10 font-medium">Registrazione gratuita. Crea subito il profilo e sperimenta la potenza del matching.</p>
        <Link href="/login" className="inline-block bg-white text-pink-500 px-10 py-4 rounded-full font-black text-lg shadow-lg hover:bg-gray-50 transition-colors transform hover:-translate-y-1">
          Inizia Gratuitamente
        </Link>
      </section>

      <footer className="w-full bg-gray-50 py-8 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
          <div className="flex gap-6">
            <Link href="#" className="hover:text-pink-500 transition-colors">Chi Siamo</Link>
            <Link href="#" className="hover:text-pink-500 transition-colors">Termini d'uso</Link>
            <Link href="#" className="hover:text-pink-500 transition-colors">Privacy Policy</Link>
          </div>
          <div>
            © 2026 CareMatch. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
