"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">🏥 Quiz Builder</h1>
        <div className="flex gap-4 justify-center">
          <Link href="/quiz-builder">
            <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
              🛠️ สร้าง Quiz
            </button>
          </Link>
          <Link href="/view-results">
            <button className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600">
              📊 ดูผลคะแนน
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
