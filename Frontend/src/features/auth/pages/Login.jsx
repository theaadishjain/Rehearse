import React,{useState} from 'react'
import { useNavigate, Link, Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../components/AuthLayout'
import Loader from '../../../components/Loader'

const Login = () => {

    const { user, loading, waking, submitting, error, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        const ok = await handleLogin({email,password})
        if (ok) navigate('/')
    }

    // While the server is starting up, show the form instead of a blank loader. The login
    // request waits for the server like any other.
    if (loading && !waking) return <Loader />
    if (user) return <Navigate to='/' replace />

    return (
        <AuthLayout title='Welcome back.' subtitle='Log in to see your interview plans.'>
            {error && <p className="error-message" role="alert">{error}</p>}
            <form onSubmit={handleSubmit}>
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
                        type="password" id="password" name='password' placeholder='Your password'
                        autoComplete='current-password' required />
                </div>
                <button className='button primary-button' disabled={submitting}>
                    {submitting && <span className='spinner spinner--small' />}
                    {submitting ? 'Logging in' : <>Log in <span className='arrow' aria-hidden='true'>&rarr;</span></>}
                </button>
            </form>
            <p className='auth__switch'>Don't have an account? <Link to={"/register"} className='text-link'>Create one</Link></p>
        </AuthLayout>
    )
}

export default Login
