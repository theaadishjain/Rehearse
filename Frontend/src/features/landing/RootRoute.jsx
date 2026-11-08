import { useAuth } from '../auth/hooks/useAuth'
import Loader from '../../components/Loader'
import Landing from './Landing'

/** "/" shows the landing page to visitors and the workspace to logged-in users. */
const RootRoute = ({ home }) => {
    const { user, loading, waking } = useAuth()
    // While the server is starting up, show the landing page instead of a blank loader.
    // A logged-in visitor is switched to their workspace once the server answers.
    if (loading && !waking) return <Loader />
    return user ? home : <Landing />
}

export default RootRoute
