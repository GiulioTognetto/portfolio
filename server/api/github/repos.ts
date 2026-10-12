import type { Repository } from '~/types/repository'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.githubToken) {
    throw createError({ statusCode: 500, statusMessage: 'GitHub token non configurato nelle variabili d\'ambiente' })
  }

  try {
    const repos: Repository[] = await $fetch('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${config.githubToken}`,
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
})