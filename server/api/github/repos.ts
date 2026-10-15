import type { Repository } from '~/types/repository'

export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const cloudflareEnv = event.context.cloudflare?.env as Record<string, any> | undefined
  
  const token = config.githubToken || cloudflareEnv?.GITHUB_TOKEN || process.env.GITHUB_TOKEN
  const username = config.githubUsername || cloudflareEnv?.GITHUB_USERNAME || process.env.GITHUB_USERNAME

  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'GitHub token non configurato nelle variabili d\'ambiente' })
  }

  try {
    const repos: Repository[] = await $fetch('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': `Portfolio (giuliotognetto.dev)`
      },
      query: {
        visibility: 'all',
        sort: 'updated',
        per_page: 100
      }
    })

    return repos
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Errore durante il recupero delle repository da GitHub'
    })
  }
}, {
  maxAge: 60 * 60, // La cache dura 1 ora (in secondi).
  swr: true,       // Stale-While-Revalidate: serve la versione in cache istantaneamente e aggiorna in background
  name: 'github-repos-cache'
})