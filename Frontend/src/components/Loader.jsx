const Loader = ({ message = "Loading" }) => (
    <main className='loading-screen' role='status' aria-live='polite'>
        <div className='ink-line' />
        <p className='mono-label'>{message}</p>
    </main>
)

export default Loader
