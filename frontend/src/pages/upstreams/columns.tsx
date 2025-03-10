import type { ColumnDef } from '@tanstack/react-table'

import type { api } from '@/lib/api'
import { ApiKeyCopyButton } from '@/pages/api-keys/api-key-copy-button'

import { RowActionButton } from './row-action-button'

export type Upstream = Exclude<Awaited<ReturnType<typeof api.admin.upstream.get>>['data'], null>[number]

export const columns: ColumnDef<Upstream>[] = [
  {
    accessorKey: 'name',
    header: 'Provider name',
  },
  {
    accessorKey: 'model',
    header: 'Model',
  },
  {
    accessorKey: 'upstreamModel',
    header: 'Provider model',
  },
  {
    accessorKey: 'url',
    header: 'Base URL',
  },
  {
    accessorKey: 'apiKey',
    header: 'API key',
    cell: ({ row }) => {
      const apiKey = row.original.apiKey
      return apiKey ? <ApiKeyCopyButton apiKey={apiKey} /> : null
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActionButton data={row.original} />,
  },
]
