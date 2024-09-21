import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate } from 'react-router-dom';
import { Home, Image, Shuffle, Calculator } from 'lucide-react';

const ImageConverter = lazy(() => import('./components/ImageConverter'));
const RandomChoiceGenerator = lazy(() => import('./components/RandomChoiceGenerator'));
const PrintingCostCalculator = lazy(() => import('./components/PrintingCostCalculator'));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/*" element={<ToolPage />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  const tools = [
    { name: 'Image Converter', icon: Image, path: '/image-converter' },
    { name: 'Random Choice', icon: Shuffle, path: '/random-choice' },
    { name: '3D Print Cost', icon: Calculator, path: '/printing-cost' },
  ];

  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      {tools.map((tool) => (
        <Link
          key={tool.path}
          to={tool.path}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <tool.icon className="w-12 h-12 mb-2 text-blue-500" />
          <span className="text-sm text-center">{tool.name}</span>
        </Link>
      ))}
    </div>
  );
}

function ToolPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-500 text-white p-4 flex items-center">
        <button onClick={() => navigate('/')} className="mr-4">
          <Home className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Tool Name</h1>
      </header>
      <main className="flex-grow p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/image-converter" element={<ImageConverter />} />
            <Route path="/random-choice" element={<RandomChoiceGenerator />} />
            <Route path="/printing-cost" element={<PrintingCostCalculator />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;