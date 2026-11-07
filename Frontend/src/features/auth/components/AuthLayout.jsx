import { Link } from 'react-router'
import "../auth.form.scss"

const AuthLayout = ({ title, subtitle, children }) => (
    <main className='auth'>
        <aside className='auth__side'>
            <Link to='/' className='wordmark'>Rehearse<span>.</span></Link>
            <p className='auth__line'>
                You can't know every question.<br />
                <em>You can know the likely ones.</em>
            </p>
            <p className='mono-label'>Questions &middot; Gaps &middot; A plan &middot; A better resume</p>
        </aside>

        <section className='auth__panel'>
            <div className='auth__form'>
                <Link to='/' className='wordmark auth__mobile-mark'>Rehearse<span>.</span></Link>
                <h1>{title}</h1>
                <p className='auth__subtitle'>{subtitle}</p>
                {children}
            </div>
        </section>
    </main>
)

export default AuthLayout
