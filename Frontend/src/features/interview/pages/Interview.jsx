import React, { useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { Link, useParams } from 'react-router'
import AppHeader from '../../../components/AppHeader'
import Loader from '../../../components/Loader'
import { scoreBand, scoreSummary } from '../../../lib/score'

const pad = (n) => String(n).padStart(2, '0')

const QuestionItem = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <li className={`question ${open ? 'is-open' : ''}`}>
            <button className='question__toggle' aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                <span className='question__num'>{pad(index + 1)}</span>
                <span className='question__text'>{item.question}</span>
                <span className='question__icon' aria-hidden='true'>{open ? '−' : '+'}</span>
            </button>
            {open && (
                <div className='question__body'>
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

const PlanDay = ({ day }) => (
    <li className='day'>
        <div className='day__marker'>
            <span className='mono-label'>Day</span>
            <span className='day__n'>{day.day}</span>
        </div>
        <div className='day__content'>
            <h3>{day.focus}</h3>
            <ul>
                {day.tasks.map((task, i) => <li key={i}>{task}</li>)}
            </ul>
        </div>
    </li>
)

const Interview = () => {
    const [ tab, setTab ] = useState('technical')
    // useInterview loads the report for the :interviewId in the URL
    const { report, loading, downloading, error, getResumePdf } = useInterview()
    const { interviewId } = useParams()

    if (!loading && !report && error) {
        return (
            <>
                <AppHeader />
                <main className='loading-screen'>
                    <p className='error-message' role='alert'>{error}</p>
                    <Link to='/' className='text-link'>Back to your plans</Link>
                </main>
            </>
        )
    }

    if (loading || !report) {
        return <Loader message='Opening your plan' />
    }

    const band = scoreBand(report.matchScore)
    const tabs = [
        { id: 'technical', label: 'Technical', count: report.technicalQuestions.length },
        { id: 'behavioral', label: 'Behavioral', count: report.behavioralQuestions.length },
        { id: 'plan', label: 'Preparation plan', count: report.preparationPlan.length },
    ]
    const questions = tab === 'technical' ? report.technicalQuestions : report.behavioralQuestions

    return (
        <>
        <AppHeader />
        <main className='container report'>
            <Link to='/' className='back-link'>&larr; All plans</Link>

            <header className='report__hero'>
                <div>
                    <p className='mono-label'>
                        Interview plan &middot; {new Date(report.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h1>{report.title}</h1>
                </div>

                <div className={`score score--${band}`}>
                    <p className='score__number'>
                        {report.matchScore}<span>/100</span>
                    </p>
                    <div className='score__bar'><span style={{ width: `${report.matchScore}%` }} /></div>
                    <p className='score__summary'>{scoreSummary(report.matchScore)}</p>
                </div>
            </header>

            <div className='report__body'>
                <section className='report__main'>
                    <nav className='tabs' role='tablist' aria-label='Plan sections'>
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                role='tab'
                                aria-selected={tab === t.id}
                                className={`tabs__tab ${tab === t.id ? 'is-active' : ''}`}
                                onClick={() => setTab(t.id)}
                            >
                                {t.label}<sup>{t.count}</sup>
                            </button>
                        ))}
                    </nav>

                    {tab === 'plan' ? (
                        <ol className='days'>
                            {report.preparationPlan.map((day) => <PlanDay key={day.day} day={day} />)}
                        </ol>
                    ) : (
                        <ol className='questions' key={tab}>
                            {questions.map((q, i) => <QuestionItem key={i} item={q} index={i} />)}
                        </ol>
                    )}
                </section>

                <aside className='report__aside'>
                    <section className='aside-block'>
                        <h2 className='mono-label'>Where to focus</h2>
                        {report.skillGaps.length === 0 ? (
                            <p className='aside-block__text'>No major gaps found for this role.</p>
                        ) : (
                            <ul className='gaps'>
                                {report.skillGaps.map((gap, i) => (
                                    <li key={i}>
                                        <span>{gap.skill}</span>
                                        <span className={`level level--${gap.severity}`}>{gap.severity}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className='aside-block resume-block'>
                        <h2 className='mono-label'>Your resume, rewritten</h2>
                        <p className='aside-block__text'>A one or two page resume tailored to this job, ready to send as a PDF.</p>
                        <button
                            onClick={() => { getResumePdf(interviewId) }}
                            disabled={downloading}
                            className='button primary-button' >
                            {downloading
                                ? <><span className='spinner--small' /> Writing your resume</>
                                : <>Download PDF <span className='arrow' aria-hidden='true'>&darr;</span></>}
                        </button>
                        {downloading && <p className='resume-block__hint'>This can take up to a minute.</p>}
                        {error && <p className='error-message' role='alert'>{error}</p>}
                    </section>
                </aside>
            </div>
        </main>
        </>
    )
}

export default Interview
