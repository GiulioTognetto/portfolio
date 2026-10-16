import type { EnrichedRepository, Repository } from '~/types/repository'


async function enrichRepository(repo: Repository, token: string): Promise<EnrichedRepository> {
  const branch = repo.default_branch || 'main'
  const portfolioConfigUrl = `https://raw.githubusercontent.com/${repo.full_name}/${branch}/.github/portfolio.config.json`

  try {
    await $fetch(portfolioConfigUrl, {
      method: 'HEAD',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': `Portfolio (giuliotognetto.dev)`
      }
    })

    return {
      ...repo,
      portfolioConfigUrl
    }
  } catch {
    return { ...repo, portfolioConfigUrl: undefined }
  }
}

export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const cloudflareEnv = event.context.cloudflare?.env as Record<string, any> | undefined
  
  const token = config.githubToken || cloudflareEnv?.GITHUB_TOKEN || process.env.GITHUB_TOKEN

  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'GitHub token non configurato nelle variabili d\'ambiente' })
  }

  try {
    const repos: Repository[] = await $fetch<Repository[]>('https://api.github.com/user/repos', {
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

    const enrichedRepos = await Promise.all(repos.map<Promise<EnrichedRepository>>(async (repo) => await enrichRepository(repo, token)))

    console.log(enrichedRepos)

    return enrichedRepos
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