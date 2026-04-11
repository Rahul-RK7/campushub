import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            <main style={{
                paddingTop: '6rem',
                paddingBottom: '3rem',
                maxWidth: '80rem',
                margin: '0 auto',
                paddingLeft: '1rem',
                paddingRight: '1rem',
            }}>
                {children}
            </main>
        </>
    );
}
