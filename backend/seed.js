/**
 * seed.js — Popula o banco com 7 designers e suas avaliações
 * Uso: node seed.js
 */

const { getDb } = require('./database')

const DESIGNERS = [
  { email: 'mariana@levva.io',  name: 'Mariana Thomaz'   },
  { email: 'lucas@levva.io',    name: 'Lucas Ferreira'   },
  { email: 'ana@levva.io',      name: 'Ana Paula Santos' },
  { email: 'rafael@levva.io',   name: 'Rafael Oliveira'  },
  { email: 'camila@levva.io',   name: 'Camila Costa'     },
  { email: 'bruno@levva.io',    name: 'Bruno Mendes'     },
  { email: 'julia@levva.io',    name: 'Julia Rodrigues'  },
]

// Avaliações por designer: pillar_id (1-28) → { score, evidence?, goal? }
const EVALUATIONS = {
  'mariana@levva.io': {
    1:  { score: 4, evidence: 'Reestruturei a IA do app de pagamentos, aumentando a conclusão de tarefas em 23%.', goal: 'Aprofundar em taxonomias para produtos financeiros complexos.' },
    2:  { score: 4, evidence: 'Liderei o redesign do onboarding com protótipos de alta fidelidade no Figma.' },
    3:  { score: 4, evidence: 'Mantemos um DS com 80+ componentes usados por 3 produtos simultaneamente.' },
    4:  { score: 3, goal: 'Melhorar minha documentação de handoff com mais especificações de estados.' },
    5:  { score: 4, evidence: 'Conduzi 12 entrevistas com usuários e 2 testes de usabilidade no último trimestre.' },
    6:  { score: 3, evidence: 'Cruzei dados do GA4 com entrevistas qualitativas para validar hipóteses de abandono.' },
    7:  { score: 4, evidence: 'Criei journey maps completos para 3 perfis de usuário distintos.' },
    8:  { score: 3, goal: 'Desenvolver mais habilidade em Árvore de Oportunidades e OKRs de produto.' },
    9:  { score: 4, evidence: 'Facilitei workshops de kick-off e ideação com times de 15+ pessoas.' },
    10: { score: 4, evidence: 'Extraí decisões claras e acionáveis de todas as sessões colaborativas.' },
    11: { score: 5, evidence: 'Apresentei resultados de pesquisa para C-level, recebendo aprovação e budget.' },
    12: { score: 3, goal: 'Estruturar programa de mentoria formal para designers júnior.' },
    13: { score: 3, evidence: 'Defini North Star Metric e KPIs para o produto de crédito.' },
    14: { score: 3, evidence: 'Fiz análise competitiva de 8 concorrentes no setor fintech.' },
    15: { score: 4, evidence: 'Negociei escopo com stakeholders preservando qualidade do design.' },
    16: { score: 3, goal: 'Aumentar presença externa: artigos e palestras em eventos de design.' },
    17: { score: 4, evidence: 'Uso diário de IA para geração de variações e aceleração de exploração.' },
    18: { score: 3, evidence: 'Projetei fluxo de onboarding conversacional para produto com IA embarcada.' },
    19: { score: 4, evidence: 'Testo novas ferramentas de IA mensalmente e compartilho aprendizados com o time.' },
    20: { score: 3, goal: 'Aprofundar conhecimento em ética e vieses algorítmicos.' },
    21: { score: 4, evidence: 'Navego bem nas dinâmicas políticas do cliente, construindo alianças com PMs e devs.' },
    22: { score: 4, evidence: 'Gerencio expectativas com transparência, comunicando riscos proativamente.' },
    23: { score: 4, evidence: 'Fundamento todas as recomendações com dados e evidências de pesquisa.' },
    24: { score: 3, goal: 'Desenvolver mais visão de negócio para identificar oportunidades além do escopo.' },
    25: { score: 4, evidence: 'Uso Jira e Confluence para manter visibilidade total do andamento do projeto.' },
    26: { score: 4, evidence: 'Criei biblioteca de componentes e templates reutilizáveis no Figma.' },
    27: { score: 3, evidence: 'Organizei versionamento de arquivos Figma com nomenclatura padronizada.' },
    28: { score: 3, goal: 'Aprofundar aplicação de WCAG 2.1 AA nos produtos que atuo.' },
  },
  'lucas@levva.io': {
    1:  { score: 3, evidence: 'Reestruturei a navegação de um dashboard B2B, reduzindo cliques por tarefa.' },
    2:  { score: 5, evidence: 'Reconhecido pelo time por protótipos com alto nível de refino visual e animações.' },
    3:  { score: 4, evidence: 'Contribuo ativamente para o DS, criando novos componentes com documentação.' },
    4:  { score: 4, evidence: 'Realizo QA rigoroso de implementação, apontando desvios com precisão.' },
    5:  { score: 2, goal: 'Desenvolver mais habilidade em planejamento e execução de pesquisas com usuários.' },
    6:  { score: 2, goal: 'Aprender a triangular dados quantitativos e qualitativos com mais confiança.' },
    7:  { score: 3, evidence: 'Criei personas básicas para o projeto de e-commerce.' },
    8:  { score: 2, goal: 'Aprofundar em definição de visão de produto e backlog de hipóteses.' },
    9:  { score: 3, evidence: 'Facilito dinâmicas de ideação com equipes pequenas.' },
    10: { score: 3, evidence: 'Organizo bem os outputs das dinâmicas em documentos claros.' },
    11: { score: 4, evidence: 'Apresentações com storytelling visual muito elogiadas pela liderança.' },
    12: { score: 2, goal: 'Começar a mentorar designers mais júniors com encontros regulares.' },
    13: { score: 2, goal: 'Aprender a definir e monitorar métricas de sucesso para minhas entregas.' },
    14: { score: 3, evidence: 'Pesquiso referências de mercado e concorrentes como base para projetos.' },
    15: { score: 3, evidence: 'Defendo minhas decisões de design com argumentação embasada.' },
    16: { score: 2, goal: 'Publicar artigos sobre design no Medium e participar de eventos.' },
    17: { score: 5, evidence: 'Power user de ferramentas de IA: Midjourney, Runway, ChatGPT para exploração.' },
    18: { score: 3, evidence: 'Tenho explorado interfaces conversacionais em projetos pessoais.' },
    19: { score: 5, evidence: 'Sempre o primeiro a testar e divulgar novas ferramentas de IA no time.' },
    20: { score: 3, evidence: 'Aplico senso crítico na curadoria de outputs de IA.' },
    21: { score: 3, evidence: 'Construo bons relacionamentos com stakeholders no dia a dia.' },
    22: { score: 3, evidence: 'Comunico prazos e limitações de forma clara com o cliente.' },
    23: { score: 3, evidence: 'Embaso escolhas de design com referências e princípios sólidos.' },
    24: { score: 3, evidence: 'Identifico oportunidades de melhoria além do escopo quando relevante.' },
    25: { score: 3, evidence: 'Mantenho Figma organizado e uso Notion para documentação.' },
    26: { score: 4, evidence: 'Criei padrões de arquivos que o time adotou como referência.' },
    27: { score: 4, evidence: 'Processos de entrega bem estruturados, com versionamento consistente.' },
    28: { score: 3, evidence: 'Reviso contraste e acessibilidade nos designs antes de entregar.' },
  },
  'ana@levva.io': {
    1:  { score: 4, evidence: 'Especialista em taxonomia: reestruturei a IA de dois produtos de saúde digital.' },
    2:  { score: 3, evidence: 'Entrego protótipos funcionais com clareza de fluxo e consistência visual.' },
    3:  { score: 3, evidence: 'Colaboro bem com devs no DS, mas ainda estou desenvolvendo visão de tokens.' },
    4:  { score: 4, evidence: 'Minha documentação técnica é referência de clareza para os times de dev.' },
    5:  { score: 5, evidence: 'Conduzi 20+ sessões de pesquisa qualitativa no último semestre. Certificada em UX Research.' },
    6:  { score: 5, evidence: 'Especialidade em triangulação: crosstabs, análise de sentimento e dados de uso.' },
    7:  { score: 5, evidence: 'Blueprints e journey maps de alta complexidade reconhecidos pelo cliente.' },
    8:  { score: 4, evidence: 'Facilito sessões de visão de produto e ajudo PMs a estruturar backlogs.' },
    9:  { score: 4, evidence: 'Facilitação estruturada com metodologias bem documentadas e aplicadas.' },
    10: { score: 4, evidence: 'Extraio insights estratégicos relevantes de todas as dinâmicas.' },
    11: { score: 3, goal: 'Desenvolver mais confiança em apresentações para alta liderança.' },
    12: { score: 4, evidence: 'Mentoro 2 designers júniors no time, com sessões semanais.' },
    13: { score: 4, evidence: 'Defino e monitoro métricas de research que guiam decisões de produto.' },
    14: { score: 4, evidence: 'Análises de mercado aprofundadas que geram valor estratégico para o cliente.' },
    15: { score: 3, evidence: 'Defendo a importância do research em negociações sobre escopo e prazo.' },
    16: { score: 4, evidence: 'Palestrante em 3 eventos de UX Research no último ano.' },
    17: { score: 3, evidence: 'Uso IA para acelerar síntese de pesquisa e transcrição de entrevistas.' },
    18: { score: 2, goal: 'Aprofundar em design para produtos que incorporam IA como feature central.' },
    19: { score: 3, evidence: 'Exploro ferramentas de análise de dados com IA para research.' },
    20: { score: 4, evidence: 'Considero ética e vieses algorítmicos nas pesquisas que conduzo.' },
    21: { score: 3, evidence: 'Navego bem nas dinâmicas políticas, com foco em construir confiança.' },
    22: { score: 4, evidence: 'Muito transparente sobre limitações e escopo da pesquisa.' },
    23: { score: 5, evidence: 'Todas as recomendações embasadas em evidências robustas e dados confiáveis.' },
    24: { score: 3, goal: 'Desenvolver mais visão empreendedora para identificar oportunidades de negócio.' },
    25: { score: 4, evidence: 'Repositório de pesquisas organizado e acessível para todo o time.' },
    26: { score: 4, evidence: 'Templates de research reutilizados por todo o time de design.' },
    27: { score: 3, evidence: 'Processos bem documentados, com áreas de melhoria em automação.' },
    28: { score: 4, evidence: 'Advogo consistentemente por acessibilidade e linguagem inclusiva.' },
  },
  'rafael@levva.io': {
    1:  { score: 3, evidence: 'Estruturo bem IAs para produtos B2C com foco em usabilidade.' },
    2:  { score: 3, evidence: 'Entrego designs com qualidade visual consistente.' },
    3:  { score: 2, goal: 'Me aprofundar em design systems e contribuir mais ativamente.' },
    4:  { score: 3, evidence: 'Entrego handoffs completos com atenção aos estados e fluxos.' },
    5:  { score: 3, evidence: 'Participo de pesquisas como suporte, com crescente autonomia na execução.' },
    6:  { score: 3, evidence: 'Começo a integrar dados quantitativos nas minhas análises.' },
    7:  { score: 4, evidence: 'Crio jornadas detalhadas para entender contextos complexos de uso.' },
    8:  { score: 3, evidence: 'Colaboro na definição de hipóteses e contribuo para o backlog.' },
    9:  { score: 3, evidence: 'Facilito dinâmicas com apoio de designers sênior.' },
    10: { score: 3, evidence: 'Extraio conclusões relevantes das dinâmicas que participo.' },
    11: { score: 3, evidence: 'Apresento com clareza para equipes de projeto.' },
    12: { score: 2, goal: 'Começar a compartilhar mais conhecimento formalmente com o time.' },
    13: { score: 2, goal: 'Aprender a definir e trabalhar com métricas de produto.' },
    14: { score: 3, evidence: 'Pesquiso concorrentes e tendências de forma consistente.' },
    15: { score: 3, evidence: 'Defendo decisões de design com bom embasamento técnico.' },
    16: { score: 2, goal: 'Aumentar visibilidade no mercado de design.' },
    17: { score: 3, evidence: 'Uso IA para acelerar exploração visual e geração de conteúdo.' },
    18: { score: 2, goal: 'Aprender mais sobre design de interfaces com IA embarcada.' },
    19: { score: 3, evidence: 'Experimento novas ferramentas de IA regularmente.' },
    20: { score: 2, goal: 'Desenvolver visão crítica sobre ética em sistemas de IA.' },
    21: { score: 3, evidence: 'Construo bons relacionamentos com stakeholders no cliente.' },
    22: { score: 3, evidence: 'Comunico limitações e riscos com clareza.' },
    23: { score: 3, evidence: 'Fundamento escolhas com referências e dados.' },
    24: { score: 2, goal: 'Desenvolver postura mais proativa e empreendedora no projeto.' },
    25: { score: 3, evidence: 'Organizo bem os arquivos e uso as ferramentas padrão do time.' },
    26: { score: 3, evidence: 'Contribuo para repositórios compartilhados.' },
    27: { score: 3, evidence: 'Sigo os fluxos de trabalho estabelecidos com consistência.' },
    28: { score: 2, goal: 'Aprofundar conhecimento em acessibilidade e aplicação de WCAG.' },
  },
  'camila@levva.io': {
    1:  { score: 5, evidence: 'Referência no time em IA e taxonomia. Conduzi auditoria de IA em sistema legado complexo.' },
    2:  { score: 4, evidence: 'Design visual de alta qualidade, com foco em micro-interações e animações.' },
    3:  { score: 5, evidence: 'Arquiteta e mantenho o DS principal da levva, com mais de 200 componentes.' },
    4:  { score: 4, evidence: 'Processo de QA rigoroso com checklists e automações no Figma.' },
    5:  { score: 4, evidence: 'Conduzo pesquisas de forma independente e estruturada.' },
    6:  { score: 4, evidence: 'Integro dados de múltiplas fontes para construir narrativas de insight.' },
    7:  { score: 4, evidence: 'Blueprints completos com mapeamento de sistemas e dependências.' },
    8:  { score: 4, evidence: 'Co-crio visão de produto com PMs e engenharia de forma estruturada.' },
    9:  { score: 5, evidence: 'Facilitadora certificada. Conduzo workshops complexos com excelência.' },
    10: { score: 5, evidence: 'Extraio insights de alto nível que guiam estratégias de produto.' },
    11: { score: 4, evidence: 'Apresentações claras e impactantes para diferentes audiências.' },
    12: { score: 5, evidence: 'Programa de mentoria estruturado para 4 designers. Referência no time.' },
    13: { score: 4, evidence: 'Defino e monitoro métricas de design alinhadas com OKRs de produto.' },
    14: { score: 5, evidence: 'Análises de mercado aprofundadas que influenciam roadmap do produto.' },
    15: { score: 4, evidence: 'Negocio com eficácia, construindo consenso mesmo em situações críticas.' },
    16: { score: 4, evidence: 'Referência interna e externa: artigos, palestras, mentorias externas.' },
    17: { score: 4, evidence: 'Uso estratégico de IA para acelerar e elevar qualidade das entregas.' },
    18: { score: 4, evidence: 'Projetei 3 produtos com features de IA embarcada no último ano.' },
    19: { score: 5, evidence: 'Lidero a iniciativa de IA no time de design da levva.' },
    20: { score: 4, evidence: 'Defendo ativamente práticas éticas no uso de IA em produtos.' },
    21: { score: 5, evidence: 'Navego com maestria em contextos políticos complexos, construindo alianças estratégicas.' },
    22: { score: 4, evidence: 'Gestão de expectativas impecável, reconhecida por clientes e liderança.' },
    23: { score: 5, evidence: 'Todas as recomendações fundamentadas em dados, frameworks e argumentação sólida.' },
    24: { score: 4, evidence: 'Perfil empreendedor: identifico e capturo oportunidades além do escopo.' },
    25: { score: 5, evidence: 'Criou o padrão de organização de projetos adotado por todo o time.' },
    26: { score: 5, evidence: 'Repositório de conhecimento referenciado como modelo pela liderança.' },
    27: { score: 4, evidence: 'Fluxos de trabalho bem estruturados e documentados para o time.' },
    28: { score: 5, evidence: 'Campeã de acessibilidade: auditorias regulares e treinamentos para o time.' },
  },
  'bruno@levva.io': {
    1:  { score: 2, goal: 'Aprofundar em heurísticas de usabilidade e ergonomia.' },
    2:  { score: 3, evidence: 'Entregas com boa qualidade visual, em evolução constante.' },
    3:  { score: 2, goal: 'Contribuir mais ativamente para o DS com componentes e documentação.' },
    4:  { score: 2, goal: 'Melhorar a abrangência dos fluxos de navegação nas entregas.' },
    5:  { score: 2, goal: 'Aprender a planejar e executar pesquisas com mais independência.' },
    6:  { score: 2, goal: 'Desenvolver habilidade de triangular dados de fontes diferentes.' },
    7:  { score: 2, goal: 'Criar jornadas de usuário mais completas e mapeamentos de contexto.' },
    8:  { score: 2, goal: 'Participar mais ativamente na definição de hipóteses e visão de produto.' },
    9:  { score: 2, goal: 'Aprender técnicas de facilitação para conduzir dinâmicas com mais confiança.' },
    10: { score: 3, evidence: 'Organizo bem os materiais após as dinâmicas que participo.' },
    11: { score: 2, goal: 'Desenvolver habilidade de storytelling e apresentação para stakeholders.' },
    12: { score: 1, goal: 'Começar a compartilhar conhecimento formalmente com colegas.' },
    13: { score: 2, goal: 'Aprender a definir e acompanhar métricas de produto.' },
    14: { score: 2, goal: 'Desenvolver mais conhecimento sobre o mercado e contexto de negócio.' },
    15: { score: 2, goal: 'Desenvolver mais confiança na defesa de decisões de design.' },
    16: { score: 1, goal: 'Começar a construir presença no mercado de design.' },
    17: { score: 4, evidence: 'Entusiasta de IA: uso ferramentas diariamente para acelerar trabalho.' },
    18: { score: 2, goal: 'Aprender sobre design para produtos com IA embarcada.' },
    19: { score: 4, evidence: 'Sempre testando novas ferramentas e compartilhando no slack do time.' },
    20: { score: 2, goal: 'Desenvolver visão crítica sobre limitações e ética em IA.' },
    21: { score: 2, goal: 'Desenvolver mais habilidade de navegar em contextos políticos complexos.' },
    22: { score: 3, evidence: 'Comunico com transparência sobre prazos e dificuldades.' },
    23: { score: 2, goal: 'Desenvolver postura mais propositiva e fundamentada nas recomendações.' },
    24: { score: 2, goal: 'Desenvolver perfil mais empreendedor, identificando oportunidades.' },
    25: { score: 3, evidence: 'Mantenho arquivos organizados e sigo padrões do time.' },
    26: { score: 2, goal: 'Contribuir para repositórios de conhecimento compartilhados.' },
    27: { score: 2, goal: 'Desenvolver fluxos de trabalho mais estruturados.' },
    28: { score: 3, evidence: 'Aplico checklist de acessibilidade básico nas entregas.' },
  },
  'julia@levva.io': {
    1:  { score: 4, evidence: 'Excelente em estruturar IAs para produtos complexos B2B.' },
    2:  { score: 5, evidence: 'Reconhecida como referência em design visual e prototipação no time.' },
    3:  { score: 4, evidence: 'Contribuição significativa para o DS com novos padrões e automações.' },
    4:  { score: 4, evidence: 'QA e handoff exemplares, com zero retrabalho de implementação.' },
    5:  { score: 3, evidence: 'Conduzo pesquisas com usuários com apoio metodológico.' },
    6:  { score: 4, evidence: 'Integro dados qualitativos e quantitativos com desenvoltura.' },
    7:  { score: 4, evidence: 'Mapas de jornada ricos e blueprints completos são meu diferencial.' },
    8:  { score: 3, evidence: 'Colaboro bem na definição de visão de produto com times de produto.' },
    9:  { score: 4, evidence: 'Facilitação criativa e engajadora, com ótima gestão de energia da sala.' },
    10: { score: 4, evidence: 'Extraio valor estratégico das dinâmicas com consistência.' },
    11: { score: 5, evidence: 'Melhor apresentadora do time: narrativa, design de slides e oratória.' },
    12: { score: 3, evidence: 'Compartilho conhecimento informalmente com o time.' },
    13: { score: 3, evidence: 'Trabalho com métricas de design com apoio do time de produto.' },
    14: { score: 4, evidence: 'Análise competitiva aprofundada como input para projetos.' },
    15: { score: 4, evidence: 'Negocio com equilíbrio e construo consenso em situações difíceis.' },
    16: { score: 4, evidence: 'Referência no Instagram de design: 5k seguidores, artigos no Medium.' },
    17: { score: 4, evidence: 'Uso criativo e estratégico de IA para exploração e produção.' },
    18: { score: 3, evidence: 'Projetei interfaces com IA em 2 projetos no último ano.' },
    19: { score: 4, evidence: 'Lidero sessões mensais de experimentação com IA no time.' },
    20: { score: 3, evidence: 'Considero ética e limitações nas decisões de design com IA.' },
    21: { score: 4, evidence: 'Habilidade política reconhecida: construo alianças eficazes.' },
    22: { score: 4, evidence: 'Gestão de expectativas impecável, com comunicação proativa.' },
    23: { score: 4, evidence: 'Recomendações sempre fundamentadas com dados e storytelling.' },
    24: { score: 3, evidence: 'Identifico oportunidades além do escopo e proponho ações.' },
    25: { score: 4, evidence: 'Organização exemplar em Figma e nas ferramentas de PM.' },
    26: { score: 4, evidence: 'Biblioteca de recursos compartilhados referenciada pelo time.' },
    27: { score: 4, evidence: 'Fluxos bem definidos e documentados para todos os projetos.' },
    28: { score: 4, evidence: 'Defendo acessibilidade ativamente e faço auditorias nos projetos.' },
  },
}

function seed() {
  const db = getDb()

  console.log('🌱 Iniciando seed dos designers...')

  const insertUser = db.prepare('INSERT OR IGNORE INTO users (email, name) VALUES (?, ?)')
  const getUser = db.prepare('SELECT id FROM users WHERE email = ?')
  const getPillar = db.prepare('SELECT id FROM pillars ORDER BY id')
  const upsertEval = db.prepare(`
    INSERT INTO evaluations (user_id, pillar_id, score, evidence, goal)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, pillar_id) DO UPDATE SET
      score = excluded.score,
      evidence = excluded.evidence,
      goal = excluded.goal,
      updated_at = CURRENT_TIMESTAMP
  `)

  const pillars = getPillar.all()

  for (const designer of DESIGNERS) {
    insertUser.run(designer.email, designer.name)
    const user = getUser.get(designer.email)
    const evals = EVALUATIONS[designer.email] || {}

    let count = 0
    for (const pillar of pillars) {
      const e = evals[pillar.id]
      if (e) {
        upsertEval.run(user.id, pillar.id, e.score, e.evidence || null, e.goal || null)
        count++
      }
    }

    console.log(`  ✅ ${designer.name}: ${count} avaliações inseridas`)
  }

  db.close()
  console.log('\n✨ Seed concluído com sucesso!')
}

seed()
