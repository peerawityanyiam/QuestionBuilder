"use client";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function QuizBuilder({ onSave }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [quizUuid, setQuizUuid] = useState(null);
  const [originalTitle, setOriginalTitle] = useState("");
  const fileInputRef = useRef();

  // โหลด quiz จาก localStorage (ถ้ามี)
  useEffect(() => {
    const stored = localStorage.getItem("myQuiz");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTitle(parsed.title || "");
        setQuestions(parsed.questions || []);
        if (parsed.quizUuid) {
          setQuizUuid(parsed.quizUuid);
          setOriginalTitle(parsed.title || "");
        }
      } catch (error) {
        console.error("Error parsing stored quiz", error);
      }
    }
  }, []);

  // เพิ่มคำถามใหม่ โดยกำหนด Question ID เริ่มต้นเป็น q1, q2, ... (ผู้ใช้สามารถแก้ไขได้)
  const addQuestion = () => {
    const newQuestion = {
      id: `q${questions.length + 1}`,
      text: "",
      choices: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  // อัปเดตฟิลด์ของคำถาม (รวมทั้ง Question ID และ Question Text)
  const updateQuestionField = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  // เพิ่มตัวเลือกในคำถาม (มีฟิลด์ Choice Text, Next ID, Points)
  const addChoice = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].choices.push({ text: "", nextId: "", points: 0 });
    setQuestions(updated);
  };

  // อัปเดตฟิลด์ของตัวเลือก
  const updateChoice = (qIndex, cIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex].choices[cIndex][field] = value;
    setQuestions(updated);
  };

  // ลบคำถาม
  const removeQuestion = (qIndex) => {
    const updated = [...questions];
    updated.splice(qIndex, 1);
    setQuestions(updated);
  };

  // ลบตัวเลือก
  const removeChoice = (qIndex, cIndex) => {
    const updated = [...questions];
    updated[qIndex].choices.splice(cIndex, 1);
    setQuestions(updated);
  };

  // เพิ่ม End State (Success/Failure) โดยกำหนด Question ID เป็น "qwin" หรือ "qdead"
  const addEndState = (success = true) => {
    const endId = success ? "qwin" : "qdead";
    // ตรวจสอบว่า End State นี้มีอยู่แล้วหรือไม่
    if (questions.some((q) => q.id === endId)) {
      alert(`End state "${endId}" already exists.`);
      return;
    }
    const newQuestion = {
      id: endId,
      text: success ? "Success End State" : "Failure End State",
      choices: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  // บันทึก quiz ลง localStorage
  const saveQuiz = () => {
    const quiz = { title, questions, quizUuid };
    localStorage.setItem("myQuiz", JSON.stringify(quiz));
    if (onSave) onSave();
    alert("Quiz saved locally.");
  };

  // ดาวน์โหลด quiz เป็นไฟล์ JSON
  const downloadQuiz = () => {
    const quiz = { title, questions, quizUuid };
    const data = JSON.stringify(quiz, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "my-quiz"}.json`;
    a.click();
  };

  // อัปโหลด quiz จากไฟล์ JSON
  const uploadQuiz = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          setTitle(parsed.title || "");
          setQuestions(parsed.questions || []);
          if (parsed.quizUuid) {
            setQuizUuid(parsed.quizUuid);
            setOriginalTitle(parsed.title || "");
          }
          alert("Quiz loaded successfully.");
        } catch {
          alert("Invalid file.");
        }
      };
      reader.readAsText(file);
    }
  };

  // บันทึก quiz ลงบน Cloud (Firebase)
  // ถ้า quiz ยังไม่มี UUID หรือชื่อ quiz เปลี่ยน ให้ generate ใหม่
  const saveToCloud = async () => {
    if (!title) return alert("Please set a Quiz title before saving to Cloud.");
    let currentUuid = quizUuid;
    if (!currentUuid || title !== originalTitle) {
      currentUuid = uuidv4();
    }
    try {
      await setDoc(doc(db, "quizzes", currentUuid), { title, questions, quizUuid: currentUuid });
      const url = `${window.location.origin}/play?quiz=${encodeURIComponent(currentUuid)}`;
      await navigator.clipboard.writeText(url);
      setQuizUuid(currentUuid);
      setOriginalTitle(title);
      localStorage.setItem("myQuiz", JSON.stringify({ title, questions, quizUuid: currentUuid }));
      alert("Cloud save successful! Link copied:\n" + url);
    } catch (e) {
      alert("Cloud save failed.");
      console.error(e);
    }
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: "#f0f4f8", minHeight: "100vh", padding: "1rem" }}>
      {/* Header */}
      <div style={{ background: "#1a1a1a", color: "white", padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "600" }}>Clinical Decision Simulator</h1>
          <p style={{ margin: "0.5rem 0 0 0", opacity: 0.8, fontSize: "1rem" }}>Create and practice clinical decision-making scenarios</p>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 1.5rem 6rem 1.5rem", background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        {/* Quiz Title Input */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", fontSize: "1rem", color: "#333" }}>Quiz Title</label>
          <input type="text" placeholder="Enter quiz title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "0.7rem", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }} />
        </div>

        {/* Display Quiz UUID if available */}
        {quizUuid && (
          <div style={{ marginBottom: "1rem", padding: "0.5rem", background: "#e2e8f0", borderRadius: "4px" }}>
            <strong>Quiz UUID:</strong> {quizUuid}
          </div>
        )}

        {/* Questions Section */}
        {questions.map((q, qIndex) => (
          <div key={qIndex} style={{ border: "1px solid #ddd", padding: "1rem", marginBottom: "1rem", borderRadius: "4px" }}>
            <div style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <label style={{ marginRight: "0.5rem" }}>Question ID:</label>
                <input type="text" value={q.id} onChange={(e) => updateQuestionField(qIndex, "id", e.target.value)} style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px" }} />
              </div>
              {q.id !== "qwin" && q.id !== "qdead" && (
                <button onClick={() => removeQuestion(qIndex)} style={{ background: "transparent", color: "#f56565", border: "none", cursor: "pointer", fontSize: "1rem" }}>
                  🗑️
                </button>
              )}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Question Text:</label>
              <textarea value={q.text} onChange={(e) => updateQuestionField(qIndex, "text", e.target.value)} style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px", minHeight: "80px", boxSizing: "border-box" }} />
            </div>
            {q.id !== "qwin" && q.id !== "qdead" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label style={{ fontWeight: "600", fontSize: "1rem", color: "#333" }}>Choices</label>
                  <button onClick={() => addChoice(qIndex)} style={{ background: "#f0f4f8", color: "#333", border: "1px solid #ddd", padding: "0.4rem 0.8rem", borderRadius: "4px", cursor: "pointer" }}>
                    + Add Choice
                  </button>
                </div>
                {q.choices.map((choice, cIndex) => (
                  <div key={cIndex} style={{ display: "grid", gridTemplateColumns: "1fr 100px 80px auto", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                    <input type="text" placeholder="Choice Text" value={choice.text} onChange={(e) => updateChoice(qIndex, cIndex, "text", e.target.value)} style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px" }} />
                    <input type="text" placeholder="Next ID" value={choice.nextId} onChange={(e) => updateChoice(qIndex, cIndex, "nextId", e.target.value)} style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "monospace" }} />
                    <input type="number" placeholder="Points" value={choice.points} onChange={(e) => updateChoice(qIndex, cIndex, "points", Number(e.target.value))} style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px" }} />
                    <button onClick={() => removeChoice(qIndex, cIndex)} style={{ background: "transparent", border: "none", color: "#f56565", cursor: "pointer", fontSize: "1rem" }}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: "0.7rem", marginBottom: "1rem" }}>
          <button onClick={addQuestion} style={{ padding: "0.5rem 1rem", background: "#4a5568", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            + Add Question
          </button>
          <button onClick={() => addEndState(true)} style={{ padding: "0.5rem 1rem", background: "white", color: "#38a169", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer" }}>
            + Add Success (qwin)
          </button>
          <button onClick={() => addEndState(false)} style={{ padding: "0.5rem 1rem", background: "white", color: "#e53e3e", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer" }}>
            + Add Failure (qdead)
          </button>
        </div>
      </div>

      {/* Fixed Buttons */}
      <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", display: "flex", flexDirection: "column", gap: "0.7rem", zIndex: "999" }}>
        <button onClick={saveQuiz} style={{ background: "#4a5568", color: "white", padding: "0.5rem 1rem", border: "none", borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", cursor: "pointer" }}>
          💾 Save Locally
        </button>
        <button onClick={downloadQuiz} style={{ background: "white", padding: "0.5rem 1rem", border: "1px solid #ddd", borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", cursor: "pointer" }}>
          ⬇ Download
        </button>
        <button onClick={saveToCloud} style={{ background: "white", padding: "0.5rem 1rem", border: "1px solid #ddd", borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", cursor: "pointer" }}>
          ☁️ Save to Cloud
        </button>
        <button onClick={() => fileInputRef.current?.click()} style={{ background: "white", padding: "0.5rem 1rem", border: "1px solid #ddd", borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ⬆ Upload
          <input type="file" ref={fileInputRef} accept="application/json" onChange={uploadQuiz} style={{ display: "none" }} />
        </button>
      </div>
    </div>
  );
}
