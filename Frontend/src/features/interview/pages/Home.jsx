import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { Link, useNavigate } from 'react-router'
import AppHeader from '../../../components/AppHeader'
import GeneratingScreen from '../../../components/GeneratingScreen'
import { scoreBand } from '../../../lib/score'

const MAX_RESUME_BYTES = 3 * 1024 * 1024

function formatSize(bytes) {
    return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(value) {
    return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

const Home = () => {

    const { error, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ fileError, setFileError ] = useState("")
    const [ dragging, setDragging ] = useState(false)
    const [ generating, setGenerating ] = useState(false)
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const pickFile = (file) => {
        setFileError("")
        if (!file) return
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setFileError("That isn't a PDF. Please choose a PDF file.")
            return
        }
        if (file.size > MAX_RESUME_BYTES) {
            setFileError("That file is larger than 3MB.")
            return
        }
        setResumeFile(file)
    }

    const removeFile = () => {
        setResumeFile(null)
        if (resumeInputRef.current) resumeInputRef.current.value = ""
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragging(false)
        pickFile(e.dataTransfer.files[ 0 ])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setGenerating(true)
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        if (data) {
            navigate(`/interview/${data._id}`)
        } else {
            setGenerating(false)
        }
    }

    if (generating) {
        return <GeneratingScreen />
    }

    return (
        <>
        <AppHeader />
        <main className='container workspace'>

            <form className='compose' onSubmit={handleSubmit}>
                <header className='compose__intro'>
                    <p className='mono-label'>New interview plan</p>
                    <h1>Which job are you <em>preparing</em> for?</h1>
                </header>

                <div className='field'>
                    <div className='field__label'>
                        <span className='field__num'>1</span>
                        <label htmlFor='jobDescription'>The job description</label>
                    </div>
                    <textarea
                        id='jobDescription'
                        value={jobDescription}
                        onChange={(e) => { setJobDescription(e.target.value) }}
                        className='paper-input'
                        rows={10}
                        placeholder='Paste the whole posting here, responsibilities and requirements included.'
                        maxLength={5000}
                    />
                    <p className='field__meta'>
                        <span>The more detail, the sharper the questions.</span>
                        <span>{jobDescription.length} / 5000</span>
                    </p>
                </div>

                <div className='field'>
                    <div className='field__label'>
                        <span className='field__num'>2</span>
                        <span>About you</span>
                    </div>
                    <p className='field__help'>Your resume works best. A few lines about yourself also works.</p>

                    {resumeFile ? (
                        <div className='file-chip'>
                            <span className='file-chip__name'>{resumeFile.name}</span>
                            <span className='file-chip__size'>{formatSize(resumeFile.size)}</span>
                            <button type='button' className='text-link' onClick={removeFile}>Remove</button>
                        </div>
                    ) : (
                        <label
                            className={`dropzone ${dragging ? 'is-dragging' : ''}`}
                            htmlFor='resume'
                            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                        >
                            <span className='dropzone__title'>{dragging ? 'Drop it here' : 'Drop your resume here, or click to choose'}</span>
                            <span className='dropzone__touch'>Tap to choose your resume</span>
                            <span className='mono-label'>PDF &middot; up to 3MB</span>
                        </label>
                    )}
                    <input
                        ref={resumeInputRef} hidden type='file' id='resume' name='resume' accept='.pdf,application/pdf'
                        onChange={(e) => pickFile(e.target.files[ 0 ])} />
                    {fileError && <p className='field__error' role='alert'>{fileError}</p>}

                    <textarea
                        aria-label='About you'
                        value={selfDescription}
                        onChange={(e) => { setSelfDescription(e.target.value) }}
                        className='paper-input paper-input--short'
                        rows={4}
                        placeholder="Or in a few lines: what you've built, the tools you know, how many years you've been at it."
                        maxLength={3000}
                    />
                </div>

                {error && <p className='error-message' role='alert'>{error}</p>}

                <div className='compose__submit'>
                    <button type='submit' className='button primary-button'>
                        Write my plan <span className='arrow' aria-hidden='true'>&rarr;</span>
                    </button>
                    <span className='compose__note'>About thirty seconds.</span>
                </div>
            </form>

            <aside className={`plans ${reports.length > 0 ? 'has-plans' : ''}`}>
                <h2 className='mono-label'>Your plans</h2>
                {reports.length === 0 ? (
                    <p className='plans__empty'>
                        Nothing here yet. <em>Your first plan will appear here.</em>
                    </p>
                ) : (
                    <ol className='plans__list'>
                        {reports.map((report) => (
                            <li key={report._id}>
                                <Link to={`/interview/${report._id}`} className='plans__row'>
                                    <span className='plans__title'>{report.title || 'Untitled role'}</span>
                                    <span className='plans__meta'>
                                        <span>{formatDate(report.createdAt)}</span>
                                        <span className={`score-text score-text--${scoreBand(report.matchScore)}`}>{report.matchScore}/100</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                )}
            </aside>
        </main>
        </>
    )
}

export default Home
