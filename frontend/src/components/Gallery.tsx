/**
 * The pictures of one portfolio project, on the worker's own page and on the
 * public one.
 *
 * Every picture is a remote address the worker typed, so any of them may be
 * gone, or may never have been an image. onError hides the broken one rather
 * than leaving the browser's torn-page icon sitting in somebody's portfolio.
 */
export default function Gallery({
  images,
}: {
  images: { id?: number; url: string; caption: string }[]
}) {
  if (images.length === 0) return null

  return (
    <div className="gallery">
      {images.map((image, i) => (
        <figure key={image.id ?? i}>
          <img
            src={image.url}
            alt={image.caption || 'Work by this tradesperson'}
            loading="lazy"
            onError={(e) => { e.currentTarget.closest('figure')?.classList.add('broken') }}
          />
          {image.caption && <figcaption>{image.caption}</figcaption>}
        </figure>
      ))}
    </div>
  )
}
