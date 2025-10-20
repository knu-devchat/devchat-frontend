import './App.css'
import LoginPage from './components/pages/LoginPage';
import MainPage from './components/pages/MainPage';
import Dashboard from './components/pages/Dashboard';
import {Routes, Route} from 'react-router-dom';

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
