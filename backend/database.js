const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'pdp.db');

function getDb() {
  return new Database(DB_PATH);
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      order_index INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pillars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pillar_id INTEGER NOT NULL,
      score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
      evidence TEXT,
      goal TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (pillar_id) REFERENCES pillars(id),
      UNIQUE(user_id, pillar_id)
    );
  `);

  const categories = [
    { code: 'TECNICA', name: 'Técnica e Execução', order_index: 1 },
    { code: 'DESCOBERTA', name: 'Descoberta & Estratégia', order_index: 2 },
    { code: 'COLABORACAO', name: 'Colaboração & Influência', order_index: 3 },
    { code: 'IMPACTO', name: 'Impacto & Liderança', order_index: 4 },
    { code: 'IA', name: 'IA & Design', order_index: 5 },
    { code: 'CONSULTORIA', name: 'Mentalidade de Consultoria', order_index: 6 },
    { code: 'GESTAO', name: 'Gestão & Operação', order_index: 7 },
  ];

  const pillars = [
    // Técnica e Execução
    {
      category: 'TECNICA', code: '1.1', name: 'Arquitetura da Informação & Estruturação', order_index: 1,
      description: '• Estrutura a arquitetura de informações considerando categorização, taxonomia, nomenclaturas e boas práticas de ergonomia e usabilidade\n• Organiza elementos de forma que as pessoas reconheçam instantaneamente sua ordem de importância em uma tela ou página, direcionando a atenção, reduzindo a confusão e facilitando a compreensão\n• Cria soluções intuitivas, eficientes e satisfatórias, aplicando heurísticas de usabilidade e conhecimento de gatilhos e vieses comportamentais'
    },
    {
      category: 'TECNICA', code: '1.2', name: 'Design Visual & Prototipação', order_index: 2,
      description: '• Aplica os princípios de design (grade, cores, tipografia, espaçamento, composição) para criar propostas com alto nível de refino visual, emoção e satisfação, alinhadas aos mais altos padrões de mercado\n• Materializa fluxos em protótipos funcionais de diferentes fidelidades para validação e tangibilização\n• Cria micro-interações, animações, ícones e ilustrações que elevam a qualidade e a experiência do produto'
    },
    {
      category: 'TECNICA', code: '1.3', name: 'Design System & Componentização', order_index: 3,
      description: '• Constrói e mantém sistemas de design escaláveis, componentizando elementos e gerando tokens de forma organizada\n• Colabora com desenvolvedores para automatizar a camada visual e garantir consistência entre design e código\n• Pensa de forma modular e reutilizável, criando padrões que aceleram entregas futuras e garantem coerência entre produtos'
    },
    {
      category: 'TECNICA', code: '1.4', name: 'Qualidade Final & Entrega Técnica', order_index: 4,
      description: '• Compreende o funcionamento do frontend e realiza verificação de qualidade para garantir fidelidade entre design e implementação\n• Constrói fluxos de navegação abrangentes que contemplam todas as decisões, interações, caminhos alternativos, estados de erro e casos extremos\n• Garante a qualidade dos entregáveis finais e cria documentação de entrega técnica que dá clareza total aos desenvolvedores'
    },
    // Descoberta & Estratégia
    {
      category: 'DESCOBERTA', code: '2.1', name: 'Pesquisa & Compreensão do Usuário', order_index: 1,
      description: '• Define a abordagem metodológica adequada ao contexto, incluindo amostragem, recrutamento e preparação do ambiente de pesquisa\n• Garante o rigor na execução e a qualidade das informações coletadas, utilizando ferramentas de mercado apropriadas (Maze, UsabilityHub, GA, etc.)\n• Organiza informações de forma estruturada, documenta com boas práticas de operações de pesquisa e gera conclusões fundamentadas que impactam decisões'
    },
    {
      category: 'DESCOBERTA', code: '2.2', name: 'Análise & Triangulação de Dados', order_index: 2,
      description: '• Busca ativamente dados existentes no cliente e no mercado, integrando-os ao contexto da pesquisa em andamento\n• Cruza dados de diferentes fontes (quantitativo, qualitativo, comportamental) para aumentar a confiabilidade dos achados\n• Transforma análises em recomendações claras que contribuem diretamente nas tomadas de decisão do projeto'
    },
    {
      category: 'DESCOBERTA', code: '2.3', name: 'Mapeamento de Contexto & Jornadas', order_index: 3,
      description: '• Utiliza ferramentas para mapear cenários complexos, ecossistemas, dependências internas e externas (Mapa de Experiência, Blueprint, Jornada do Usuário, etc.)\n• Mapeia comportamentos humanos através de artefatos que guiam decisões, como Personas, Jobs To Be Done, Mapa de Empatia, Canvas de Proposta de Valor, etc.\n• Dá clareza sobre onde o projeto está atuando e como ele se conecta com o todo, facilitando alinhamento e priorização'
    },
    {
      category: 'DESCOBERTA', code: '2.4', name: 'Visão de Produto & Definição de Soluções', order_index: 4,
      description: '• Estimula e guia a construção de uma visão clara e unificada do projeto, alinhada a oportunidades de negócio, necessidades dos usuários e lacunas de experiência\n• Estrutura e prioriza hipóteses em backlog, equilibrando inovação, viabilidade e impacto no negócio\n• Utiliza ferramentas de direcionamento estratégico (OKRs, Árvore de Oportunidades, Canvas de UX, etc.) para fundamentar decisões'
    },
    // Colaboração & Influência
    {
      category: 'COLABORACAO', code: '3.1', name: 'Facilitação & Co-criação', order_index: 1,
      description: '• Planeja e conduz atividades com clareza de etapas, metodologias e objetivos\n• Prepara materiais de comunicação antes e após as sessões, documentando metodologias, embasamento técnico e resultados de forma clara\n• Controla a sala com técnicas de facilitação que equilibram tempo, engajamento e ânimos dos participantes'
    },
    {
      category: 'COLABORACAO', code: '3.2', name: 'Extração de Valor & Didática', order_index: 2,
      description: '• Extrai das dinâmicas materiais de alto nível (conclusões, direcionamentos, decisões) imprescindíveis para o avanço do projeto\n• Viabiliza a realização das dinâmicas, articulando agendas, locais, ferramentas e todo o material necessário\n• Transmite conhecimento durante as sessões, deixando claro o valor do design participativo e colaborativo'
    },
    {
      category: 'COLABORACAO', code: '3.3', name: 'Narrativa & Apresentação', order_index: 3,
      description: '• Planeja, estrutura e apresenta ideias de forma clara e convincente, inclusive para públicos de alta liderança\n• Articula o racional de design com evidências, dados e narrativa que conecta com os objetivos do negócio\n• Mobiliza e engaja pessoas em torno de uma visão comum, "vendendo o sonho" de forma inspiradora'
    },
    {
      category: 'COLABORACAO', code: '3.4', name: 'Evangelização & Mentoria', order_index: 4,
      description: '• Defende o design centrado no usuário como parte estratégica do negócio e dissemina boas práticas que elevam qualidade e impacto\n• Mapeia atividades, habilidades e perfis, ajudando pessoas a crescerem tecnicamente e pessoalmente\n• Inspira e capacita colegas, criando um ambiente que valoriza criatividade, aprendizado contínuo e inovação'
    },
    // Impacto & Liderança
    {
      category: 'IMPACTO', code: '4.1', name: 'Métricas & Decisões Baseadas em Dados', order_index: 1,
      description: '• Define métricas de sucesso para design e auxilia na análise de dados de uso e desempenho\n• Guia projetos centrados em dados, promovendo decisões baseadas em informações confiáveis\n• Gera conclusões e novas hipóteses a partir da análise contínua de resultados'
    },
    {
      category: 'IMPACTO', code: '4.2', name: 'Entendimento de Mercado & Negócio', order_index: 2,
      description: '• Compreende plenamente o mercado do cliente, identificando oportunidades e traduzindo-as em direcionamentos acionáveis\n• Utiliza ferramentas de análise competitiva, referências de mercado e estudos setoriais para fundamentar direcionamentos\n• Conecta decisões de design com objetivos comerciais, demonstrando sensibilidade ao contexto de negócio'
    },
    {
      category: 'IMPACTO', code: '4.3', name: 'Influência & Negociação', order_index: 3,
      description: '• Entende a cultura organizacional do cliente e a influencia para melhorias, promovendo o valor do design e da cultura ágil\n• Negocia e concilia interesses, encontrando caminhos possíveis para situações críticas e de alto risco\n• Influencia decisões estratégicas sem autoridade formal, construindo consenso através de argumentação sólida'
    },
    {
      category: 'IMPACTO', code: '4.4', name: 'Referência & Visibilidade', order_index: 4,
      description: '• É procurado pelo time, clientes e profissionais do mercado para aconselhamento técnico e estratégico\n• Cria ambientes onde o craft é valorizado e reconhecido, entendendo seu impacto direto no engajamento e satisfação do time\n• Atua em comunidades, podcasts, publicações e eventos relevantes, contribuindo para a construção de conhecimento interno e externo'
    },
    // IA & Design
    {
      category: 'IA', code: '5.1', name: 'IA como Ferramenta de Aceleração', order_index: 1,
      description: '• Utiliza IA generativa de forma estratégica para acelerar exploração, ideação e produção de artefatos de design, entendendo-a como catalisador para trabalhos de maior valor\n• Desenvolve comandos efetivos e refinados para extrair máximo valor das ferramentas de IA disponíveis\n• Aplica senso crítico na curadoria e refinamento de resultados de IA, garantindo qualidade e adequação ao contexto'
    },
    {
      category: 'IA', code: '5.2', name: 'Design para Produtos com IA', order_index: 2,
      description: '• Projeta interfaces conversacionais e experiências com IA embarcada de forma intuitiva e transparente\n• Gerencia expectativas do usuário sobre capacidades e limitações da IA, criando experiências honestas\n• Equilibra automação e controle do usuário, garantindo que a IA amplifique (e não substitua) a agência humana'
    },
    {
      category: 'IA', code: '5.3', name: 'Experimentação & Integração', order_index: 3,
      description: '• Demonstra curiosidade ativa, testando continuamente novas ferramentas e técnicas de IA aplicadas ao design\n• Avalia criticamente quando IA agrega valor real versus quando outras abordagens são mais adequadas\n• Integra IA de forma fluida nos fluxos de trabalho existentes, aumentando eficiência sem comprometer qualidade'
    },
    {
      category: 'IA', code: '5.4', name: 'Visão Crítica & Ética', order_index: 4,
      description: '• Compreende as limitações, vieses e riscos inerentes a sistemas de IA\n• Considera impactos éticos nas decisões de design que envolvem IA, advogando por transparência e confiança\n• Antecipa e mitiga riscos de experiências com IA, protegendo usuários e a reputação do produto'
    },
    // Mentalidade de Consultoria
    {
      category: 'CONSULTORIA', code: '6.1', name: 'Capacidade Política & Navegabilidade', order_index: 1,
      description: '• Navega em contextos organizacionais complexos, compreendendo pessoas, papéis, funções e dinâmicas de poder\n• Influencia partes interessadas e constrói alianças estratégicas para garantir que soluções sejam implementadas com impacto\n• Articula o valor do design em decisões estratégicas, equilibrando diferentes interesses de forma hábil'
    },
    {
      category: 'CONSULTORIA', code: '6.2', name: 'Gestão de Expectativas & Adaptabilidade', order_index: 2,
      description: '• Comunica de forma clara e realista sobre prazos, entregas, riscos e limitações\n• Compreende as necessidades de cada grupo atuante nos projetos e adapta abordagem conforme o contexto\n• Adapta-se rapidamente a diferentes setores, culturas organizacionais e dinâmicas de equipe'
    },
    {
      category: 'CONSULTORIA', code: '6.3', name: 'Fundamentação & Proposição', order_index: 3,
      description: '• Assume postura proativa e propositiva, demonstrando com clareza o racional e o valor esperado em cada ação\n• Embasa recomendações em dados, evidências e argumentação estruturada\n• Defende pontos de vista com convicção, mantendo abertura para ajustes baseados em novas informações'
    },
    {
      category: 'CONSULTORIA', code: '6.4', name: 'Perfil Empreendedor & Acionabilidade', order_index: 4,
      description: '• Identifica e atua em oportunidades que geram novo valor para o produto, cliente e/ou para a Levva\n• Analisa situações de forma estruturada, identifica os verdadeiros desafios e propõe soluções, comprometendo-se com a execução mesmo além do escopo formal\n• Garante que tudo que produz seja facilmente acionável, documentado nos meios corretos, com boas práticas de segurança, rastreabilidade e acessibilidade'
    },
    // Gestão & Operação
    {
      category: 'GESTAO', code: '7.1', name: 'Organização & Visibilidade de Projetos', order_index: 1,
      description: '• Organiza atividades e status nas ferramentas mais efetivas de acordo com o cliente (Confluence, Jira, Kanban, etc.)\n• Mantém visibilidade total e transparência do andamento para todos os envolvidos\n• Cria relatórios e comunicações que facilitam o alinhamento contínuo entre times e partes interessadas'
    },
    {
      category: 'GESTAO', code: '7.2', name: 'Repositórios & Compartilhamento de Conhecimento', order_index: 2,
      description: '• Cria padrões e estruturas que possibilitam reuso, acesso e compartilhamento de artefatos e conhecimentos\n• Reduz tempo operacional através de modelos, bibliotecas e processos bem documentados\n• Mantém repositórios organizados com nomenclatura clara, fácil navegação e governança adequada'
    },
    {
      category: 'GESTAO', code: '7.3', name: 'Processos & Fluxos de Trabalho', order_index: 3,
      description: '• Cria e organiza fluxos de trabalho coerentes com cada projeto, mantendo organização e versionamento adequados\n• Identifica gargalos operacionais e propõe melhorias contínuas nos processos de design\n• Garante que o conhecimento gerado nos projetos seja preservado e acessível para iniciativas futuras'
    },
    {
      category: 'GESTAO', code: '7.4', name: 'Design Inclusivo & Acessibilidade', order_index: 4,
      description: '• Garante que elementos visuais respeitem regras de acessibilidade (contraste, tamanhos, combinação de cores, etc.)\n• Levanta consistentemente a importância da linguagem inclusiva, eliminando passagens preconceituosas ou excludentes\n• Advoga por experiências que funcionem para todos os públicos, considerando diversidade de contextos e capacidades'
    },
  ];

  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (code, name, order_index) VALUES (?, ?, ?)');
  const insertPillar = db.prepare('INSERT OR IGNORE INTO pillars (category_id, code, name, description, order_index) VALUES (?, ?, ?, ?, ?)');
  const getCategoryId = db.prepare('SELECT id FROM categories WHERE code = ?');

  for (const cat of categories) {
    insertCategory.run(cat.code, cat.name, cat.order_index);
  }

  for (const pillar of pillars) {
    const cat = getCategoryId.get(pillar.category);
    if (cat) {
      insertPillar.run(cat.id, pillar.code, pillar.name, pillar.description, pillar.order_index);
    }
  }

  db.close();
  console.log('Database initialized and seeded.');
}

initDb();
module.exports = { getDb, initDb };
