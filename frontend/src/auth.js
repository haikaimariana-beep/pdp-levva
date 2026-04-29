// Prefixos (antes do @) que têm acesso à visão de liderança
const LEADER_PREFIXES = ['caio.lider', 'greg.lider', 'mariana']

export function isLeader(email = '') {
  const local = email.split('@')[0].toLowerCase()
  return LEADER_PREFIXES.some(prefix => local === prefix)
}
