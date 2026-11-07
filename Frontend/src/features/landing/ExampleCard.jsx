import { useState } from 'react'
import { EXAMPLES } from './examples'
import { scoreBand } from '../../lib/score'

/** An example plan that switches between a few kinds of role. */
const ExampleCard = () => {
    const [ active, setActive ] = useState(EXAMPLES[ 0 ].id)
    const ex = EXAMPLES.find((e) => e.id === active)

    return (
        <div className='example'>
            <div className='example__roles' role='tablist' aria-label='Example role'>
                {EXAMPLES.map((e) => (
                    <button
                        key={e.id}
                        role='tab'
                        aria-selected={e.id === active}
                        className={`example__role ${e.id === active ? 'is-active' : ''}`}
                        onClick={() => setActive(e.id)}
                    >
                        {e.label}
                    </button>
                ))}
            </div>

            <figure className='specimen' aria-label={`Example plan for ${ex.role}`} key={ex.id}>
                <figcaption className='specimen__tag mono-label'>Example plan</figcaption>

                <div className='specimen__head'>
                    <div>
                        <p className='mono-label'>Role</p>
                        <p className='specimen__role'>{ex.role}</p>
                    </div>
                    <p className={`specimen__score score-text--${scoreBand(ex.score)}`}>{ex.score}<small>/100</small></p>
                </div>

                <div className='specimen__question'>
                    <p className='mono-label'>Question {String(ex.questionNumber).padStart(2, '0')}</p>
                    <p className='specimen__q'>&ldquo;{ex.question}&rdquo;</p>
                    <dl>
                        <dt className='mono-label'>Why they ask</dt>
                        <dd>{ex.why}</dd>
                        <dt className='mono-label'>How to answer</dt>
                        <dd>{ex.how}</dd>
                    </dl>
                </div>

                <div className='specimen__gaps'>
                    <p className='mono-label'>Where to focus</p>
                    <ul>
                        {ex.gaps.map((g) => (
                            <li key={g.skill}><span>{g.skill}</span><span className={`level level--${g.severity}`}>{g.severity}</span></li>
                        ))}
                    </ul>
                </div>
            </figure>
        </div>
    )
}

export default ExampleCard
