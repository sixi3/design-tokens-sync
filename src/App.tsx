import { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import flows
import OnboardingFlow from './flows/OnboardingFlow';
import DesignSystemShowcase from './components/design-system/DesignSystemShowcase';
import DesignSystemDashboard from './components/design-system/DesignSystemDashboard';
// import ChatDemoFlow from './flows/ChatDemoFlow';

const App: FC = () => {
  return (
    <Router>
      <Routes>
        {/* Design System Showcase - Full Screen */}
        <Route path="/design-system" element={<DesignSystemShowcase />} />
        
        {/* Analytics Dashboard - Full Screen */}
        <Route path="/analytics" element={<DesignSystemDashboard />} />
        
        {/* Phone Container Routes */}
        <Route path="/*" element={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            {/* iPhone-like container */}
            <div className="phone-container">
              <div className="phone-screen">
                <div className="h-full bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="h-full flex flex-col"
                  >
                    <Routes>
                      <Route path="/" element={<WelcomeScreen />} />
                      <Route path="/onboarding" element={<OnboardingFlow />} />
                      {/* <Route path="/chat-demo" element={<ChatDemoFlow />} /> */}
                    </Routes>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

// Temporary welcome screen
const WelcomeScreen: FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full px-6 text-center"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-3">
        EQ AI Voice Assistant
      </h1>
      <p className="text-lg text-gray-600 mb-8 leading-relaxed">
        Interactive prototype with smooth animations and demo flows
      </p>
      <div className="space-y-4 w-full max-w-xs">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-primary-600 transition-colors"
          onClick={() => window.location.href = '/onboarding'}
        >
          Start Onboarding Demo
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-secondary-500 text-gray-900 px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-secondary-600 transition-colors"
        >
          Start Chat Demo
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-primary-700 transition-colors"
          onClick={() => window.location.href = '/design-system'}
        >
          View Design System
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-purple-700 transition-colors"
          onClick={() => window.location.href = '/analytics'}
        >
          📊 Analytics Dashboard
        </motion.button>
      </div>
    </motion.div>
  );
}

export default App; 