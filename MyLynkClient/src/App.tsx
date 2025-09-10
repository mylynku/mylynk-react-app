import React, { lazy, Suspense } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import ApiErrorBoundary from './components/common/ApiErrorBoundary';
import ErrorFallback from './components/common/ErrorFallback';
import GlobalErrorFallback from './components/common/GlobalErrorFallback';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Loading from './components/common/Loading';
import AuthModal from './components/auth/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const HomePage = lazy(() => import('./pages/HomePage') as Promise<{ default: React.ComponentType<any> }>);
const FindLynker = lazy(() => import('./pages/FindLynker') as Promise<{ default: React.ComponentType<any> }>);
const BecomeLynker = lazy(() => import('./pages/BecomeLynker') as Promise<{ default: React.ComponentType<any> }>);
const SafetyPage = lazy(() => import('./pages/SafetyPage') as Promise<{ default: React.ComponentType<any> }>);
const AboutPage = lazy(() => import('./pages/AboutPage') as Promise<{ default: React.ComponentType<any> }>);
const ContactPage = lazy(() => import('./pages/ContactPage') as Promise<{ default: React.ComponentType<any> }>);
const UserProfile = lazy(() => import('./pages/UserProfile') as Promise<{ default: React.ComponentType<any> }>);
const LynkerProfile = lazy(() => import('./pages/LynkerProfile') as Promise<{ default: React.ComponentType<any> }>);
const BookingPage = lazy(() => import('./pages/BookingPage') as Promise<{ default: React.ComponentType<any> }>);
const RazorpayCheckout = lazy(() => import('./pages/RazorpayCheckout') as Promise<{ default: React.ComponentType<any> }>);

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const pageTransition = {
  duration: 0.3
};

function App() {
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authType, setAuthType] = React.useState<'login' | 'signup'>('login');
  const [userType, setUserType] = React.useState<'user' | 'lynker'>('user');
  const location = useLocation();

  const openAuthModal = (type: 'login' | 'signup', userType: 'user' | 'lynker') => {
    setAuthType(type);
    setUserType(userType);
    setAuthModalOpen(true);
  };

  return (
    <ErrorBoundary fallback={<GlobalErrorFallback />} logEndpoint="/logs/global-errors" componentName="App">
      <AuthProvider>
        <Layout openAuthModal={openAuthModal}>
          <ApiErrorBoundary componentName="App">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<Loading variant="progress" fullScreen />}>
                        <HomePage openAuthModal={openAuthModal} />
                      </Suspense>
                    </motion.div>
                  </ErrorBoundary>
                }
              />

              <Route
                path="/find-lynker"
                element={
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<Loading variant="progress" fullScreen />}>
                        <FindLynker />
                      </Suspense>
                    </motion.div>
                  </ErrorBoundary>
                }
              />

              {/* ✅ Move these two inside <Routes> */}
              <Route
                path="/book/:lynkerId"
                element={
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<Loading variant="progress" fullScreen />}>
                        <BookingPage />
                      </Suspense>
                    </motion.div>
                  </ErrorBoundary>
                }
              />

              <Route
                path="/lynker/:lynkerId"
                element={
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<Loading variant="progress" fullScreen />}>
                        <LynkerProfile />
                      </Suspense>
                    </motion.div>
                  </ErrorBoundary>
                }
              />

              <Route
                path="/become-lynker"
                element={
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<Loading variant="progress" fullScreen />}>
                        <BecomeLynker />
                      </Suspense>
                    </motion.div>
                  </ErrorBoundary>
                }
              />

              <Route
                path="/safety"
                element={
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<Loading variant="progress" fullScreen />}>
                        <SafetyPage />
                      </Suspense>
                    </motion.div>
                  </ErrorBoundary>
                }
              />

              <Route
                path="/about"
                element={
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<Loading variant="progress" fullScreen />}>
                        <AboutPage />
                      </Suspense>
                    </motion.div>
                  </ErrorBoundary>
                }
              />

              <Route
                path="/contact"
                element={
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<Loading variant="progress" fullScreen />}>
                        <ContactPage />
                      </Suspense>
                    </motion.div>
                  </ErrorBoundary>
                }
              />

              <Route
                path="/profile"
                element={
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<Loading variant="progress" fullScreen />}>
                        <UserProfile />
                      </Suspense>
                    </motion.div>
                  </ErrorBoundary>
                }
              />

              <Route
                path="/checkout"
                element={
                  <ErrorBoundary fallback={<ErrorFallback />}>
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <Suspense fallback={<Loading variant="progress" fullScreen />}>
                        <RazorpayCheckout />
                      </Suspense>
                    </motion.div>
                  </ErrorBoundary>
                }
              />
            </Routes>
          </AnimatePresence>
          </ApiErrorBoundary>

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            type={authType}
            userType={userType}
          />
        </Layout>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
