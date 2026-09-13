import { API_URL_VAR, KEYCLOAK_URL_VAR, resolveEnvironment } from './global.constants'

const VALID_API = 'https://api-exemple.minuseek.fr/api'
const VALID_KEYCLOAK = 'https://auth-exemple.minuseek.fr'

/** Entrée de résolution : par défaut un build autonome correctement configuré. */
function input(overrides: Partial<Parameters<typeof resolveEnvironment>[0]> = {}) {
  return {
    apiUrl: VALID_API,
    keycloakUrl: VALID_KEYCLOAK,
    metroHost: undefined,
    isDev: false,
    ...overrides,
  }
}

describe('resolveEnvironment — en développement', () => {
  it('déduit les deux URL de l’hôte qui sert Metro quand rien n’est renseigné', () => {
    const result = resolveEnvironment(
      input({ apiUrl: undefined, keycloakUrl: undefined, metroHost: '192.168.1.10', isDev: true })
    )

    expect(result).toEqual({
      ok: true,
      apiUrl: 'http://192.168.1.10:3000/api',
      keycloakUrl: 'http://192.168.1.10:8080',
    })
  })

  it('retombe sur localhost sans Metro (simulateur)', () => {
    const result = resolveEnvironment(input({ apiUrl: undefined, keycloakUrl: undefined, isDev: true }))

    expect(result).toEqual({
      ok: true,
      apiUrl: 'http://localhost:3000/api',
      keycloakUrl: 'http://localhost:8080',
    })
  })

  it('accepte un override en HTTP, légitime sur un réseau local', () => {
    const result = resolveEnvironment(
      input({ apiUrl: 'http://10.0.0.5:3000/api', keycloakUrl: 'http://10.0.0.5:8080', isDev: true })
    )

    expect(result.ok).toBe(true)
  })
})

describe('resolveEnvironment — en build autonome', () => {
  it('retient les deux URL fournies', () => {
    expect(resolveEnvironment(input())).toEqual({
      ok: true,
      apiUrl: VALID_API,
      keycloakUrl: VALID_KEYCLOAK,
    })
  })

  it('échoue en citant les deux variables quand rien n’est renseigné, sans jamais viser localhost', () => {
    const result = resolveEnvironment(input({ apiUrl: undefined, keycloakUrl: undefined }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain(API_URL_VAR)
    expect(result.error).toContain(KEYCLOAK_URL_VAR)
    expect(result.error).not.toContain('localhost')
  })

  it('ne cite que la variable manquante quand l’autre est correcte', () => {
    const result = resolveEnvironment(input({ keycloakUrl: undefined }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain(KEYCLOAK_URL_VAR)
    expect(result.error).not.toContain(`${API_URL_VAR} n`)
  })

  it('refuse le HTTP en clair, qu’Android et iOS bloquent de toute façon', () => {
    const result = resolveEnvironment(input({ apiUrl: 'http://api-exemple.minuseek.fr/api' }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('HTTPS')
  })

  it('refuse une URL d’API qui ne se termine pas par /api', () => {
    const result = resolveEnvironment(input({ apiUrl: 'https://api-exemple.minuseek.fr' }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('/api')
  })

  it('refuse une URL Keycloak terminée par une barre oblique', () => {
    const result = resolveEnvironment(input({ keycloakUrl: 'https://auth-exemple.minuseek.fr/' }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain(KEYCLOAK_URL_VAR)
  })

  it('refuse une valeur qui n’est pas une URL absolue', () => {
    const result = resolveEnvironment(input({ apiUrl: 'api-exemple.minuseek.fr/api' }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain('URL absolue')
  })
})
