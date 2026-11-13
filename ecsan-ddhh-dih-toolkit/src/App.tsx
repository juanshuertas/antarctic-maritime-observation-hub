import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUp, BookOpen, Check, ChevronRight, Clock3, Download, FileText, Gavel, GraduationCap, Keyboard, Pause, Play, RotateCcw, Scale, ShieldCheck, Sparkles, Target, Users, X } from 'lucide-react'

type Act = { id: string; title: string; time: string; eyebrow: string }
type Quiz = { question: string; options: string[]; answer: number; explanation: string }

const acts: Act[] = [
  { id: 'acto-i', title: 'La zona gris', time: '00:00–01:30', eyebrow: 'I · Apertura' },
  { id: 'acto-ii', title: 'Dos paradigmas', time: '01:30–03:00', eyebrow: 'II · Diagnóstico' },
  { id: 'acto-iii', title: 'El umbral CANI', time: '03:00–04:30', eyebrow: 'III · Núcleo' },
  { id: 'acto-iv', title: 'La decisión', time: '04:30–05:30', eyebrow: 'IV · Método' },
  { id: 'acto-v', title: 'Río Verde', time: '05:30–07:00', eyebrow: 'V · Caso' },
  { id: 'acto-vi', title: 'Comparado', time: '07:00–08:00', eyebrow: 'VI · Transferencia' },
  { id: 'acto-vii', title: 'Simulación', time: '08:00–09:00', eyebrow: 'VII · Kahoot' },
  { id: 'acto-viii', title: 'Competencia', time: '09:00–09:30', eyebrow: 'VIII · Evaluación' },
  { id: 'acto-ix', title: 'Caja de herramientas', time: '09:30–09:50', eyebrow: 'IX · Recursos' },
  { id: 'acto-x', title: 'Legitimidad', time: '09:50–10:00', eyebrow: 'X · Cierre' },
]

const quizzes: Quiz[] = [
  { question: 'En delincuencia común armada, sin mando ni control territorial de conflicto, ¿qué marco regula el uso letal?', options: ['DIH por el calibre de las armas', 'DIDH como regla general', 'Ambos por igual según el comandante', 'Ninguno'], answer: 1, explanation: 'La intensidad del armamento no crea por sí sola un CANI. La actuación policial ordinaria permanece bajo DIDH.' },
  { question: 'Además del umbral de daño y la causalidad directa, ¿qué exige Melzer para la PDH?', options: ['Uniforme distintivo', 'Antecedentes penales', 'Nexo beligerante', 'Estar en zona rural'], answer: 2, explanation: 'Los tres requisitos son acumulativos: umbral de daño, causalidad directa y nexo beligerante.' },
  { question: '¿Qué aporta C-291 de 2007 a la formación del mando?', options: ['Convierte el DIH en recomendación', 'Integra estándares consuetudinarios al bloque de constitucionalidad', 'Limita el DIH a CAI', 'Subordina el DIH a reglamentos'], answer: 1, explanation: 'La sentencia reconoce la relevancia constitucional de normas consuetudinarias del DIH, incluida la protección de bienes civiles.' },
]

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url)
}

export default function App() {
  const [activeAct, setActiveAct] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [notes, setNotes] = useState(false)
  const [hypothesis, setHypothesis] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(3)
  const [organization, setOrganization] = useState(3)
  const [quizIndex, setQuizIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [rubric, setRubric] = useState([4, 3.5, 3, 3.5])

  useEffect(() => {
    if (!running || seconds >= 600) return
    const timer = window.setInterval(() => setSeconds((value) => Math.min(value + 1, 600)), 1000)
    return () => window.clearInterval(timer)
  }, [running, seconds])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'n' || event.key === 'N') setNotes((value) => !value)
      if (event.key === 't' || event.key === 'T') setRunning((value) => !value)
      if (event.key === 'ArrowDown' || event.key === 'PageDown') setActiveAct((value) => Math.min(value + 1, acts.length - 1))
      if (event.key === 'ArrowUp' || event.key === 'PageUp') setActiveAct((value) => Math.max(value - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const formattedTime = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const cani = intensity >= 4 && organization >= 4
  const weighted = useMemo(() => rubric.reduce((total, value, index) => total + value * [0.3, 0.3, 0.25, 0.15][index], 0), [rubric])
  const quiz = quizzes[quizIndex]

  const goTo = (index: number) => {
    setActiveAct(index)
    document.getElementById(acts[index].id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const answerQuiz = (index: number) => {
    if (selected !== null) return
    setSelected(index)
    if (index === quiz.answer) setScore((value) => value + 1)
  }

  return (
    <div className="app-shell">
      <header className="hud">
        <div className="brand-lockup"><span className="brand-mark">E</span><div><strong>ECSAN · DIEPO</strong><small>Universidad Policial · Microclase</small></div></div>
        <div className="hud-center"><span className="live-dot" /> 10:00 <span className="hud-phase">{acts[activeAct].eyebrow}</span></div>
        <div className="hud-actions"><span className="timer"><Clock3 size={15} /> {formattedTime}</span><button aria-label="Iniciar o pausar" className="icon-button" onClick={() => setRunning((value) => !value)}>{running ? <Pause size={16} /> : <Play size={16} />}</button><button aria-label="Reiniciar" className="icon-button" onClick={() => { setSeconds(0); setRunning(false) }}><RotateCcw size={16} /></button><button className="notes-toggle" onClick={() => setNotes((value) => !value)}><BookOpen size={15} /> {notes ? 'Cerrar notas' : 'Notas N'}</button></div>
      </header>

      <aside className="depth-nav" aria-label="Navegación de actos">{acts.map((act, index) => <button key={act.id} className={index === activeAct ? 'depth-item active' : 'depth-item'} onClick={() => goTo(index)}><span className="depth-dot" /><span><b>{String(index + 1).padStart(2, '0')}</b>{act.title}<small>{act.time}</small></span></button>)}</aside>

      <main>
        <section id="acto-i" className="hero act-section" onMouseEnter={() => setActiveAct(0)}>
          <div className="hero-grid"><div className="hero-kicker">ECSAN · DIRECCIÓN DE EDUCACIÓN POLICIAL · 2026</div><h1>Cuando la paz se vuelve ambigua, el mando debe ser preciso.</h1><p className="hero-lede">Convergencia entre DIDH y DIH en escenarios de zona gris. Una microclase para decidir con humanidad, legalidad y método.</p><div className="hero-actions"><a className="primary-button" href="#acto-ii">Entrar al laboratorio <ChevronRight size={17} /></a><span className="key-hint"><Keyboard size={15} /> T iniciar · N notas · ↑↓ actos</span></div></div><div className="hero-diagram" aria-hidden="true"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="core"><Scale size={34} /><span>DIDH<br /><em>+</em><br />DIH</span></div><div className="orbit-label label-a">vida</div><div className="orbit-label label-b">distinción</div><div className="orbit-label label-c">legitimidad</div></div></section>

        <section id="acto-ii" className="act-section" onMouseEnter={() => setActiveAct(1)}><SectionHeader number="02" title="Dos marcos. Una obligación: proteger." kicker="Diagnóstico jurídico"/><div className="question-panel"><div><span className="label">Pregunta detonante</span><h2>¿DIDH o DIH cuando la ciudad mezcla protesta, extorsión y fusiles?</h2><p>Vota tu hipótesis inicial. No es un examen: es el punto de partida que volveremos a mirar al final.</p></div><div className="hypothesis-grid">{['DIDH', 'DIH', 'Convergencia'].map((value) => <button key={value} className={hypothesis === value ? 'hypothesis selected' : 'hypothesis'} onClick={() => setHypothesis(value)}><span>{value === 'DIDH' ? 'A' : value === 'DIH' ? 'B' : 'C'}</span>{value}</button>)}</div></div><div className="compare-grid"><Paradigm title="DIDH" accent="cyan" icon={<Users size={20} />} text="Regla general de la función policial: prevenir, proteger, dialogar y usar la fuerza como extrema ratio." items={['Vida e integridad como centro', 'Necesidad y proporcionalidad', 'Uso letal ante amenaza inminente']} /><Paradigm title="DIH" accent="red" icon={<Target size={20} />} text="Régimen excepcional en conflicto armado: limita medios y métodos, protege civiles y exige distinción." items={['Distinción y precaución', 'Proporcionalidad ex ante', 'Artículo 3 Común y Protocolo II']} /></div></section>

        <section id="acto-iii" className="act-section dark-section" onMouseEnter={() => setActiveAct(2)}><SectionHeader number="03" title="El umbral no se presume: se demuestra." kicker="Test de intensidad y organización"/><div className="threshold-layout"><div className="threshold-controls"><Slider label="Intensidad de hostilidades" value={intensity} setValue={setIntensity} hints="duración · gravedad · armamento · bajas"/><Slider label="Organización del grupo" value={organization} setValue={setOrganization} hints="mando · logística · operaciones sostenidas"/><div className={cani ? 'verdict reached' : 'verdict'}><span className="verdict-signal" />{cani ? <><strong>Umbral CANI alcanzado</strong><small>Concurrencia armónica DIH + DIDH</small></> : <><strong>Disturbio o criminalidad ordinaria</strong><small>Rige exclusivamente DIDH mientras no concurran ambos criterios</small></>}</div></div><div className="decision-tree"><div className="tree-node">Incidente armado</div><div className="tree-line" /><div className="tree-split"><div><b>¿Intensidad?</b><span>{intensity}/5</span></div><div><b>¿Organización?</b><span>{organization}/5</span></div></div><div className="tree-line" /><div className="tree-result">{cani ? 'DIH + DIDH' : 'DIDH como regla general'}</div></div></div></section>

        <section id="acto-iv" className="act-section" onMouseEnter={() => setActiveAct(3)}><SectionHeader number="04" title="La decisión del mando es una cadena, no un impulso." kicker="Cinco preguntas de control"/><div className="checklist-grid">{['¿Qué umbral jurídico está probado?', '¿Quién es civil, PDH o FCC?', '¿Cuál es la ventaja concreta y el daño previsible?', '¿Qué medio permite capturar, contener o disuadir?', '¿Qué debo documentar, socorrer y reportar?'].map((item, index) => <div className="check-card" key={item}><span>0{index + 1}</span><p>{item}</p><Check size={18} /></div>)}</div></section>

        <section id="acto-v" className="act-section case-section" onMouseEnter={() => setActiveAct(4)}><SectionHeader number="05" title="Operación Río Verde" kicker="Laboratorio táctico · Colombia"/><div className="case-layout"><div className="case-map"><div className="map-grid" /><span className="map-label civilian">CIVILES</span><span className="map-label armed">GAO-r · FCC</span><span className="map-route" /><span className="map-pulse" /></div><div className="case-copy"><span className="label">Fase 04 · Escudos humanos</span><h2>La presencia civil no cancela la misión. Cambia la forma de ejecutarla.</h2><p>Aislar, evacuar, solicitar precisión y suspender el fuego indiscriminado. La legalidad no es una pausa operativa: es el diseño de la operación.</p><div className="quote">“El mando protege a la población antes, durante y después del contacto.”</div></div></div></section>

        <section id="acto-vi" className="act-section" onMouseEnter={() => setActiveAct(5)}><SectionHeader number="06" title="Caso comparado: cuando la geopolítica complica la etiqueta." kicker="Transferencia y contraste"/><div className="tabs"><button className="tab active">Criterio Tadić</button><button className="tab">Control global</button><button className="tab">Guerra proxy</button></div><div className="proxy-panel"><div className="proxy-stat"><span>Patrocinador externo</span><strong>no equivale</strong><small>a control efectivo</small></div><div className="proxy-arrow">→</div><div className="proxy-stat"><span>Inteligencia o apoyo</span><strong>no convierte</strong><small>un CANI en CAI automáticamente</small></div><div className="proxy-arrow">→</div><div className="proxy-stat"><span>Pregunta jurídica</span><strong>¿quién controla?</strong><small>¿con qué evidencia?</small></div></div></section>

        <section id="acto-vii" className="act-section dark-section" onMouseEnter={() => setActiveAct(6)}><SectionHeader number="07" title="Simulación en vivo" kicker="Tres preguntas · 20 segundos cada una"/><div className="quiz-card"><div className="quiz-meta"><span>Pregunta {quizIndex + 1} de 3</span><strong>{score} aciertos</strong></div><h2>{quiz.question}</h2><div className="options">{quiz.options.map((option, index) => <button key={option} disabled={selected !== null} className={selected === index ? (index === quiz.answer ? 'option correct' : 'option wrong') : selected !== null && index === quiz.answer ? 'option correct' : 'option'} onClick={() => answerQuiz(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div><AnimatePresence>{selected !== null && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="feedback"><strong>{selected === quiz.answer ? 'Correcto.' : 'Revisa el criterio.'}</strong><p>{quiz.explanation}</p><button className="secondary-button" onClick={() => { setQuizIndex((value) => (value + 1) % quizzes.length); setSelected(null) }}>Siguiente pregunta <ChevronRight size={15} /></button></motion.div>}</AnimatePresence></div></section>

        <section id="acto-viii" className="act-section" onMouseEnter={() => setActiveAct(7)}><SectionHeader number="08" title="La competencia se evidencia." kicker="Rúbrica ECSAN · 4.0 puntos"/><div className="rubric-layout"><div className="rubric-list">{['Umbral normativo · 30%', 'Principios rectores · 30%', 'Juicio táctico · 25%', 'Rigor terminológico · 15%'].map((label, index) => <label key={label}><span>{label}</span><select value={rubric[index]} onChange={(event) => setRubric((values) => values.map((value, i) => i === index ? Number(event.target.value) : value))}><option value="4">Excelente · 4.0</option><option value="3.5">Sobresaliente · 3.5</option><option value="3">Aceptable · 3.0</option><option value="2.5">Insuficiente · 2.5</option></select></label>)}</div><div className="score-orb"><span>Nota ponderada</span><strong>{weighted.toFixed(2)}</strong><small>/ 4.0</small><div className="score-ring" style={{ '--score': `${weighted / 4 * 100}%` } as React.CSSProperties} /></div></div></section>

        <section id="acto-ix" className="act-section resources-section" onMouseEnter={() => setActiveAct(8)}><SectionHeader number="09" title="Caja de herramientas" kicker="Transferible, imprimible, offline"/><div className="resource-grid"><Resource icon={<FileText />} title="Matriz operacional" text="Checklist de umbral, estatus, proporcionalidad y trazabilidad." onClick={() => downloadText('matriz-operacional-didh-dih.md', '# Matriz operacional DIDH / DIH\n\n1. Umbral jurídico\n2. Estatus del objetivo\n3. Proporcionalidad y precaución\n4. Medios proporcionales\n5. Socorro y documentación')} /><Resource icon={<BookOpen />} title="Guía del cadete" text="Resumen doctrinal, caso Río Verde y preguntas orientadoras." onClick={() => downloadText('guia-cadete-zona-gris.md', '# Guía de estudio\n\nLa protección de la vida y la legitimidad institucional son el centro de la decisión policial.')} /><Resource icon={<Gavel />} title="Ficha C-291/07" text="Control de convencionalidad, bloque de constitucionalidad y bienes civiles." onClick={() => downloadText('ficha-c291-2007.md', '# Ficha C-291 de 2007\n\nLos estándares consuetudinarios del DIH integran el parámetro constitucional aplicable.')} /></div></section>

        <section id="acto-x" className="act-section final-section" onMouseEnter={() => setActiveAct(9)}><div className="final-mark"><ShieldCheck size={38} /></div><span className="label">Cierre estratégico</span><h2>La legitimidad es el centro de gravedad.</h2><p>La fuerza pública no gana cuando solo controla el espacio. Gana cuando protege la vida, sostiene el derecho y conserva la confianza que hace posible la convivencia.</p><div className="final-line"><span /> Universidad Policial · ECSAN <span /></div></section>
      </main>

      <AnimatePresence>{notes && <motion.aside initial={{ x: 360 }} animate={{ x: 0 }} exit={{ x: 360 }} className="notes-drawer"><button className="close-notes" onClick={() => setNotes(false)}><X size={18} /></button><span className="label">Defensa ante jurado</span><h2>Respuesta breve</h2><p>El DIDH no desaparece porque exista violencia. El DIH solo concurre cuando se acredita un conflicto armado. La interoperabilidad exige identificar el contexto, el sujeto y el acto antes de decidir.</p><div className="note-callout"><Sparkles size={16} /><span>Obediencia creativa: cumplir la misión dentro del derecho, no obedecer una ilegalidad.</span></div><h3>Para recordar</h3><ul><li>El calibre no prueba un CANI.</li><li>La PDH es temporal y acumulativa.</li><li>La documentación también protege al mando.</li></ul></motion.aside>}</AnimatePresence>
    </div>
  )
}

function SectionHeader({ number, title, kicker }: { number: string; title: string; kicker: string }) { return <div className="section-header"><span className="section-number">{number}</span><div><span className="label">{kicker}</span><h2>{title}</h2></div></div> }
function Paradigm({ title, accent, icon, text, items }: { title: string; accent: string; icon: React.ReactNode; text: string; items: string[] }) { return <article className={`paradigm ${accent}`}><div className="paradigm-title">{icon}<h3>{title}</h3></div><p>{text}</p><ul>{items.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul></article> }
function Slider({ label, value, setValue, hints }: { label: string; value: number; setValue: (value: number) => void; hints: string }) { return <label className="slider-row"><span><b>{label}</b><small>{hints}</small></span><output>{value}/5</output><input type="range" min="1" max="5" value={value} onChange={(event) => setValue(Number(event.target.value))} /></label> }
function Resource({ icon, title, text, onClick }: { icon: React.ReactNode; title: string; text: string; onClick: () => void }) { return <button className="resource-card" onClick={onClick}><span className="resource-icon">{icon}</span><strong>{title}</strong><p>{text}</p><span className="download"><Download size={15} /> Descargar .md</span></button> }