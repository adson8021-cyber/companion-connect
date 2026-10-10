# Academia — Área de Membros

Plataforma de cursos online com uma experiência profissional para alunos.

## Experiência atual

- A primeira página apresenta criação de conta; os alunos já registados podem iniciar sessão.
- Área do aluno com resumo de progresso e biblioteca de cursos.
- Página de curso com lista de aulas, progresso e leitor para YouTube, Vimeo ou URL de vídeo MP4.
- Gestão de conteúdos para criar cursos e adicionar videoaulas através de links.
- Interface adaptável a telemóveis e computadores, com azul-escuro e verde como cores principais.

## Executar localmente

Requisitos: Node.js e npm.

```sh
npm install
npm run dev
```

Para validar a compilação:

```sh
npm run build
```

## Importante antes de lançar publicamente

Esta versão é um protótipo de interface. A autenticação de demonstração e os dados são guardados no armazenamento local do navegador; não constituem um sistema de contas seguro e não sincronizam entre dispositivos. Não utilizar com palavras-passe reais nem para vender cursos até integrar um serviço de autenticação, uma base de dados e permissões no servidor. Os links de vídeo precisam de estar alojados num serviço acessível; esta aplicação não faz upload nem armazenamento dos ficheiros de vídeo.

