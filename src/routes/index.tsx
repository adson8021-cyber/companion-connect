import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpRight, BookOpen, CheckCircle2, ChevronRight, CircleUserRound,
  Clock3, GraduationCap, LayoutDashboard, Library, Menu, Play, Plus,
  Search, Settings2, Sparkles, Trash2, Video, X,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: MembersArea });

type Lesson = { id: string; title: string; duration: string; videoUrl: string; completed: boolean };
type Course = { id: string; title: string; description: string; category: string; level: string; instructor: string; lessons: Lesson[] };

const starterCourses: Course[] = [
  { id: "course-1", title: "Começa aqui: boas-vindas", description: "Conhece a plataforma e aprende a tirar o melhor partido dos teus cursos.", category: "Orientação", level: "Iniciante", instructor: "Equipa do curso", lessons: [
    { id: "lesson-1", title: "Bem-vindo à tua área de membros", duration: "04 min", videoUrl: "", completed: false },
    { id: "lesson-2", title: "Como acompanhar as tuas aulas", duration: "06 min", videoUrl: "", completed: false },
  ] },
  { id: "course-2", title: "Fundamentos digitais", description: "Uma base prática para desenvolver competências no mundo digital.", category: "Tecnologia", level: "Iniciante", instructor: "Instrutor", lessons: [
    { id: "lesson-3", title: "Introdução aos fundamentos digitais", duration: "12 min", videoUrl: "", completed: false },
    { id: "lesson-4", title: "Ferramentas essenciais", duration: "18 min", videoUrl: "", completed: false },
    { id: "lesson-5", title: "Próximos passos", duration: "09 min", videoUrl: "", completed: false },
  ] },
  { id: "course-3", title: "Produtividade e organização", description: "Organiza o teu tempo e cria uma rotina de aprendizagem consistente.", category: "Produtividade", level: "Todos os níveis", instructor: "Instrutor", lessons: [
    { id: "lesson-6", title: "Define os teus objetivos", duration: "08 min", videoUrl: "", completed: false },
    { id: "lesson-7", title: "Cria o teu plano semanal", duration: "15 min", videoUrl: "", completed: false },
  ] },
];

type Section = "dashboard" | "courses" | "admin";

function MembersArea() {
  const [section, setSection] = useState<Section>("dashboard");
  const [courses, setCourses] = useState<Course[]>(starterCourses);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("Geral");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDuration, setLessonDuration] = useState("10 min");
  const [lessonUrl, setLessonUrl] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("companion-member-courses");
      if (saved) setCourses(JSON.parse(saved) as Course[]);
    } catch {
      // Keep the starter courses available if browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("companion-member-courses", JSON.stringify(courses));
    } catch {
      // The interface remains usable for the current session without storage.
    }
  }, [courses]);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;
  const selectedLesson = selectedCourse?.lessons.find((lesson) => lesson.id === selectedLessonId) ?? null;
  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const completedLessons = courses.reduce((sum, course) => sum + course.lessons.filter((lesson) => lesson.completed).length, 0);
  const overallProgress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const filteredCourses = useMemo(() => courses.filter((course) => `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(search.toLowerCase())), [courses, search]);

  function openCourse(course: Course) {
    setSelectedCourseId(course.id);
    setSelectedLessonId(course.lessons[0]?.id ?? null);
    setSection("courses");
  }

  function toggleLesson(courseId: string, lessonId: string) {
    setCourses((current) => current.map((course) => course.id !== courseId ? course : {
      ...course,
      lessons: course.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson),
    }));
  }

  function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = courseTitle.trim();
    if (!title) return;
    const newCourse: Course = {
      id: `course-${Date.now()}`, title, description: courseDescription.trim() || "Adiciona uma descrição para este curso.",
      category: courseCategory, level: "Iniciante", instructor: "Administrador", lessons: [],
    };
    setCourses((current) => [newCourse, ...current]);
    setCourseTitle("");
    setCourseDescription("");
    setAdminMessage("Curso criado. Agora podes adicionar as primeiras videoaulas.");
    setSelectedCourseId(newCourse.id);
    setSelectedLessonId(null);
  }

  function addLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCourse || !lessonTitle.trim()) return;
    const lesson: Lesson = {
      id: `lesson-${Date.now()}`, title: lessonTitle.trim(), duration: lessonDuration.trim() || "10 min",
      videoUrl: lessonUrl.trim(), completed: false,
    };
    setCourses((current) => current.map((course) => course.id === selectedCourse.id ? { ...course, lessons: [...course.lessons, lesson] } : course));
    setSelectedLessonId(lesson.id);
    setLessonTitle("");
    setLessonDuration("10 min");
    setLessonUrl("");
    setAdminMessage("Aula adicionada ao curso.");
  }

  function deleteCourse(courseId: string) {
    setCourses((current) => current.filter((course) => course.id !== courseId));
    if (selectedCourseId === courseId) {
      setSelectedCourseId(null);
      setSelectedLessonId(null);
    }
    setAdminMessage("Curso removido deste navegador.");
  }

  const navigation = [
    { id: "dashboard" as const, label: "Visão geral", icon: LayoutDashboard },
    { id: "courses" as const, label: "Os meus cursos", icon: Library },
    { id: "admin" as const, label: "Gerir conteúdos", icon: Settings2 },
  ];

  return (
    <div className="member-app">
      <aside className={`member-sidebar ${mobileNavOpen ? "member-sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><GraduationCap size={23} strokeWidth={2.2} /></div>
          <div><span className="brand-name">Academia</span><span className="brand-caption">ÁREA DE MEMBROS</span></div>
          <button className="icon-button sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="Fechar menu"><X size={19} /></button>
        </div>
        <div className="sidebar-label">MENU PRINCIPAL</div>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${section === id ? "nav-link-active" : ""}`} onClick={() => { setSection(id); setMobileNavOpen(false); }}>
              <Icon size={19} strokeWidth={1.9} /><span>{label}</span>{id === "courses" && <span className="nav-count">{courses.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-help">
          <div className="help-icon"><Sparkles size={19} /></div>
          <strong>Aprende ao teu ritmo</strong>
          <p>As tuas aulas ficam organizadas num só lugar.</p>
          <button onClick={() => { setSection("courses"); setSelectedCourseId(null); }}>Explorar cursos <ArrowUpRight size={15} /></button>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar"><CircleUserRound size={25} /></div>
          <div className="profile-copy"><strong>Meu perfil</strong><span>Membro da academia</span></div>
          <span className="online-dot" title="Sessão local" />
        </div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileNavOpen(false)} />}

      <main className="member-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Abrir menu"><Menu size={21} /></button>
            <div className="breadcrumb">Área de membros <ChevronRight size={15} /> <span>{navigation.find((item) => item.id === section)?.label ?? "Curso"}</span></div>
          </div>
          <div className="topbar-right"><span className="welcome-label">Bem-vindo à tua aprendizagem</span><div className="top-avatar"><CircleUserRound size={22} /></div></div>
        </header>

        {section === "dashboard" && (
          <div className="page-content">
            <section className="welcome-row">
              <div><div className="eyebrow"><Sparkles size={14} /> O TEU ESPAÇO DE APRENDIZAGEM</div><h1>Continua a crescer<span className="title-period">.</span></h1><p className="page-subtitle">Aprende algo novo hoje. O próximo passo começa aqui.</p></div>
              <button className="primary-button" onClick={() => { setSection("courses"); setSelectedCourseId(null); }}><BookOpen size={17} /> Ver os meus cursos</button>
            </section>
            <section className="stats-grid" aria-label="Resumo da aprendizagem">
              <div className="stat-card"><div className="stat-icon stat-icon-purple"><Library size={20} /></div><div className="stat-label">Cursos disponíveis</div><div className="stat-value">{courses.length}<span className="stat-unit"> cursos</span></div><div className="stat-foot">Conteúdos na tua biblioteca</div></div>
              <div className="stat-card"><div className="stat-icon stat-icon-green"><CheckCircle2 size={20} /></div><div className="stat-label">Aulas concluídas</div><div className="stat-value">{completedLessons}<span className="stat-unit"> de {totalLessons}</span></div><div className="stat-foot">Cada aula é um passo em frente</div></div>
              <div className="stat-card"><div className="stat-icon stat-icon-orange"><Play size={20} /></div><div className="stat-label">Progresso geral</div><div className="stat-value">{overallProgress}<span className="stat-unit">%</span></div><div className="stat-progress"><span style={{ width: `${overallProgress}%` }} /></div></div>
            </section>
            <section className="section-heading"><div><h2>Retoma a aprendizagem</h2><p>Escolhe um curso e continua de onde paraste.</p></div><button className="text-button" onClick={() => { setSection("courses"); setSelectedCourseId(null); }}>Ver todos <ChevronRight size={16} /></button></section>
            <section className="course-grid">
              {courses.slice(0, 3).map((course, index) => {
                const done = course.lessons.filter((lesson) => lesson.completed).length;
                const progress = course.lessons.length ? Math.round(done / course.lessons.length * 100) : 0;
                return <article className="course-card" key={course.id}>
                  <div className={`course-cover cover-${index % 3}`}><div className="cover-orbit orbit-one" /><div className="cover-orbit orbit-two" /><span className="cover-kicker">{course.category}</span><div className="cover-symbol">{index % 3 === 0 ? <GraduationCap size={36} /> : index % 3 === 1 ? <Video size={34} /> : <Sparkles size={34} />}</div><span className="cover-lessons">{course.lessons.length} aulas</span></div>
                  <div className="course-card-body"><div className="course-meta"><span>{course.level}</span><span><Clock3 size={13} /> {course.lessons.length ? course.lessons.length * 10 : 0} min aprox.</span></div><h3>{course.title}</h3><p>{course.description}</p><div className="course-progress-label"><span>O teu progresso</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><button className="course-action" onClick={() => openCourse(course)}>{course.lessons.length ? "Continuar curso" : "Preparar curso"} <ChevronRight size={16} /></button></div>
                </article>;
              })}
              {courses.length === 0 && <div className="empty-state"><Library size={30} /><h3>A tua biblioteca está vazia</h3><p>Cria o teu primeiro curso na área de gestão de conteúdos.</p><button className="primary-button" onClick={() => setSection("admin")}><Plus size={17} /> Criar curso</button></div>}
            </section>
            <section className="tip-banner"><div className="tip-icon"><Sparkles size={22} /></div><div><strong>Uma aula de cada vez.</strong><p>Reserva alguns minutos por dia para aprender e acompanhar o teu progresso.</p></div><div className="tip-decoration">✳</div></section>
          </div>
        )}

        {section === "courses" && (
          <div className="page-content">
            <section className="welcome-row"><div><div className="eyebrow">A TUA BIBLIOTECA</div><h1>{selectedCourse ? selectedCourse.title : "Os meus cursos"}<span className="title-period">.</span></h1><p className="page-subtitle">{selectedCourse ? selectedCourse.description : "Todos os teus conteúdos de aprendizagem, reunidos num só lugar."}</p></div>{selectedCourse ? <button className="secondary-button" onClick={() => { setSelectedCourseId(null); setSelectedLessonId(null); }}>← Voltar aos cursos</button> : <button className="primary-button" onClick={() => setSection("admin")}><Plus size={17} /> Novo curso</button>}</section>
            {selectedCourse ? (
              <div className="lesson-layout">
                <section className="lesson-main-card">
                  <div className="video-frame">
                    {selectedLesson?.videoUrl ? (selectedLesson.videoUrl.includes("youtube.com") || selectedLesson.videoUrl.includes("youtu.be") || selectedLesson.videoUrl.includes("vimeo.com") ? <iframe src={getEmbedUrl(selectedLesson.videoUrl)} title={selectedLesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <video src={selectedLesson.videoUrl} controls playsInline />) : <div className="video-empty"><div className="video-empty-icon"><Play size={29} fill="currentColor" /></div><strong>{selectedLesson ? "A tua aula está pronta para receber um vídeo" : "Escolhe uma aula para começar"}</strong><p>{selectedLesson ? "Adiciona o link do YouTube, Vimeo ou um ficheiro MP4 na área de gestão de conteúdos." : "Seleciona uma aula na lista ao lado para abrir o leitor."}</p><button className="secondary-button" onClick={() => setSection("admin")}><Settings2 size={16} /> Gerir videoaulas</button></div>}
                  </div>
                  <div className="lesson-details"><div className="lesson-tag">{selectedCourse.category}</div><h2>{selectedLesson?.title ?? "Ainda não há aulas neste curso"}</h2><p>{selectedLesson ? `Parte do curso “${selectedCourse.title}”. Acompanha a aula ao teu ritmo e marca-a como concluída quando terminares.` : "Vai à área de gestão de conteúdos para adicionares a primeira aula a este curso."}</p>{selectedLesson && <div className="lesson-detail-actions"><span><Clock3 size={15} /> {selectedLesson.duration}</span><button className={`complete-button ${selectedLesson.completed ? "is-complete" : ""}`} onClick={() => toggleLesson(selectedCourse.id, selectedLesson.id)}>{selectedLesson.completed ? <><CheckCircle2 size={16} /> Aula concluída</> : <><CheckCircle2 size={16} /> Marcar como concluída</>}</button></div>}</div>
                </section>
                <aside className="lesson-playlist"><div className="playlist-heading"><div><span className="eyebrow">CONTEÚDO DO CURSO</span><h3>Lista de aulas</h3></div><span className="playlist-count">{selectedCourse.lessons.length}</span></div><div className="playlist-progress"><div><span>Progresso do curso</span><strong>{selectedCourse.lessons.length ? Math.round(selectedCourse.lessons.filter((lesson) => lesson.completed).length / selectedCourse.lessons.length * 100) : 0}%</strong></div><div className="progress-track"><span style={{ width: `${selectedCourse.lessons.length ? selectedCourse.lessons.filter((lesson) => lesson.completed).length / selectedCourse.lessons.length * 100 : 0}%` }} /></div></div>
                  {selectedCourse.lessons.map((lesson, index) => <button key={lesson.id} className={`playlist-lesson ${selectedLessonId === lesson.id ? "playlist-lesson-active" : ""}`} onClick={() => setSelectedLessonId(lesson.id)}><span className={`lesson-number ${lesson.completed ? "lesson-number-done" : ""}`}>{lesson.completed ? <CheckCircle2 size={17} /> : <Play size={15} />}</span><span className="playlist-lesson-copy"><strong>{lesson.title}</strong><small><Clock3 size={12} /> {lesson.duration}</small></span>{selectedLessonId === lesson.id && <span className="playing-dot" />}</button>)}
                  {selectedCourse.lessons.length === 0 && <div className="playlist-empty">Ainda não existem aulas. Adiciona uma na área de gestão.</div>}
                  <button className="add-lesson-shortcut" onClick={() => setSection("admin")}><Plus size={16} /> Adicionar uma aula</button>
                </aside>
              </div>
            ) : <><div className="search-bar"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar cursos..." aria-label="Pesquisar cursos" /><span>{filteredCourses.length} cursos</span></div><section className="course-grid course-grid-library">{filteredCourses.map((course, index) => <article className="course-card" key={course.id}><div className={`course-cover cover-${index % 3}`}><div className="cover-orbit orbit-one" /><div className="cover-orbit orbit-two" /><span className="cover-kicker">{course.category}</span><div className="cover-symbol">{index % 3 === 0 ? <GraduationCap size={36} /> : index % 3 === 1 ? <Video size={34} /> : <Sparkles size={34} />}</div><span className="cover-lessons">{course.lessons.length} aulas</span></div><div className="course-card-body"><div className="course-meta"><span>{course.level}</span><span><Clock3 size={13} /> {course.lessons.length * 10} min aprox.</span></div><h3>{course.title}</h3><p>{course.description}</p><button className="course-action" onClick={() => openCourse(course)}>{course.lessons.length ? "Abrir curso" : "Preparar curso"} <ChevronRight size={16} /></button></div></article>)}
              {filteredCourses.length === 0 && <div className="empty-state"><Search size={28} /><h3>Não encontrámos cursos</h3><p>Tenta pesquisar por outro nome ou categoria.</p></div>}</section></>}
          </div>
        )}

        {section === "admin" && (
          <div className="page-content">
            <section className="welcome-row"><div><div className="eyebrow"><Settings2 size={14} /> PAINEL DE CONTEÚDOS</div><h1>Gerir os teus cursos<span className="title-period">.</span></h1><p className="page-subtitle">Cria cursos e organiza as videoaulas que vais disponibilizar aos teus membros.</p></div></section>
            {adminMessage && <div className="admin-notice"><CheckCircle2 size={18} />{adminMessage}<button onClick={() => setAdminMessage("")} aria-label="Fechar aviso"><X size={16} /></button></div>}
            <div className="admin-layout">
              <section className="admin-panel"><div className="admin-panel-heading"><div className="admin-heading-icon"><Plus size={20} /></div><div><h2>Criar um curso</h2><p>Começa por definir o nome e os detalhes.</p></div></div><form className="admin-form" onSubmit={addCourse}><label>Nome do curso<input required value={courseTitle} onChange={(event) => setCourseTitle(event.target.value)} placeholder="Ex.: Marketing digital do zero" /></label><label>Descrição<textarea value={courseDescription} onChange={(event) => setCourseDescription(event.target.value)} placeholder="O que os alunos vão aprender?" rows={3} /></label><label>Categoria<select value={courseCategory} onChange={(event) => setCourseCategory(event.target.value)}><option>Geral</option><option>Tecnologia</option><option>Marketing</option><option>Negócios</option><option>Desenvolvimento pessoal</option><option>Design</option><option>Orientação</option></select></label><button className="primary-button full-button" type="submit"><Plus size={17} /> Criar curso</button></form></section>
              <section className="admin-panel"><div className="admin-panel-heading"><div className="admin-heading-icon admin-heading-green"><Video size={20} /></div><div><h2>Adicionar videoaula</h2><p>Escolhe um curso e adiciona a ligação do vídeo.</p></div></div><form className="admin-form" onSubmit={addLesson}><label>Curso<select required value={selectedCourseId ?? ""} onChange={(event) => { setSelectedCourseId(event.target.value || null); setSelectedLessonId(null); }}><option value="">Seleciona um curso</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><label>Nome da aula<input required value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} placeholder="Ex.: Aula 1 — Introdução" /></label><div className="form-two-cols"><label>Duração<input value={lessonDuration} onChange={(event) => setLessonDuration(event.target.value)} placeholder="10 min" /></label><label>Link do vídeo<input value={lessonUrl} onChange={(event) => setLessonUrl(event.target.value)} placeholder="https://..." /></label></div><p className="form-help"><Video size={15} /> Aceita links do YouTube, Vimeo ou URL direta de vídeo MP4. Para um vídeo privado, usa uma ligação que os teus membros tenham permissão para ver.</p><button className="primary-button full-button" type="submit" disabled={!selectedCourseId}><Plus size={17} /> Adicionar aula</button></form></section>
            </div>
            <section className="admin-course-list"><div className="section-heading"><div><h2>Biblioteca de conteúdos</h2><p>{courses.length} cursos · {totalLessons} aulas no total</p></div></div>{courses.map((course) => <div className="admin-course-row" key={course.id}><div className="admin-course-symbol"><BookOpen size={20} /></div><div className="admin-course-copy"><strong>{course.title}</strong><span>{course.category} · {course.lessons.length} aulas</span></div><button className="row-action" onClick={() => openCourse(course)}>Ver aulas <ChevronRight size={15} /></button><button className="icon-button delete-button" onClick={() => deleteCourse(course.id)} aria-label={`Remover ${course.title}`} title="Remover curso"><Trash2 size={17} /></button></div>)}</section>
            <div className="storage-note"><CheckCircle2 size={17} /><p><strong>Nota sobre esta primeira versão:</strong> os cursos e as aulas ficam guardados neste navegador. Para disponibilizar cursos privados a diferentes alunos, com login real e vídeos protegidos, será necessário ligar uma base de dados, autenticação e armazenamento de vídeo.</p></div>
          </div>
        )}
        <footer className="member-footer"><span>© {new Date().getFullYear()} Academia · Área de membros</span><span>Feito para aprender ao teu ritmo <span className="footer-heart">♥</span></span></footer>
      </main>
    </div>
  );
}

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}`;
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}
