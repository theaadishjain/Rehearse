import { Link, useNavigate } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'

const AppHeader = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    const logout = async () => {
        await handleLogout()
        navigate('/')
    }

    return (
        <header className='app-header'>
            <div className='container app-header__inner'>
                <Link to='/' className='wordmark'>Rehearse<span>.</span></Link>
                <nav className='app-header__nav'>
                    {user && <span className='mono-label app-header__user'>{user.username}</span>}
                    <button className='text-link' onClick={logout}>Log out</button>
                </nav>
            </div>
        </header>
    )
}

export default AppHeader
