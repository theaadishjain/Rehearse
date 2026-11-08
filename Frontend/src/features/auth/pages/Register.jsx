import React,{useState} from 'react'
import { useNavigate, Link, Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../components/AuthLayout'
import Loader from '../../../components/Loader'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const { user, loading, waking, submitting, error, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const ok = await handleRegister({username,email,password})
        if (ok) navigate("/")
    }

    // While the server is starting up, show the form instead of a blank loader
    if (loading && !waking) return <Loader />
    if (user) return <Navigate to='/' replace />

    return (
        <AuthLayout title='Start preparing.' subtitle='Create an account to make your first interview plan.'>
            {error && <p className="error-message" role="alert">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        value={username}
                        onChange={(e) => { setUsername(e.target.value) }}
                        type="text" id="username" name='username' placeholder='jane_doe'
                        autoComplete='username' required minLength={3} maxLength={30} />
                    <span className='input-group__hint'>Letters, numbers, dots, dashes and underscores.</span>
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        value={email}
                        onChange={(e) => { setEmail(e.target.value) }}
                        type="email" id="email" name='email' placeholder='you@example.com'
                        autoComplete='email' required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        value={password}
                        onChange={(e) => { setPassword(e.target.value) }}
                        type="password" id="password" name='password' placeholder='At least 8 characters'
                        autoComplete='new-password' required minLength={8} maxLength={72} />
                </div>

                <button className='button primary-button' disabled={submitting}>
                    {submitting && <span className='spinner spinner--small' />}
                    {submitting ? 'Creating account' : <>Create account <span className='arrow' aria-hidden='true'>&rarr;</span></>}
                </button>
            </form>

            <p className='auth__switch'>Already have an account? <Link to={"/login"} className='text-link'>Log in</Link></p>
        </AuthLayout>
    )
}

export default Register
