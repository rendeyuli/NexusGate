import { match, P } from 'ts-pattern'

import { CopyButton } from '@/components/ui/copy-button'

export const ApiKeyCopyButton = ({ apiKey, revoked }: { apiKey: string; revoked?: boolean }) => {
  const maskedValue = getMaskedValue(apiKey)

  return revoked ? (
    <div className="flex items-center gap-1.5">
      <span className="tabular-nums line-through opacity-50">{maskedValue}</span>
    </div>
  ) : (
    <CopyButton className="-mx-2 !px-2" value={apiKey}>
      {maskedValue}
    </CopyButton>
  )
}

function getMaskedValue(key: string) {
  const length = key.length
  const [start, end] = match(length)
    .with(P.number.gt(20), () => [7, 4])
    .with(P.number.gt(6), () => [2, 2])
    .with(P.number.gt(2), () => [1, 0])
    .otherwise(() => [0, 0])
  return key.slice(0, start) + '*'.repeat(length - start - end) + key.slice(length - end)
}
