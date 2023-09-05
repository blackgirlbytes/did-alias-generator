import styles from '../styles/home.module.css'
import UsernameForm from '../components/UsernameForm'


function Home() {
  return (
    <main className={styles.main}>
      <UsernameForm /> 
    </main>
  )
}

export default Home
