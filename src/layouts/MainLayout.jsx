import Header from '../components/Header.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Starfield from '../components/Starfield.jsx';

const YEAR = new Date().getFullYear();

export default function MainLayout({ children }) {
  return (
    <div className="app">
      <Starfield />
      <ProgressBar />

      <Header />

      {children}

      <footer>
        <p>
          🚀 Full Stack Dev · Built for mastering computer science · <span>{YEAR}</span>
        </p>
      </footer>
    </div>
  );
}
