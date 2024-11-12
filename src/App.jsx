import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Highlight from './pages/Highlight';

function App() {

  return (
    <>
      <Router>
        <Routes>
        <Route path="/video" element={<Highlight />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
