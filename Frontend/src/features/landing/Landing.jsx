import { Link } from 'react-router'
import './landing.scss'
import ExampleCard from './ExampleCard'

const Arrow = () => <span className='arrow' aria-hidden='true'>&rarr;</span>

// A hand-drawn underline, used once, under the word that matters.
const Scribble = () => (
    <svg className='scribble' viewBox="0 0 220 18" preserveAspectRatio="none" aria-hidden="true">
        <path d="M3 12 C 40 4, 80 15, 120 8 S 190 5, 217 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
)

const STEPS = [
    { title: "Paste the job", text: "Copy the full job description from the posting." },
    { title: "Add your experience", text: "Upload your resume as a PDF, or write a few lines about yourself." },
    { title: "Get your plan", text: "Questions, skill gaps, a day-by-day plan and a tailored resume." },
]

const DIFFERENCES = [
    { title: "Your match score", text: "See how well you fit the role, and what's pulling the score down." },
    { title: "The questions they'll likely ask", text: "Technical and behavioural, each with what the interviewer is testing and how to answer." },
    { title: "Your gaps, ranked", text: "Marked high, medium or low, so you spend your evenings where it counts." },
    { title: "A day-by-day plan", text: "What to practise each day until the interview." },
    { title: "A resume for this job", text: "Rewritten around the posting, ready to download as a PDF." },
    { title: "Saved for later", text: "Come back the night before and pick up where you left off." },
]

const FAQ = [
    {
        q: "Is it free?",
        a: "Yes. Creating an account and making plans is free.",
    },
    {
        q: "What happens to my resume and the job description?",
        a: "They're sent to Google Gemini to write your plan, and saved with the plan in your account so you can come back to it.",
    },
    {
        q: "Do I need a resume?",
        a: "No. A few lines about your experience is enough to get a plan. A resume gives more specific questions and a better rewritten resume.",
    },
    {
        q: "Which jobs does it work for?",
        a: "Any job with a written posting. The examples above cover engineering, product and sales; it works the same way for design, marketing, operations, support and more.",
    },
    {
        q: "Are these the actual interview questions?",
        a: "Nobody can know that. They're the questions a job like this most often leads to, based on the posting and your background. Treat them as practice, not a script.",
    },
]

const Landing = () => (
    <div className='landing'>
        <div className='landing__backdrop' aria-hidden='true'>
            <span className='landing__glow landing__glow--warm' />
            <span className='landing__glow landing__glow--cool' />
            <span className='landing__grid' />
        </div>

        <header className='landing-nav'>
            <div className='container landing-nav__inner'>
                <Link to='/' className='wordmark'>Rehearse<span>.</span></Link>
                <nav>
                    <Link to='/login' className='text-link'>Log in</Link>
                    <Link to='/register' className='button primary-button small'>Get started</Link>
                </nav>
            </div>
        </header>

        <main>
            {/* ── Hero ── */}
            <section className='container hero'>
                <div className='hero__copy'>
                    <p className='eyebrow'><span className='eyebrow__dot' />Interview prep for one specific job</p>
                    <h1>
                        Know the questions <em className='hero__em'>before<Scribble /></em> they're asked.
                    </h1>
                    <p className='hero__lede'>
                        Paste a job description and your resume. You get the questions you're likely to face,
                        what each one is really testing, where you fall short, and a day-by-day plan to get ready.
                    </p>
                    <div className='hero__actions'>
                        <Link to='/register' className='button primary-button'>Get started <Arrow /></Link>
                        <Link to='/login' className='text-link'>or log in</Link>
                    </div>
                </div>

                <ExampleCard />
            </section>

            {/* ── How it works ── */}
            <section className='container steps' aria-label='How it works'>
                <ol className='steps__list'>
                    {STEPS.map((s, i) => (
                        <li key={s.title} className='steps__item'>
                            <span className='steps__num'>{String(i + 1).padStart(2, '0')}</span>
                            <div>
                                <h3>{s.title}</h3>
                                <p>{s.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            {/* ── What you get ── */}
            <section className='container compare'>
                <div className='section-head compare__head'>
                    <p className='mono-label'>What you get</p>
                    <h2>One job posting in.<br /><em>A complete prep plan out.</em></h2>
                    <p>No prompts to write, no wall of text to scroll through. Paste the posting and get a plan built for that one interview.</p>
                </div>
                <ol className='compare__list'>
                    {DIFFERENCES.map((d, i) => (
                        <li key={d.title} className='compare__item'>
                            <span className='compare__num'>{String(i + 1).padStart(2, '0')}</span>
                            <h3>{d.title}</h3>
                            <p>{d.text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* ── Resume, rewritten ── */}
            <div className='band'>
                <section className='container rewrite'>
                    <div className='rewrite__intro'>
                        <p className='mono-label'>Your resume, rewritten for the job</p>
                        <h2>Same experience. <em>Told for this role.</em></h2>
                        <p>
                            Rehearse rewrites your resume around what the posting asks for and gives it back as a PDF.
                            It works from what's already in your resume and is told not to invent employers, dates or
                            numbers. Read it through before you send it.
                        </p>
                    </div>
                    <div className='rewrite__compare' aria-label='Example of a resume line before and after'>
                        <div className='rewrite__card'>
                            <p className='mono-label'>Example: your resume says</p>
                            <p className='rewrite__text'>Worked on the frontend of the company website. Fixed bugs and added new features.</p>
                        </div>
                        <span className='rewrite__arrow' aria-hidden='true'>&rarr;</span>
                        <div className='rewrite__card rewrite__card--after'>
                            <p className='mono-label'>Rewritten for a payments role</p>
                            <p className='rewrite__text'>Built and maintained checkout and account pages in React, including form validation and keyboard-accessible error handling.</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* ── FAQ ── */}
            <section className='container faq'>
                <div className='section-head section-head--center'>
                    <p className='mono-label'>Questions</p>
                    <h2>Before you start</h2>
                </div>
                <div className='faq__list'>
                    {FAQ.map((item) => (
                        <details key={item.q} className='faq__item'>
                            <summary>{item.q}</summary>
                            <p>{item.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* ── Closing ── */}
            <section className='container'>
                <div className='closing'>
                    <p className='closing__line'>
                        You can't know every question.<br />
                        <em>You can know the likely ones.</em>
                    </p>
                    <Link to='/register' className='button primary-button'>Try it with your next job <Arrow /></Link>
                </div>
            </section>
        </main>

        <footer className='container landing-footer'>
            <span className='wordmark'>Rehearse<span>.</span></span>
        </footer>
    </div>
)

export default Landing
