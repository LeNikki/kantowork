// Offset paging, which is what the API offers. Both buttons are hidden when
// everything fits on one page - there is nothing to page through.
export default function Pager({
  total, limit, offset, onChange,
}: {
  total: number
  limit: number
  offset: number
  onChange: (offset: number) => void
}) {
  if (total <= limit) return null

  const page = Math.floor(offset / limit) + 1
  const pages = Math.ceil(total / limit)

  return (
    <div className="pager">
      <button
        className="btn btn-quiet"
        onClick={() => onChange(Math.max(offset - limit, 0))}
        disabled={offset === 0}
      >
        Previous
      </button>
      <span className="muted">Page {page} of {pages}</span>
      <button
        className="btn btn-quiet"
        onClick={() => onChange(offset + limit)}
        disabled={offset + limit >= total}
      >
        Next
      </button>
    </div>
  )
}
