import Hero from '../components/Hero.jsx';
import Navigation from '../components/Navigation.jsx';
import ReactTopics from '../components/categories/ReactTopics.jsx';
import JavaScriptTopics from '../components/categories/JavaScriptTopics.jsx';
import NodeJSTopics from '../components/categories/NodeJSTopics.jsx';
import JavaTopics from '../components/categories/JavaTopics.jsx';
import DSATopics from '../components/categories/DSATopics.jsx';
import SystemDesignTopics from '../components/categories/SystemDesignTopics.jsx';
import BackToTop from '../components/BackToTop.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';

export default function HomePage({
  filter,
  onFilterChange,
}) {
  return (
    <>
      <Hero />

      <main id="main-content">
        <AnimatedSection delay={60}>
          <Navigation filter={filter} onFilterChange={onFilterChange} />
        </AnimatedSection>

        <AnimatedSection delay={80}><ReactTopics /></AnimatedSection>
        <AnimatedSection delay={100}><JavaScriptTopics /></AnimatedSection>
        <AnimatedSection delay={120}><NodeJSTopics /></AnimatedSection>
        <AnimatedSection delay={140}><JavaTopics /></AnimatedSection>
        <AnimatedSection delay={160}><DSATopics /></AnimatedSection>
        <AnimatedSection delay={180}><SystemDesignTopics /></AnimatedSection>
      </main>

      <BackToTop />
    </>
  );
}
