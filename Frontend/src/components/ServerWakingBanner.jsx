import './server-waking.scss'

/**
 * Shown while the backend is starting up. On Render's free plan the server goes to sleep
 * after 15 minutes without traffic, and the first request then takes up to a minute.
 * Requests sent in the meantime (like logging in) still go through once it is up.
 */
const ServerWakingBanner = () => (
    <div className='server-waking' role='status' aria-live='polite'>
        <span className='spinner--small' aria-hidden='true' />
        <p>
            <strong>Starting up the server.</strong>{' '}
            This can take up to a minute on the first visit. You can keep going in the meantime.
        </p>
    </div>
)

export default ServerWakingBanner
