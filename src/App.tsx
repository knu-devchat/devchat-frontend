import './App.css'
import LoginPage from './components/pages/LoginPage';
import MainPage from './components/pages/MainPage';
import {Routes, Route, Link} from 'react-router-dom';

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  )
}

export default App
