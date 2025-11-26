import React from "react";
import useFetch from "../../hooks/useFetch";
import { listarQuizzes } from "../../services/quizService";
import { Link } from "react-router-dom";

export default function QuizList() {
  const { data } = useFetch(listarQuizzes, []);
  return (
    <main className="container">
        <h2>Quizzes</h2>
        {data && data.map(q => (
          <div key={q.id} style={{ background:"white", padding:12, borderRadius:8, marginBottom:8 }}>
            <strong>{q.titulo}</strong>
            <div><Link to={`/quiz/${q.id}`}>Jogar</Link></div>
          </div>
        ))}
      </main>
  );
}
