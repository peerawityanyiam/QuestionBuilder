"use client";
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';

export default function PlayQuiz({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchQuiz() {
      const quizRef = doc(db, 'quizzes', quizId);
      const quizSnap = await getDoc(quizRef);
      if (quizSnap.exists()) setQuiz(quizSnap.data());
    }
    fetchQuiz();
  }, [quizId]);

  const handleAnswer = (questionIndex, choice) => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = choice;
    setAnswers(updatedAnswers);
  };

  const submitQuiz = async () => {
    let totalPoints = 0;
    let finalResult = 'qwin';
    answers.forEach((choice) => {
      totalPoints += choice.points;
      if (choice.result === 'qdead') finalResult = 'qdead';
    });
    const resultData = {
      quizId,
      totalPoints,
      finalResult,
      submittedAt: new Date(),
    };
    await addDoc(collection(db, 'quiz-results'), resultData);
    setResult(resultData);
  };

  if (!quiz) return <div className="p-4">กำลังโหลด Quiz...</div>;

  if (result) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold">🎯 ผลลัพธ์ Quiz</h2>
        <p>คะแนนรวม: {result.totalPoints}</p>
        <p className="text-lg">
          สถานะ: {result.finalResult === 'qwin' ? '🏆 รอดชีวิต' : '💀 เสียชีวิต'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{quiz.title}</h2>
      {quiz.questions.map((q, i) => (
        <div key={i} className="mb-4">
          <p className="font-semibold">{i + 1}. {q.question}</p>
          {q.choices.map((choice, idx) => (
            <button
              key={idx}
              className={`m-1 p-2 border rounded ${
                answers[i]?.text === choice.text ? 'bg-blue-200' : 'bg-gray-100'
              }`}
              onClick={() => handleAnswer(i, choice)}
            >
              {choice.text}
            </button>
          ))}
        </div>
      ))}
      <button
        className="bg-green-500 text-white p-2 rounded"
        onClick={submitQuiz}
      >
        ส่งคำตอบ
      </button>
    </div>
  );
}
