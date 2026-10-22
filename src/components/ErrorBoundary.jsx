import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info);
  }

  componentDidUpdate(prevProps) {
    // Recover automatically when the user navigates elsewhere
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main style={{ padding: 'calc(var(--header-h, 64px) + 48px) 24px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: 12 }}>Something went wrong on this page</h1>
        <p style={{ color: '#7070a0', marginBottom: 20 }}>{String(this.state.error?.message || this.state.error)}</p>
        <button className="btn-checklist" onClick={() => window.location.assign('/')}>Back to home</button>
      </main>
    );
  }
}
