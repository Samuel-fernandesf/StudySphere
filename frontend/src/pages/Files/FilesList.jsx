import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    // Exemplo de requisição: substitua pela API real
    // fetch('/api/subjects')
    //   .then(res => res.json())
    //   .then(data => setSubjects(data));
  }, []);

  const handleCreateSubject = () => {
    // Exemplo de envio de nova disciplina
    // fetch('/api/subjects', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ title: 'Nova Disciplina' })
    // });
  };

  return (
    <>
    <Sidebar />
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Minhas Matérias</h1>
          <p className="text-sm text-gray-500">Organize seus estudos por disciplina</p>
        </div>
        <button
          onClick={handleCreateSubject}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          + Nova Disciplina
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-3">
              <span className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: subject.color }}></span>
              <div>
                <h3 className="text-gray-800 font-semibold text-lg">{subject.title}</h3>
                <p className="text-sm text-gray-400">{subject.subtitle}</p>
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-500 mt-4">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M8 2h6l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2z" /></svg>
                {subject.docs} Docs
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M10 14a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 6.93" /><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M14 10a5 5 0 0 0-7.07 0L5.52 11.41a5 5 0 0 0 7.07 7.07L14 17.07" /></svg>
                {subject.links} Links
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M16 4h-8a2 2 0 0 0-2 2v12" /><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M8 8h8" /></svg>
                {subject.notes} Notas
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">{subject.updated}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}