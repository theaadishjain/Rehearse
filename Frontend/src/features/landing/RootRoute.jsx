import { useAuth } from '../auth/hooks/useAuth'
import Loader from '../../components/Loader'
import Landing from './Landing'

/** "/" shows the landing page to visitors and the workspace to logged-in users. */
const RootRoute = ({ home }) => {
    const { user, loading } = useAuth()
    if (loading) return <Loader />
    return user ? home : <Landing />
}

export default RootRoute
