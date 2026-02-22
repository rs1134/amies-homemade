import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          color: '#4A3728', 
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#FFF8EE',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Something went wrong.</h1>
          <p style={{ marginBottom: '2rem', opacity: 0.7 }}>The application encountered an unexpected error.</p>
          <pre style={{ 
            padding: '20px', 
            backgroundColor: 'rgba(0,0,0,0.05)', 
            borderRadius: '10px',
            maxWidth: '100%',
            overflow: 'auto',
            fontSize: '0.8rem'
          }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '12px 24px',
              backgroundColor: '#F04E4E',
              color: 'white',
              border: 'none',
              borderRadius: '999px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Try Refreshing
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
