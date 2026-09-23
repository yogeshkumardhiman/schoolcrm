import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Admission from './pages/Admission';
import Team from './pages/Team';
import StaffDetail from './pages/StaffDetail';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import MandatoryDisclosure from './pages/MandatoryDisclosure';
import News from './pages/News';
import Career from './pages/Career';
import AcademicCalendar from './pages/AcademicCalendar';
import Management from './pages/Management';
import Teachers from './pages/Teachers';
import { fetchSchoolInfo } from './services/api';


function App() {
  useEffect(() => {
    const initializeBranding = async () => {
      try {
        const data = await fetchSchoolInfo();
        if (data) {
          // Set dynamic CSS theme colors instantly!
          if (data.primaryColor) {
            document.documentElement.style.setProperty('--primary', data.primaryColor);
          }
          if (data.secondaryColor) {
            document.documentElement.style.setProperty('--secondary', data.secondaryColor);
          }
          // Dynamic document identity titles
          if (data.schoolName) {
            document.title = `${data.schoolName.toUpperCase()} | Official Web Portal`;
          }
        }
      } catch (err) {
        console.error("[App] Branding sync failure:", err);
      }
    };
    initializeBranding();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/team/:id" element={<StaffDetail />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cbse-mandatory" element={<MandatoryDisclosure />} />
          <Route path="/news" element={<News />} />
          <Route path="/career" element={<Career />} />
          <Route path="/academic-calendar" element={<AcademicCalendar />} />
          <Route path="/management" element={<Management />} />
          <Route path="/teachers" element={<Teachers />} />
          
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </Router>
  );
}


export default App;
