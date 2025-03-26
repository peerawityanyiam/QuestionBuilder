"use client";
import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ViewResults() {
  const [quizId, setQuizId] = useState('');
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);

  const fetchResults = async () => {
    if (!quizId) {
      alert('โปรดกรอก Quiz ID');
      return;
    }

    const resultsRef = collection(db, 'quiz-results');
    const q = query(resultsRef, where('quizId', '==', quizId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert('ไม่พบผลลัพธ์สำหรับ Quiz ID นี้');
      setResults([]);
      setSummary(null);
      return;
    }

    let totalScore = 0;
    let winCount = 0;
    let deadCount = 0;

    const fetchedResults = snapshot.docs.map(doc => {
      const data = doc.data();
      totalScore += data.totalPoints;
      if (data.finalResult === 'qwin') winCount++;
      else deadCount++;
      return data;
    });

    setResults(fetchedResults);
    setSummary({
      averageScore: (totalScore / fetchedResults.length).toFixed(2),
      totalParticipants: fetchedResults.length,
      winCount,
      deadCount,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">📊 ผลคะแนนนักเรียน</h1>

      <input
        type="text"
        placeholder="กรอก Quiz ID"
        value={quizId}
        onChange={(e) => setQuizId(e.target.value)}
        className="border p-2 rounded my-4 w-full"
      />

      <button
        onClick={fetchResults}
        className="bg-green-500 text-white p-2 rounded shadow"
      >
        🔍 ดูผลคะแนน
      </button>

      {summary && (
        <div className="mt-6 p-4 bg-gray-100 rounded shadow">
          <p><strong>จำนวนผู้ทำ Quiz:</strong> {summary.totalParticipants}</p>
          <p><strong>คะแนนเฉลี่ย:</strong> {summary.averageScore}</p>
          <p><strong>🏆 รอดชีวิต:</strong> {summary.winCount} คน</p>
          <p><strong>💀 เสียชีวิต:</strong> {summary.deadCount} คน</p>
        </div>
      )}

      {results.length > 0 && (
        <table className="mt-4 table-auto w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ลำดับ</th>
              <th className="p-2">คะแนน</th>
              <th className="p-2">สถานะ</th>
              <th className="p-2">วันที่ทำ</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res, index) => (
              <tr key={index} className="text-center border-b">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{res.totalPoints}</td>
                <td className="p-2">
                  {res.finalResult === 'qwin' ? '🏆 รอดชีวิต' : '💀 เสียชีวิต'}
                </td>
                <td className="p-2">
                  {new Date(res.submittedAt.seconds * 1000).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
