import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-label">Fullstack Mastery Guide — React, Node, Java, Data Structures & More</div>
      <h1 className="hero-title">
        <span className="word w1">Full Stack</span>
        <span className="word w2">Dev</span>
      </h1>
      <p className="hero-sub">62 comprehensive domains · Deep theory · Live code · Interview ready</p>
      <div className="hero-actions">
        <Link to="/interview-qa" className="hero-link">Browse Interview Q&A</Link>
        <Link to="/auth-masterclass" className="hero-link">Open Auth Masterclass</Link>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-num">62</span>
          <span className="stat-lbl">Domains</span>
        </div>
        <div className="stat">
          <span className="stat-num">500+</span>
          <span className="stat-lbl">Concepts</span>
        </div>
        <div className="stat">
          <span className="stat-num">200+</span>
          <span className="stat-lbl">Code Examples</span>
        </div>
        <div className="stat">
          <span className="stat-num">∞</span>
          <span className="stat-lbl">Learning Path</span>
        </div>
      </div>
      <div className="scroll-hint">scroll to explore ↓</div>
    </section>
  );
}
