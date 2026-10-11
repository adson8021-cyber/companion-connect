import { createFileRoute } from "@tanstack/react-router";
import "../member-area.css";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, CircleUserRound,
  Clock3, GraduationCap, LayoutDashboard, Library, LockKeyhole, LogOut,
  Menu, Play, Plus, Search, Settings2, ShieldCheck, Video, X,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Academy });

type User = { name: string; email: string; role?: "admin" | "student" };
type Lesson = { id: string; title: string; duration: string; url: string; done: boolean };
type Course = { id: string; title: string; description: string; category: string; lessons: Lesson[] };

const initialCourses: Course[] = [];

type View = "overview" | "courses" | "manage";

function Academy() {
  const [user, setUser] = useState<User | null>(null);
  const [adminMode] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("admin") === "1");
  const [authMode, setAuthMode] = useState<"signup" | "login">(() => {
    if (typeof window === "undefined" || new URLSearchParams(window.location.search).get("admin") !== "1") return "signup";
    try {
      const accounts = JSON.parse(localStorage.getItem("academy-accounts") || "{}") as Record<string, unknown>;
      return accounts["admin@academia.local"] ? "login" : "signup";
    } catch { return "signup"; }
  });
  const [authError, setAuthError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<View>("overview");
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Geral");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDuration, setLessonDuration] = useState("10 min");
  const [lessonUrl, setLessonUrl] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("academy-user");
      const savedCourses = localStorage.getItem("academy-courses");
      if (savedUser && !adminMode) setUser(JSON.parse(savedUser) as User);
      // Remove fictional starter/demo courses from old browser storage as well as the initial state.
      if (savedCourses) {
        const parsedCourses = JSON.parse(savedCourses) as Course[];
        const demoIds = new Set(["digital", "business", "productivity"]);
        const demoTitles = new Set(["Fundamentos do mundo digital", "Negócios e empreendedorismo", "Produtividade profissional"]);
        const cleanedCourses = parsedCourses.filter((course) => !demoIds.has(course.id) && !demoTitles.has(course.title));
        setCourses(cleanedCourses);
        localStorage.setItem("academy-courses", JSON.stringify(cleanedCourses));
      } else {
        setCourses([]);
      }
    } catch { /* Keeps the initial experience available if storage is disabled. */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("academy-courses", JSON.stringify(courses)); } catch { /* Session-only fallback. */ }
  }, [courses]);

  const activeCourse = courses.find((course) => course.id === activeCourseId) ?? null;
  const activeLesson = activeCourse?.lessons.find((lesson) => lesson.id === activeLessonId) ?? null;
  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const completed = courses.reduce((sum, course) => sum + course.lessons.filter((lesson) => lesson.done).length, 0);
  const filteredCourses = useMemo(() => courses.filter((course) => (course.title + course.description + course.category).toLowerCase().includes(query.toLowerCase())), [courses, query]);

  function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    const cleanEmail = email.trim().toLowerCase();
    if (password.length < 6) { setAuthError("A palavra-passe deve ter pelo menos 6 caracteres."); return; }
    try {
      const accounts = JSON.parse(localStorage.getItem("academy-accounts") || "{}") as Record<string, { name: string; password: string }>;
      if (adminMode && cleanEmail !== "admin@academia.local") { setAuthError("Usa o e-mail reservado para o acesso privado de administrador."); return; }
      if (authMode === "signup") {
        if (!adminMode && cleanEmail === "admin@academia.local") { setAuthError("Este e-mail está reservado ao administrador. Cria a tua conta de aluno com outro e-mail."); return; }
        if (adminMode && accounts["admin@academia.local"]) { setAuthError("O acesso de administrador já está configurado. Inicia sessão."); return; }
        if (!name.trim()) { setAuthError("Escreve o teu nome."); return; }
        if (accounts[cleanEmail]) { setAuthError("Já existe uma conta com este e-mail. Inicia sessão."); return; }
        accounts[cleanEmail] = { name: name.trim(), password };
        localStorage.setItem("academy-accounts", JSON.stringify(accounts));
      } else {
        if (!accounts[cleanEmail] || accounts[cleanEmail].password !== password) { setAuthError("E-mail ou palavra-passe incorretos."); return; }
      }
      const nextUser = { name: accounts[cleanEmail].name, email: cleanEmail, role: cleanEmail === "admin@academia.local" ? "admin" as const : "student" as const };
      localStorage.setItem("academy-user", JSON.stringify(nextUser));
      setUser(nextUser);
    } catch {
      setAuthError("Não foi possível guardar a conta neste navegador.");
    }
  }

  function signOut() {
    localStorage.removeItem("academy-user");
    setUser(null); setAuthMode("login"); setView("overview");
    setActiveCourseId(null); setActiveLessonId(null);
  }

  function openCourse(course: Course) {
    setActiveCourseId(course.id); setActiveLessonId(course.lessons[0]?.id ?? null); setView("courses");
  }

  function markComplete() {
    if (!activeCourse || !activeLesson) return;
    setCourses((all) => all.map((course) => course.id !== activeCourse.id ? course : {
      ...course, lessons: course.lessons.map((lesson) => lesson.id === activeLesson.id ? { ...lesson, done: !lesson.done } : lesson),
    }));
  }

  function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    const course = { id: `course-${Date.now()}`, title: newTitle.trim(), description: newDescription.trim() || "Descrição do curso.", category: newCategory, lessons: [] };
    setCourses((all) => [course, ...all]); setNewTitle(""); setNewDescription(""); setNotice("Curso criado. Agora adiciona as tuas videoaulas.");
    setActiveCourseId(course.id); setActiveLessonId(null);
  }

  function addLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeCourse || !lessonTitle.trim()) return;
    const lesson = { id: `lesson-${Date.now()}`, title: lessonTitle.trim(), duration: lessonDuration.trim() || "10 min", url: lessonUrl.trim(), done: false };
    setCourses((all) => all.map((course) => course.id === activeCourse.id ? { ...course, lessons: [...course.lessons, lesson] } : course));
    setActiveLessonId(lesson.id); setLessonTitle(""); setLessonDuration("10 min"); setLessonUrl(""); setNotice("Videoaula adicionada.");
  }

  if (!user) return (
    <main className="auth-page">
      <section className="auth-story">
        <a className="academy-brand" href="/" aria-label="Academia, início"><span className="brand-icon"><GraduationCap size={23} /></span><span>ACADEMIA<span className="brand-subtitle">ÁREA DE MEMBROS</span></span></a>
        <div className="story-copy">
          <span className="eyebrow-light">CONHECIMENTO QUE ABRE CAMINHOS</span>
          <h1>O teu próximo nível começa <em>aqui.</em></h1>
          <p>Uma área de aprendizagem profissional, com os teus cursos e videoaulas organizados num só lugar.</p>
          <div className="story-points"><span><ShieldCheck size={18} /> O teu espaço de aprendizagem</span><span><Video size={18} /> Aulas organizadas por curso</span><span><Check size={18} /> Acompanha o teu progresso</span></div>
        </div>
        <div className="story-bottom">APRENDE. APLICA. EVOLUI.</div>
      </section>
      <section className="auth-panel">
        <div className="auth-mobile-brand"><span className="brand-icon"><GraduationCap size={22} /></span><strong>ACADEMIA</strong></div>
        <div className="auth-card">
          <span className="auth-kicker">{authMode === "signup" ? "COMEÇA A TUA JORNADA" : "BEM-VINDO DE VOLTA"}</span>
          <h2>{adminMode ? (authMode === "signup" ? "Configura o teu acesso privado" : "Acesso privado do administrador") : authMode === "signup" ? "Cria a tua conta" : "Inicia sessão"}</h2>
          <p className="auth-description">{adminMode ? (authMode === "signup" ? "Configura aqui a tua conta privada de administrador. Esta opção não aparece aos alunos." : "Inicia sessão para gerir os cursos e as videoaulas.") : authMode === "signup" ? "Regista-te para entrares na tua área de membros." : "Entra na tua conta para continuares a aprender."}</p>
          <form className="auth-form" onSubmit={submitAuth}>
            {authMode === "signup" && <label>Nome completo<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como te chamas?" required /></label>}
            <label>E-mail<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={adminMode ? "O teu e-mail privado" : "nome@exemplo.com"} required /></label>
            <label>Palavra-passe<input type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" minLength={6} required /></label>
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            <button className="auth-submit" type="submit">{adminMode ? (authMode === "signup" ? "Configurar acesso privado" : "Entrar no painel privado") : authMode === "signup" ? "Criar conta" : "Entrar na área de membros"} <ArrowRight size={17} /></button>
          </form>
          {!adminMode && <>
            <button className="auth-demo-button" type="button" onClick={() => { setUser({ name: "Visitante", email: "demo@academia.local", role: "student" }); setView("overview"); setAuthError(""); }}>Explorar demonstração sem criar conta <ArrowRight size={16} /></button>
            <div className="auth-switch">{authMode === "signup" ? "Já tens conta?" : "Ainda não tens conta?"} <button onClick={() => { setAuthMode(authMode === "signup" ? "login" : "signup"); setAuthError(""); }}>{authMode === "signup" ? "Inicia sessão" : "Criar conta"}</button></div>
          </>}
          <div className="auth-privacy"><LockKeyhole size={14} /> A tua aprendizagem começa num espaço dedicado.</div>
        </div>
        <p className="auth-copyright">© {new Date().getFullYear()} Academia. Todos os direitos reservados.</p>
      </section>
    </main>
  );

  const navItems = [
    { id: "overview" as const, label: "Visão geral", icon: LayoutDashboard },
    { id: "courses" as const, label: "Biblioteca de cursos", icon: Library },
    ...(user.role === "admin" ? [{ id: "manage" as const, label: "Painel de administrador", icon: Settings2 }] : []),
  ];

  return (
    <div className="academy-app">
      {mobileMenu && <button className="mobile-overlay" aria-label="Fechar menu" onClick={() => setMobileMenu(false)} />}
      <aside className={`academy-sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <a className="academy-brand sidebar-brand" href="#"><span className="brand-icon"><GraduationCap size={23} /></span><span>ACADEMIA<span className="brand-subtitle">ÁREA DE MEMBROS</span></span></a>
        <div className="side-label">ESPAÇO DO ALUNO</div>
        <nav className="side-nav">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "side-link side-link-active" : "side-link"} onClick={() => { setView(id); setMobileMenu(false); }}><Icon size={18} /><span>{label}</span>{id === "courses" && <span className="side-count">{courses.length}</span>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="secure-note"><ShieldCheck size={19} /><strong>O teu espaço de estudo</strong><p>Os teus cursos, num só lugar.</p></div><button className="logout-button" onClick={signOut}><LogOut size={17} /> Terminar sessão</button></div>
      </aside>
      <main className="academy-main">
        <header className="academy-topbar"><div className="topbar-title"><button className="mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={21} /></button><span>Área de membros <ArrowRight size={14} /> <strong>{activeCourse ? activeCourse.title : navItems.find((item) => item.id === view)?.label}</strong></span></div><div className="account-chip">{user.role === "admin" && <span className="admin-role-pill">ADMIN</span>}<span className="account-avatar">{user.name.trim().charAt(0).toUpperCase()}</span><span className="account-name">{user.name}</span><ChevronDown size={15} /></div></header>
        <div className="academy-content">
          {notice && <div className="notice-bar"><Check size={17} />{notice}<button onClick={() => setNotice("")} aria-label="Fechar aviso"><X size={16} /></button></div>}
          {view === "overview" && <><section className="page-intro"><div><span className="section-eyebrow">O TEU PERCURSO</span><h1>Bem-vindo, {user.name.split(" ")[0]}.</h1><p>Continua de onde paraste. O teu próximo passo começa com uma aula.</p></div><button className="button-primary" onClick={() => { setView("courses"); setActiveCourseId(null); }}><BookOpen size={17} /> Explorar cursos</button></section>
            <section className="metric-grid"><article className="metric-card"><span className="metric-icon"><Library size={20} /></span><span className="metric-label">Os teus cursos</span><strong>{courses.length.toString().padStart(2, "0")}</strong><small>Na tua biblioteca</small></article><article className="metric-card"><span className="metric-icon metric-icon-green"><Check size={20} /></span><span className="metric-label">Aulas concluídas</span><strong>{completed.toString().padStart(2, "0")}<small> / {totalLessons}</small></strong><small>O teu progresso</small></article><article className="metric-card"><span className="metric-icon metric-icon-dark"><Play size={20} /></span><span className="metric-label">Progresso geral</span><strong>{totalLessons ? Math.round(completed / totalLessons * 100) : 0}<small>%</small></strong><div className="metric-progress"><span style={{ width: `${totalLessons ? completed / totalLessons * 100 : 0}%` }} /></div></article></section>
            <section className="content-heading"><div><h2>Continua a aprender</h2><p>Acede aos teus cursos e retoma as videoaulas.</p></div><button className="text-link" onClick={() => setView("courses")}>Ver biblioteca <ArrowRight size={15} /></button></section>
            <div className="course-grid">{courses.slice(0, 3).map((course, index) => <CourseCard key={course.id} course={course} index={index} onClick={() => openCourse(course)} />)}</div>
          </>}
          {view === "courses" && <>{activeCourse ? <><button className="back-link" onClick={() => { setActiveCourseId(null); setActiveLessonId(null); }}><ArrowLeft size={16} /> Voltar à biblioteca</button><section className="page-intro compact-intro"><div><span className="section-eyebrow">{activeCourse.category.toUpperCase()}</span><h1>{activeCourse.title}</h1><p>{activeCourse.description}</p></div></section><div className="lesson-layout"><section className="video-panel"><div className="video-screen">{activeLesson?.url ? <VideoEmbed url={activeLesson.url} title={activeLesson.title} /> : <div className="video-placeholder"><span className="video-play"><Play size={26} fill="currentColor" /></span><strong>{activeLesson?.title ?? "As tuas videoaulas"}</strong><p>{activeLesson ? "Adiciona o endereço do vídeo na gestão de conteúdos para o reproduzir aqui." : "Seleciona uma aula na lista para começar."}</p></div>}</div><div className="video-information"><span className="section-eyebrow">AULA DO CURSO</span><h2>{activeLesson?.title ?? "Ainda não há aulas"}</h2><div className="video-actions"><span><Clock3 size={15} /> {activeLesson?.duration ?? "—"}</span>{activeLesson && <button className={activeLesson.done ? "button-complete is-done" : "button-complete"} onClick={markComplete}>{activeLesson.done ? <Check size={16} /> : <Check size={16} />}{activeLesson.done ? "Aula concluída" : "Marcar como concluída"}</button>}</div></div></section><aside className="lesson-list"><div className="lesson-list-head"><div><h3>Conteúdo do curso</h3><p>{activeCourse.lessons.length} aulas</p></div><span>{activeCourse.lessons.filter((lesson) => lesson.done).length}/{activeCourse.lessons.length}</span></div>{activeCourse.lessons.map((lesson, index) => <button key={lesson.id} className={activeLessonId === lesson.id ? "lesson-row lesson-row-active" : "lesson-row"} onClick={() => setActiveLessonId(lesson.id)}><span className={lesson.done ? "lesson-index lesson-index-done" : "lesson-index"}>{lesson.done ? <Check size={15} /> : String(index + 1).padStart(2, "0")}</span><span className="lesson-row-copy"><strong>{lesson.title}</strong><small><Play size={12} /> {lesson.duration}</small></span></button>)}{!activeCourse.lessons.length && <p className="empty-lessons">Ainda não existem aulas neste curso.</p>}</aside></div></> : <><section className="page-intro"><div><span className="section-eyebrow">A TUA BIBLIOTECA</span><h1>Biblioteca de cursos</h1><p>Encontra o curso certo e continua a desenvolver as tuas competências.</p></div></section><label className="course-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar cursos..." /></label><div className="course-grid">{filteredCourses.map((course, index) => <CourseCard key={course.id} course={course} index={index} onClick={() => openCourse(course)} />)}{!filteredCourses.length && <div className="empty-library">Não encontrámos cursos com essa pesquisa.</div>}</div></>}</>}
          {view === "manage" && user.role === "admin" && <><section className="page-intro"><div><span className="section-eyebrow">PAINEL DE CONTEÚDOS</span><h1>Gerir cursos e aulas</h1><p>Organiza os cursos e adiciona os links das tuas videoaulas.</p></div></section><div className="manage-grid"><section className="manage-panel"><div className="manage-panel-title"><span className="manage-icon"><Plus size={19} /></span><div><h2>Criar um curso</h2><p>Define a informação principal do curso.</p></div></div><form className="manage-form" onSubmit={addCourse}><label>Nome do curso<input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex.: Marketing digital" required /></label><label>Descrição<textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="O que o aluno vai aprender?" rows={3} /></label><label>Categoria<select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}><option>Geral</option><option>Tecnologia</option><option>Negócios</option><option>Marketing</option><option>Desenvolvimento</option></select></label><button className="button-primary" type="submit"><Plus size={16} /> Criar curso</button></form></section><section className="manage-panel"><div className="manage-panel-title"><span className="manage-icon"><Video size={19} /></span><div><h2>Adicionar videoaula</h2><p>Associa uma aula a um curso existente.</p></div></div><form className="manage-form" onSubmit={addLesson}><label>Curso<select value={activeCourseId ?? ""} onChange={(e) => { setActiveCourseId(e.target.value || null); setActiveLessonId(null); }} required><option value="">Seleciona um curso</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><label>Nome da aula<input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Ex.: Aula 1 — Introdução" required /></label><label>Duração<input value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} placeholder="10 min" /></label><label>Link do vídeo<input type="url" value={lessonUrl} onChange={(e) => setLessonUrl(e.target.value)} placeholder="https://youtube.com/... ou URL MP4" /><small>Compatível com links de YouTube, Vimeo e ficheiros MP4 acessíveis por URL.</small></label><button className="button-primary" type="submit" disabled={!activeCourseId}><Plus size={16} /> Adicionar aula</button></form></section></div><section className="manage-course-list"><div className="content-heading"><div><h2>Os teus cursos</h2><p>{courses.length} cursos na plataforma</p></div></div>{courses.map((course) => <div className="manage-course-row" key={course.id}><span className="manage-course-symbol"><BookOpen size={19} /></span><span className="manage-course-copy"><strong>{course.title}</strong><small>{course.category} · {course.lessons.length} aulas</small></span><button className="text-link" onClick={() => { setActiveCourseId(course.id); setActiveLessonId(course.lessons[0]?.id ?? null); setView("courses"); }}>Ver curso <ArrowRight size={14} /></button></div>)}</section><p className="storage-warning"><LockKeyhole size={15} /> Esta versão é um protótipo: contas, cursos e progresso ficam guardados apenas neste navegador. Para uma plataforma real, é necessário ligar autenticação e base de dados seguras.</p></>}
        </div>
        <footer className="academy-footer"><span>© {new Date().getFullYear()} Academia</span><span>Aprende ao teu ritmo.</span></footer>
      </main>
    </div>
  );
}

function CourseCard({ course, index, onClick }: { course: Course; index: number; onClick: () => void }) {
  const done = course.lessons.filter((lesson) => lesson.done).length;
  const progress = course.lessons.length ? Math.round(done / course.lessons.length * 100) : 0;
  return <article className="professional-course-card"><button className={`course-band course-band-${index % 3}`} onClick={onClick} aria-label={`Abrir ${course.title}`}><span className="course-category">{course.category}</span><span className="course-band-icon"><BookOpen size={30} /></span><span className="course-band-arrow"><ArrowRight size={17} /></span></button><div className="professional-course-body"><span className="course-small-meta"><Video size={13} /> {course.lessons.length} aulas</span><h3>{course.title}</h3><p>{course.description}</p><div className="course-progress-copy"><span>O teu progresso</span><strong>{progress}%</strong></div><div className="course-progress-bar"><span style={{ width: `${progress}%` }} /></div><button className="course-open-button" onClick={onClick}>{progress ? "Continuar curso" : "Aceder ao curso"} <ArrowRight size={15} /></button></div></article>;
}

function VideoEmbed({ url, title }: { url: string; title: string }) {
  let embedUrl = url;
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (youtube) embedUrl = `https://www.youtube-nocookie.com/embed/${youtube[1]}`;
  else if (vimeo) embedUrl = `https://player.vimeo.com/video/${vimeo[1]}`;
  if (/\.mp4(?:\?.*)?$/i.test(url)) return <video src={url} controls playsInline aria-label={title} />;
  return <iframe src={embedUrl} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" />;
}
