import { useState } from 'react'
import { Link } from 'react-router'
import { previewInterview } from '../interview/services/interview.api'
import { getErrorMessage } from '../../lib/api'
import { saveDraft } from '../../lib/draft'

const PreviewQuestion = ({ item, index }) => {
    const [ open, setOpen ] = useState(index === 0)
    return (
        <li className={`try-q ${open ? 'is-open' : ''}`}>
            <button className='try-q__toggle' aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                <span className='try-q__num'>{String(index + 1).padStart(2, '0')}</span>
                <span className='try-q__text'>{item.question}</span>
                <span className='try-q__icon' aria-hidden='true'>{open ? '−' : '+'}</span>
            </button>
            {open && (
                <div className='try-q__body'>
                    <div>
                        <p className='mono-label'>Why they ask</p>
                        <p>{item.intention}</p>
                    </div>
                    <div>
                        <p className='mono-label'>How to answer</p>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </li>
    )
}

/** Lets visitors see real output for their own job before creating an account. */
const TryIt = () => {
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ status, setStatus ] = useState("idle") // idle | loading | done
    const [ preview, setPreview ] = useState(null)
    const [ error, setError ] = useState("")

    const keepDraft = () => saveDraft({ jobDescription, selfDescription })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setStatus("loading")
        try {
            const data = await previewInterview({ jobDescription, selfDescription })
            setPreview(data.preview)
            setStatus("done")
            keepDraft()
        } catch (err) {
            setError(await getErrorMessage(err, "Something went wrong. Please try again."))
            setStatus("idle")
        }
    }

    return (
        <section className='container try' id='try'>
            <div className='try__intro'>
                <p className='mono-label'>Try it, no account needed</p>
                <h2>Paste a real job posting.</h2>
                <p>You'll get three questions you're likely to be asked, with what each one is testing and how to answer. Nothing you paste here is saved.</p>
            </div>

            {status !== "done" ? (
                <form className='try__form' onSubmit={handleSubmit}>
                    <label className='mono-label' htmlFor='try-job'>Job description</label>
                    <textarea
                        id='try-job'
                        className='paper-input'
                        rows={8}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder='Paste the whole posting: responsibilities, requirements, the lot.'
                        maxLength={5000}
                        required
                    />
                    <label className='mono-label' htmlFor='try-me'>About you <span className='try__optional'>(optional)</span></label>
                    <textarea
                        id='try-me'
                        className='paper-input'
                        rows={2}
                        value={selfDescription}
                        onChange={(e) => setSelfDescription(e.target.value)}
                        placeholder='e.g. Two years building React apps, some Node.js, no payments experience yet.'
                        maxLength={1000}
                    />
                    {error && <p className='error-message' role='alert'>{error}</p>}
                    <div className='try__submit'>
                        <button className='button primary-button' disabled={status === "loading"}>
                            {status === "loading"
                                ? <><span className='spinner--small' /> Reading the posting</>
                                : <>Show me 3 questions <span className='arrow' aria-hidden='true'>&rarr;</span></>}
                        </button>
                        <span className='try__note'>{status === "loading" ? "About ten seconds." : "Free, and nothing is saved."}</span>
                    </div>
                </form>
            ) : (
                <div className='try__result'>
                    <p className='mono-label'>Three likely questions for</p>
                    <h3 className='try__role'>{preview.title}</h3>
                    <ol className='try__questions'>
                        {preview.questions.map((q, i) => <PreviewQuestion key={i} item={q} index={i} />)}
                    </ol>

                    <div className='try__next'>
                        <div>
                            <h3>That's a start. The full plan goes further.</h3>
                            <p>More questions, technical and behavioral. Your skill gaps ranked by how much they matter. A day-by-day preparation plan. And your resume rewritten for this job, as a PDF.</p>
                        </div>
                        <div className='try__next-actions'>
                            <Link to='/register' className='button primary-button' onClick={keepDraft}>
                                Get the full plan <span className='arrow' aria-hidden='true'>&rarr;</span>
                            </Link>
                            <span className='try__note'>We'll keep the job you pasted. <Link to='/login' className='text-link' onClick={keepDraft}>Log in</Link> if you have an account.</span>
                        </div>
                    </div>

                    <button className='text-link try__again' onClick={() => { setStatus("idle"); setPreview(null) }}>Try a different job</button>
                </div>
            )}
        </section>
    )
}

export default TryIt
