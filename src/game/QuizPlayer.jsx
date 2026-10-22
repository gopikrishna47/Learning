import React, { useState } from 'react';
import { highlightJs } from '../utils/highlight.js';
import Rich from './Rich.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** Steps through the questions of a quiz level. Calls onFinish({ correct, total, passed }). */
export default function QuizPlayer({ level, onFinish }) {
  const total = level.questions.length;
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);

  const question = level.questions[index];
  const answered = picked !== null;
  const isRight = answered && picked === question.answer;

  const choose = (option) => {
    if (answered) return;
    setPicked(option);
    if (option === question.answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (index + 1 < total) { setIndex(index + 1); setPicked(null); return; }
    const need = Math.ceil(total * 0.66);
    onFinish({ correct, total, passed: correct >= need });
  };

  return (
    <div className="gm-quiz">
      <div className="gm-quiz-progress" aria-label={`Question ${index + 1} of ${total}`}>
        {level.questions.map((_, i) => (
          <span key={i} className={`gm-pip ${i < index ? 'done' : ''} ${i === index ? 'now' : ''}`} />
        ))}
        <span className="gm-quiz-count">Question {index + 1} / {total}</span>
      </div>

      <h3 className="gm-quiz-q"><Rich text={question.q} /></h3>
      {question.code && (
        <pre className="gm-quiz-code"><code dangerouslySetInnerHTML={{ __html: highlightJs(question.code) }} /></pre>
      )}

      <div className="gm-options" role="group" aria-label="Answers">
        {question.options.map((option, i) => {
          let state = '';
          if (answered && i === question.answer) state = 'right';
          else if (answered && i === picked) state = 'wrong';
          return (
            <button key={option} className={`gm-option ${state}`} onClick={() => choose(i)} disabled={answered && state === ''}>
              <span className="gm-option-key">{LETTERS[i]}</span>
              <span><Rich text={option} /></span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`gm-explain ${isRight ? 'right' : 'wrong'}`} role="status">
          <strong>{isRight ? '✅ Correct!' : '❌ Not quite.'}</strong>
          <p><Rich text={question.explain} /></p>
          <button className="gm-btn primary" onClick={next}>{index + 1 < total ? 'Next question →' : 'See result'}</button>
        </div>
      )}
    </div>
  );
}
