import type { Skill } from '../api'

/**
 * The same pick list on a worker's profile and on a job posting - one asks
 * what you can do, the other what the work needs, and both draw on the same
 * vocabulary. Keeping it one component is what keeps the two from drifting
 * apart visually.
 */
export default function SkillPicker({
  vocabulary, chosen, onToggle, legend,
}: {
  vocabulary: Skill[]
  chosen: Set<number>
  onToggle: (id: number) => void
  legend: string
}) {
  // The API returns them sorted by category, so walking the list in order is
  // enough to group them.
  const categories = [...new Set(vocabulary.map((s) => s.category))]

  return (
    <fieldset className="skills">
      <legend>{legend}</legend>
      {categories.map((category) => (
        <div key={category} className="skills-group">
          <h2>{category}</h2>
          <div className="skills-list">
            {vocabulary.filter((s) => s.category === category).map((skill) => (
              <label key={skill.id} className={chosen.has(skill.id) ? 'tag tag-on' : 'tag'}>
                <input
                  type="checkbox"
                  checked={chosen.has(skill.id)}
                  onChange={() => onToggle(skill.id)}
                />
                {skill.name}
              </label>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  )
}
