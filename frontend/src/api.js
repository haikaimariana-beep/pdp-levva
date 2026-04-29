import { MOCK_USERS, getEvalsForEmail, getMockUser } from './mockData'

// ─── Estado em memória da sessão ──────────────────────────────────────────────
let sessionUser = null
// avaliações editadas na sessão atual (sobrescreve mock)
const sessionEvals = {}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email, name) {
  const user = getMockUser(email, name)
  sessionUser = user
  return { token: 'mock-token', user }
}

// ─── Pillars ──────────────────────────────────────────────────────────────────
const CATEGORIES_DATA = [
  { id:1, code:'TECNICA',     name:'Técnica e Execução',          order_index:1 },
  { id:2, code:'DESCOBERTA',  name:'Descoberta & Estratégia',     order_index:2 },
  { id:3, code:'COLABORACAO', name:'Colaboração & Influência',    order_index:3 },
  { id:4, code:'IMPACTO',     name:'Impacto & Liderança',         order_index:4 },
  { id:5, code:'IA',          name:'IA & Design',                 order_index:5 },
  { id:6, code:'CONSULTORIA', name:'Mentalidade de Consultoria',  order_index:6 },
  { id:7, code:'GESTAO',      name:'Gestão & Operação',           order_index:7 },
]

const PILLARS_DATA = [
  { id:1,  category_id:1, code:'1.1', name:'Arquitetura da Informação & Estruturação',   order_index:1, description:'Estrutura a arquitetura de informações considerando categorização, taxonomia, nomenclaturas e boas práticas de ergonomia e usabilidade\nOrganiza elementos de forma que as pessoas reconheçam instantaneamente sua ordem de importância em uma tela ou página\nCria soluções intuitivas, eficientes e satisfatórias, aplicando heurísticas de usabilidade e conhecimento de gatilhos comportamentais' },
  { id:2,  category_id:1, code:'1.2', name:'Design Visual & Prototipação',               order_index:2, description:'Aplica os princípios de design (grade, cores, tipografia, espaçamento, composição) para criar propostas com alto nível de refino visual\nMaterializa fluxos em protótipos funcionais de diferentes fidelidades para validação\nCria micro-interações, animações, ícones e ilustrações que elevam a qualidade e a experiência do produto' },
  { id:3,  category_id:1, code:'1.3', name:'Design System & Componentização',            order_index:3, description:'Constrói e mantém sistemas de design escaláveis, componentizando elementos e gerando tokens de forma organizada\nColabora com desenvolvedores para automatizar a camada visual e garantir consistência entre design e código\nPensa de forma modular e reutilizável, criando padrões que aceleram entregas futuras' },
  { id:4,  category_id:1, code:'1.4', name:'Qualidade Final & Entrega Técnica',          order_index:4, description:'Compreende o funcionamento do frontend e realiza verificação de qualidade para garantir fidelidade entre design e implementação\nConstrói fluxos de navegação abrangentes que contemplam todas as decisões, interações e casos extremos\nGarante a qualidade dos entregáveis finais e cria documentação de entrega técnica' },
  { id:5,  category_id:2, code:'2.1', name:'Pesquisa & Compreensão do Usuário',          order_index:1, description:'Define a abordagem metodológica adequada ao contexto, incluindo amostragem, recrutamento e preparação\nGarante o rigor na execução e a qualidade das informações coletadas, utilizando ferramentas de mercado apropriadas\nOrganiza informações de forma estruturada e gera conclusões fundamentadas que impactam decisões' },
  { id:6,  category_id:2, code:'2.2', name:'Análise & Triangulação de Dados',            order_index:2, description:'Busca ativamente dados existentes no cliente e no mercado, integrando-os ao contexto da pesquisa\nCruza dados de diferentes fontes (quantitativo, qualitativo, comportamental) para aumentar a confiabilidade dos achados\nTransforma análises em recomendações claras que contribuem diretamente nas tomadas de decisão' },
  { id:7,  category_id:2, code:'2.3', name:'Mapeamento de Contexto & Jornadas',          order_index:3, description:'Utiliza ferramentas para mapear cenários complexos, ecossistemas e dependências (Mapa de Experiência, Blueprint, Jornada)\nMapeia comportamentos humanos através de artefatos que guiam decisões: Personas, JTBD, Mapa de Empatia\nDá clareza sobre onde o projeto está atuando e como ele se conecta com o todo' },
  { id:8,  category_id:2, code:'2.4', name:'Visão de Produto & Definição de Soluções',   order_index:4, description:'Estimula e guia a construção de uma visão clara e unificada do projeto, alinhada a oportunidades de negócio\nEstrutura e prioriza hipóteses em backlog, equilibrando inovação, viabilidade e impacto\nUtiliza ferramentas de direcionamento estratégico (OKRs, Árvore de Oportunidades, Canvas de UX)' },
  { id:9,  category_id:3, code:'3.1', name:'Facilitação & Co-criação',                   order_index:1, description:'Planeja e conduz atividades com clareza de etapas, metodologias e objetivos\nPrepara materiais de comunicação antes e após as sessões, documentando metodologias e resultados\nControla a sala com técnicas de facilitação que equilibram tempo, engajamento e ânimos dos participantes' },
  { id:10, category_id:3, code:'3.2', name:'Extração de Valor & Didática',               order_index:2, description:'Extrai das dinâmicas materiais de alto nível imprescindíveis para o avanço do projeto\nViabiliza a realização das dinâmicas, articulando agendas, locais, ferramentas e materiais\nTransmite conhecimento durante as sessões, deixando claro o valor do design participativo' },
  { id:11, category_id:3, code:'3.3', name:'Narrativa & Apresentação',                   order_index:3, description:'Planeja, estrutura e apresenta ideias de forma clara e convincente, inclusive para alta liderança\nArticula o racional de design com evidências, dados e narrativa que conecta com os objetivos do negócio\nMobiliza e engaja pessoas em torno de uma visão comum' },
  { id:12, category_id:3, code:'3.4', name:'Evangelização & Mentoria',                   order_index:4, description:'Defende o design centrado no usuário como parte estratégica do negócio\nMapeia atividades, habilidades e perfis, ajudando pessoas a crescerem tecnicamente e pessoalmente\nInspira e capacita colegas, criando um ambiente que valoriza criatividade e aprendizado contínuo' },
  { id:13, category_id:4, code:'4.1', name:'Métricas & Decisões Baseadas em Dados',      order_index:1, description:'Define métricas de sucesso para design e auxilia na análise de dados de uso e desempenho\nGuia projetos centrados em dados, promovendo decisões baseadas em informações confiáveis\nGera conclusões e novas hipóteses a partir da análise contínua de resultados' },
  { id:14, category_id:4, code:'4.2', name:'Entendimento de Mercado & Negócio',          order_index:2, description:'Compreende plenamente o mercado do cliente, identificando oportunidades e traduzindo-as em ações\nUtiliza ferramentas de análise competitiva, referências de mercado e estudos setoriais\nConecta decisões de design com objetivos comerciais' },
  { id:15, category_id:4, code:'4.3', name:'Influência & Negociação',                    order_index:3, description:'Entende a cultura organizacional do cliente e a influencia para melhorias\nNegocia e concilia interesses, encontrando caminhos possíveis para situações críticas\nInfluencia decisões estratégicas sem autoridade formal' },
  { id:16, category_id:4, code:'4.4', name:'Referência & Visibilidade',                  order_index:4, description:'É procurado pelo time, clientes e profissionais do mercado para aconselhamento técnico\nCria ambientes onde o craft é valorizado e reconhecido\nAtua em comunidades, podcasts, publicações e eventos relevantes' },
  { id:17, category_id:5, code:'5.1', name:'IA como Ferramenta de Aceleração',           order_index:1, description:'Utiliza IA generativa de forma estratégica para acelerar exploração, ideação e produção\nDesenvolve comandos efetivos e refinados para extrair máximo valor das ferramentas de IA\nAplica senso crítico na curadoria e refinamento de resultados de IA' },
  { id:18, category_id:5, code:'5.2', name:'Design para Produtos com IA',                order_index:2, description:'Projeta interfaces conversacionais e experiências com IA embarcada de forma intuitiva\nGerencia expectativas do usuário sobre capacidades e limitações da IA\nEquilibra automação e controle do usuário' },
  { id:19, category_id:5, code:'5.3', name:'Experimentação & Integração',                order_index:3, description:'Demonstra curiosidade ativa, testando continuamente novas ferramentas de IA\nAvalia criticamente quando IA agrega valor real versus outras abordagens\nIntegra IA de forma fluida nos fluxos de trabalho existentes' },
  { id:20, category_id:5, code:'5.4', name:'Visão Crítica & Ética',                      order_index:4, description:'Compreende as limitações, vieses e riscos inerentes a sistemas de IA\nConsidera impactos éticos nas decisões de design que envolvem IA\nAntecipa e mitiga riscos de experiências com IA' },
  { id:21, category_id:6, code:'6.1', name:'Capacidade Política & Navegabilidade',       order_index:1, description:'Navega em contextos organizacionais complexos, compreendendo pessoas, papéis e dinâmicas de poder\nInfluencia partes interessadas e constrói alianças estratégicas\nArticula o valor do design em decisões estratégicas' },
  { id:22, category_id:6, code:'6.2', name:'Gestão de Expectativas & Adaptabilidade',    order_index:2, description:'Comunica de forma clara e realista sobre prazos, entregas, riscos e limitações\nCompreende as necessidades de cada grupo atuante nos projetos\nAdapta-se rapidamente a diferentes setores e culturas organizacionais' },
  { id:23, category_id:6, code:'6.3', name:'Fundamentação & Proposição',                 order_index:3, description:'Assume postura proativa e propositiva, demonstrando o racional e valor esperado em cada ação\nEmbasa recomendações em dados, evidências e argumentação estruturada\nDefende pontos de vista com convicção, mantendo abertura para ajustes' },
  { id:24, category_id:6, code:'6.4', name:'Perfil Empreendedor & Acionabilidade',       order_index:4, description:'Identifica e atua em oportunidades que geram novo valor para o produto, cliente e/ou Levva\nAnalisa situações de forma estruturada e propõe soluções comprometendo-se com a execução\nGarante que tudo que produz seja acionável, documentado com boas práticas' },
  { id:25, category_id:7, code:'7.1', name:'Organização & Visibilidade de Projetos',     order_index:1, description:'Organiza atividades e status nas ferramentas mais efetivas (Confluence, Jira, Kanban)\nMantém visibilidade total e transparência do andamento para todos os envolvidos\nCria relatórios e comunicações que facilitam o alinhamento contínuo' },
  { id:26, category_id:7, code:'7.2', name:'Repositórios & Compartilhamento de Conhecimento', order_index:2, description:'Cria padrões e estruturas que possibilitam reuso, acesso e compartilhamento de conhecimentos\nReduz tempo operacional através de modelos, bibliotecas e processos bem documentados\nMantém repositórios organizados com nomenclatura clara e governança adequada' },
  { id:27, category_id:7, code:'7.3', name:'Processos & Fluxos de Trabalho',             order_index:3, description:'Cria e organiza fluxos de trabalho coerentes com cada projeto\nIdentifica gargalos operacionais e propõe melhorias contínuas\nGarante que o conhecimento gerado seja preservado e acessível' },
  { id:28, category_id:7, code:'7.4', name:'Design Inclusivo & Acessibilidade',          order_index:4, description:'Garante que elementos visuais respeitem regras de acessibilidade (contraste, tamanhos, cores)\nLevanta consistentemente a importância da linguagem inclusiva\nAdvoga por experiências que funcionem para todos os públicos' },
]

export async function getPillars() {
  return CATEGORIES_DATA.map(cat => ({
    ...cat,
    pillars: PILLARS_DATA.filter(p => p.category_id === cat.id)
  }))
}

// ─── Evaluations ──────────────────────────────────────────────────────────────
export async function getEvaluations() {
  const user = JSON.parse(localStorage.getItem('pdp_user') || '{}')
  const base = getEvalsForEmail(user.email)
  const overrides = sessionEvals[user.email] || {}
  return base.map(e => ({ ...e, ...(overrides[e.pillar_id] || {}) }))
    .concat(
      Object.entries(overrides)
        .filter(([pid]) => !base.find(e => e.pillar_id === Number(pid)))
        .map(([pid, data]) => ({ pillar_id: Number(pid), ...data }))
    )
}

export async function saveEvaluation(pillar_id, score, evidence, goal) {
  const user = JSON.parse(localStorage.getItem('pdp_user') || '{}')
  if (!sessionEvals[user.email]) sessionEvals[user.email] = {}
  sessionEvals[user.email][pillar_id] = { score, evidence, goal }
  return { pillar_id, score, evidence, goal }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboard() {
  const evals = await getEvaluations()
  const evalMap = {}
  evals.forEach(e => { evalMap[e.pillar_id] = e })

  const categories = CATEGORIES_DATA.map(cat => {
    const catPillars = PILLARS_DATA.filter(p => p.category_id === cat.id)
    const scores = catPillars.map(p => evalMap[p.id]?.score || 0).filter(s => s > 0)
    const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0
    return {
      ...cat,
      avg,
      completed: scores.length,
      total: catPillars.length,
      pillars: catPillars.map(p => ({ ...p, evaluation: evalMap[p.id] || null }))
    }
  })

  return {
    categories,
    totalPillars: PILLARS_DATA.length,
    completedPillars: evals.length
  }
}

// ─── Leader ───────────────────────────────────────────────────────────────────
function buildUserStats(userEmail) {
  const base = getEvalsForEmail(userEmail)
  const overrides = sessionEvals[userEmail] || {}
  const evals = base.map(e => ({ ...e, ...(overrides[e.pillar_id] || {}) }))
  const evalMap = {}
  evals.forEach(e => { evalMap[e.pillar_id] = e })

  const catAvgs = CATEGORIES_DATA.map(cat => {
    const catPillars = PILLARS_DATA.filter(p => p.category_id === cat.id)
    const scores = catPillars.map(p => evalMap[p.id]?.score || 0).filter(s => s > 0)
    return scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null
  })

  const allScores = evals.map(e => e.score)
  const globalAvg = allScores.length ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10 : 0

  return { evals, evalMap, catAvgs, globalAvg }
}

export async function getLeaderUsers() {
  return MOCK_USERS.map(u => {
    const { evals, globalAvg } = buildUserStats(u.email)
    return {
      ...u,
      completed: evals.length,
      total: PILLARS_DATA.length,
      avg: globalAvg,
    }
  })
}

export async function getLeaderUser(userId) {
  const user = MOCK_USERS.find(u => u.id === Number(userId))
  if (!user) return null
  const { evalMap } = buildUserStats(user.email)

  const categories = CATEGORIES_DATA.map(cat => {
    const catPillars = PILLARS_DATA.filter(p => p.category_id === cat.id)
    const scores = catPillars.map(p => evalMap[p.id]?.score || 0).filter(s => s > 0)
    const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0
    return {
      ...cat,
      avg,
      completed: scores.length,
      total: catPillars.length,
      pillars: catPillars.map(p => ({ ...p, evaluation: evalMap[p.id] || null }))
    }
  })

  const allEvals = Object.values(evalMap)
  return { user, categories, totalPillars: PILLARS_DATA.length, completedPillars: allEvals.length }
}

export async function getLeaderTeam() {
  const allEvalsByUser = MOCK_USERS.map(u => {
    const { evalMap } = buildUserStats(u.email)
    return { user: u, evalMap }
  })

  const pillarStats = PILLARS_DATA.map(p => {
    const scores = allEvalsByUser.map(({ evalMap }) => evalMap[p.id]?.score).filter(Boolean)
    const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0
    const dist = [1, 2, 3, 4, 5].map(n => scores.filter(s => s === n).length)
    return { ...p, avg, dist, respondents: scores.length }
  })

  const categories = CATEGORIES_DATA.map(cat => {
    const catPillars = pillarStats.filter(p => p.category_id === cat.id)
    const allScores = catPillars.flatMap(p => {
      const s = allEvalsByUser.flatMap(({ evalMap }) => evalMap[p.id]?.score ? [evalMap[p.id].score] : [])
      return s
    })
    const avg = allScores.length ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10 : 0
    return { ...cat, avg, pillars: catPillars }
  })

  const designers = MOCK_USERS.map(u => {
    const { evalMap, catAvgs, globalAvg } = buildUserStats(u.email)
    return {
      id: u.id, name: u.name, email: u.email,
      catAvgs,
      globalAvg,
      completed: Object.keys(evalMap).length,
      total: PILLARS_DATA.length,
    }
  })

  return { categories, designers, totalPillars: PILLARS_DATA.length }
}
