import { treaty } from '@elysiajs/eden'
import type { App } from 'nexus-gate-server'

export const api = treaty<App>(location.origin, {
  headers: () => {
    const adminSecret = localStorage.getItem('admin-secret')
    if (!adminSecret) return undefined
    return {
      authorization: `Bearer ${JSON.parse(adminSecret)}`,
    }
  },
}).api
