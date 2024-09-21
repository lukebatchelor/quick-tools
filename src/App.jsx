import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate, useParams } from 'react-router-dom';
import { Home, Image, Shuffle, Calculator, Sun, Moon, Search } from 'lucide-react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ImageConverter = lazy(() => import('./components/ImageConverter'));
const RandomChoiceGenerator = lazy(() => import('./components/RandomChoiceGenerator'));
const PrintingCostCalculator = lazy(() => import('./components/PrintingCostCalculator'));

const tools = [
  { name: 'Image Converter', icon: Image, path: '/image-converter', component: ImageConverter },
  { name: 'Random Choice', icon: Shuffle, path: '/random-choice', component: RandomChoiceGenerator },
  { name: '3D Print Cost', icon: Calculator, path: '/printing-cost', component: PrintingCostCalculator },
];

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:toolPath" element={<ToolPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

function HomePage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <header className="bg-blue-500 dark:bg-blue-800 text-white p-4 flex items-center justify-between">
        <div className="flex-1">
          <Button onClick={() => navigate('/')} variant="ghost" size="icon" className="text-white">
            <Home className="w-6 h-6" />
          </Button>
        </div>
        <h1 className="text-2xl font-bold flex-1 text-center">Quick Tools</h1>
        <div className="flex-1 flex justify-end">
          <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="text-white">
            {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>
      </header>
      <main className="flex-grow p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 dark:bg-gray-800 dark:text-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <tool.icon className="w-12 h-12 mb-2 text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-center dark:text-white">{tool.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { toolPath } = useParams();

  const tool = tools.find(t => t.path === `/${toolPath}`);
  const ToolComponent = tool ? tool.component : null;

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      <header className="bg-blue-500 dark:bg-blue-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="mr-4">
            <Home className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{tool ? tool.name : 'Tool Not Found'}</h1>
        </div>
        <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="text-white">
          {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </header>
      <main className="flex-grow p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Suspense fallback={<div>Loading...</div>}>
          {ToolComponent ? <ToolComponent /> : <div>Tool not found</div>}
        </Suspense>
      </main>
    </div>
  );
}

export default App;