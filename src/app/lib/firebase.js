// src/app/lib/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBf5JUXVtJdAkyoxA4C2DeieD32E_Gh2HQ",
  authDomain: "question-build.firebaseapp.com",
  projectId: "question-build",
  storageBucket: "question-build.appspot.com",
  messagingSenderId: "540362450773",
  appId: "1:540362450773:web:0ee8f9173b7f5825d71dc",
  measurementId: "G-RSGJZZP3LQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ฟังก์ชันสำหรับบันทึก Quiz โดยเช็คซ้ำจาก Quiz Title
export async function saveQuizToFirebase(quizData) {
  if (!quizData.uuid) {
    throw new Error("QuizData ต้องมี UUID");
  }

  const quizzesRef = collection(db, "quizzes");
  const q = query(quizzesRef, where("title", "==", quizData.title));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // ถ้ามี Quiz ชื่อนี้อยู่แล้ว ให้ถามยืนยันก่อนบันทึกทับ
    const confirmOverwrite = window.confirm("⚠️ มี Quiz ชื่อนี้อยู่แล้ว ต้องการบันทึกทับหรือไม่?");
    if (!confirmOverwrite) return false;

    const existingQuiz = querySnapshot.docs[0];
    await setDoc(doc(db, "quizzes", existingQuiz.id), {
      ...quizData,
      uuid: existingQuiz.id,
    });
    return existingQuiz.id;
  } else {
    await setDoc(doc(db, "quizzes", quizData.uuid), quizData);
    return quizData.uuid;
  }
}
