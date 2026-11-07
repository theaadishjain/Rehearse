import { useEffect, useState } from 'react'
import './generating.scss'

const LINES = [
    "Reading the job description",
    "Comparing it with your experience",
    "Drafting the questions they're likely to ask",
    "Working out where you'll need to prepare",
    "Laying out your plan, day by day",
]

/**
 * Shown while the report is being written (~30s). The lines advance on a timer to show
 * that something is happening; they are not tied to real progress.
 */
const GeneratingScreen = () => {
    const [ step, setStep ] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((s) => Math.min(s + 1, LINES.length - 1))
        }, 6000)
        return () => clearInterval(timer)
    }, [])

    return (
        <main className='generating' role='status' aria-live='polite'>
            <p className='mono-label'>Writing your plan</p>
            <p className='generating__line' key={step}>
                {LINES[ step ]}<span className='generating__dots' aria-hidden='true'>...</span>
            </p>
            <div className='ink-line generating__bar' />
            <p className='generating__note'>Usually about thirty seconds. Keep this tab open.</p>
        </main>
    )
}

export default GeneratingScreen
