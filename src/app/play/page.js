"use client";
import { useSearchParams } from 'next/navigation';
import PlayQuiz from './PlayQuiz';

export default function PlayQuizPage() {
  const params = useSearchParams();
  const quizId = params.get('quiz');

  if (!quizId) return <div className="p-4">❌ ไม่พบ Quiz ID</div>;

  return <PlayQuiz quizId={quizId} />;
}
