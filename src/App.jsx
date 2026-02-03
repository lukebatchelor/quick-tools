import React, { lazy, Suspense, useState, Component } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate, useParams } from 'react-router-dom';
import { Home, Image, Shuffle, Calculator, QrCode, Sun, Moon, Search, Type, Edit, AlertTriangle } from 'lucide-react';
import { ThemeProvider, useTheme } from './ThemeContext';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PWAUpdateNotification from '@/components/PWAUpdateNotification';

const ImageConverter = lazy(() => import('./tools/ImageConverter'));
const RandomChoiceGenerator = lazy(() => import('./tools/RandomChoiceGenerator'));
const PrintingCostCalculator = lazy(() => import('./tools/PrintingCostCalculator'));
const QRCodeGenerator = lazy(() => import('./tools/QRCodeGenerator'));
const FancyTextGenerator = lazy(() => import('./tools/FancyTextGenerator'));
const ImageEditor = lazy(() => import('./tools/ImageEditor'));
const BahtConverter = lazy(() => import('./tools/BahtToAudConverter'));
const EVRangeEstimator = lazy(() => import('./tools/EVRangeEstimator'));

const tools = [
  { name: 'Image Converter', icon: Image, path: '/image-converter', component: ImageConverter },
  { name: 'Random Choice', icon: Shuffle, path: '/random-choice', component: RandomChoiceGenerator },
  { name: '3D Print Cost', icon: Calculator, path: '/printing-cost', component: PrintingCostCalculator },
  { name: 'QR Generator', icon: QrCode, path: '/qr-generator', component: QRCodeGenerator },
  { name: 'Fancy Text', icon: Type, path: '/fancy-text', component: FancyTextGenerator },
  { name: 'Image Editor', icon: Edit, path: '/image-editor', component: ImageEditor },
  { name: 'Baht Converter', icon: Calculator, path: '/baht-converter', component: BahtConverter },
  { name: 'EV Range Est', icon: Calculator, path: '/ev-range-estimator', component: EVRangeEstimator },
];

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.state = { hasError: true, error, errorInfo };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Something went wrong
              </h2>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                The tool encountered an error and couldn't load properly.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tool: <span className="font-semibold">{this.props.toolName}</span>
              </p>
            </div>

            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Error Details
                </summary>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                  <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs mt-2 text-red-700 dark:text-red-400 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Fallback Component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading tool...</p>
      </div>
    </div>
  );
}

// Lazy Loading Error Fallback
function LazyLoadError({ error, toolName }) {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-8 h-8 text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Failed to load tool
        </h2>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        The <span className="font-semibold">{toolName}</span> tool couldn't be loaded. 
        This might be due to a network issue or the tool file might be missing.
      </p>

      {error && (
        <details className="mb-4">
          <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Error Details
          </summary>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-3">
            <p className="text-sm font-mono text-orange-800 dark:text-orange-300 break-all">
              {error.toString()}
            </p>
          </div>
        </details>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => window.location.href = '/'}
          className="flex-1"
        >
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="flex-1"
        >
          Retry
        </Button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ErrorBoundary toolName="Application">
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/:toolPath" element={<ToolPage />} />
            </Routes>
            <PWAUpdateNotification />
          </div>
        </ErrorBoundary>
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
        <h1 className="text-2xl font-bold text-center">Quick Tools</h1>
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
  const [lazyLoadError, setLazyLoadError] = useState(null);

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
        <ErrorBoundary toolName={tool ? tool.name : 'Unknown Tool'}>
          <Suspense 
            fallback={<LoadingFallback />}
          >
            {ToolComponent ? (
              <ToolComponent />
            ) : (
              <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tool not found
                  </h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  The tool you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => navigate('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            )}
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;