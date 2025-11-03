import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";



export default function Dashboard(){
    useEffect(() => {
      // Verifica se o script do Lucide foi carregado no index.html
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }, []);
  return (
    <div className="flex h-screen bg-gray-100">

        {/* Início: Sidebar (Menu Lateral) */}
        {/* No React, este seria um componente <Sidebar /> */}
        <nav className="w-64 bg-sidebar text-white p-5 flex flex-col shrink-0">
            {/* Logo */}
            <div className="flex items-center space-x-2 mb-10">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div> {/* Placeholder do logo */}
                <span className="text-xl font-bold">StudySphere</span>
            </div>
            
            {/* Links de Navegação */}
            <ul className="flex flex-col space-y-2">
                <li>
                    <a href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-sidebar-active">
                        <i data-lucide="layout-dashboard" className="w-5 h-5"></i>
                        <span className="font-medium">Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sidebar-hover transition-colors">
                        <i data-lucide="book-open" className="w-5 h-5"></i>
                        <span className="font-medium">Matérias</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sidebar-hover transition-colors">
                        <i data-lucide="calendar" className="w-5 h-5"></i>
                        <span className="font-medium">Calendário</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sidebar-hover transition-colors">
                        <i data-lucide="trending-up" className="w-5 h-5"></i>
                        <span className="font-medium">Progresso</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sidebar-hover transition-colors">
                        <i data-lucide="message-square" className="w-5 h-5"></i>
                        <span className="font-medium">Chats</span>
                    </a>
                </li>
                <li>
                    <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sidebar-hover transition-colors">
                        <i data-lucide="file-question" className="w-5 h-5"></i>
                        <span className="font-medium">Questionários</span>
                    </a>
                </li>
            </ul>

            {/* Seção de Configurações (na base) */}
            <div className="mt-auto">
                <ul className="flex flex-col space-y-2">
                     <li>
                        <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sidebar-hover transition-colors">
                            <i data-lucide="settings" className="w-5 h-5"></i>
                            <span className="font-medium">Configurações</span>
                        </a>
                    </li>
                     <li>
                        <a href="#" className="flex items-center space-x-3 p-2 rounded-lg">
                            <span className="text-xs text-gray-400">StudySphere v1.0</span>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
        {/* Fim: Sidebar */}

        {/* Início: Conteúdo Principal */}
        {/* No React, este seria seu <main> ou <Outlet> */}
        <main className="flex-1 p-8 overflow-y-auto">

            {/* Cabeçalho do Conteúdo */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Olá, João!</h1>
                    <p className="text-gray-500">Vamos continuar estudando hoje?</p>
                </div>
                <button className="bg-blue-600 text-white flex items-center space-x-2 px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    <i data-lucide="plus" className="w-5 h-5"></i>
                    <span>Nova Tarefa</span>
                </button>
            </header>

            {/* Grid de Estatísticas (Cards Superiores) */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card: Tempo Hoje */}
                <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
                    <div>
                        <span className="text-sm text-gray-500">Tempo Hoje</span>
                        <p className="text-2xl font-bold text-gray-800">2h 30min</p>
                    </div>
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                        <i data-lucide="clock" className="w-6 h-6"></i>
                    </div>
                </div>
                {/* Card: Tarefas Concluídas */}
                <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
                    <div>
                        <span className="text-sm text-gray-500">Tarefas Concluídas</span>
                        <p className="text-2xl font-bold text-gray-800">3</p>
                    </div>
                    <div className="bg-green-100 text-green-600 p-3 rounded-full">
                        <i data-lucide="check-circle" className="w-6 h-6"></i>
                    </div>
                </div>
                {/* Card: Sequência */}
                <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
                    <div>
                        <span className="text-sm text-gray-500">Sequência</span>
                        <p className="text-2xl font-bold text-gray-800">7 dias</p>
                    </div>
                    <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
                        <i data-lucide="flame" className="w-6 h-6"></i>
                    </div>
                </div>
                {/* Card: Meta Semanal */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Meta Semanal</span>
                        <div className="bg-gray-100 text-gray-600 p-3 rounded-full -m-2">
                             <i data-lucide="calendar-check" className="w-5 h-5"></i>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 mb-2">65%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        {/* CSS inline em React precisa de chaves duplas {} {{}} */}
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                </div>
            </section>

            {/* Grid de Conteúdo Principal (Cards Inferiores) */}
            <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                {/* Card: Suas Matérias (Ocupa 2 colunas no XL) */}
                <div className="bg-white p-6 rounded-xl shadow-md xl:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Suas Matérias</h2>
                        <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Ver Todas</a>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Progresso geral dos estudos</p>
                    
                    <div className="space-y-4">
                        {/* Item Matéria */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <i data-lucide="percent" className="w-5 h-5 text-blue-600"></i>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">Matemática</span>
                                    <span className="text-sm font-bold text-gray-800">75%</span>
                                </div>
                                <p className="text-sm text-gray-500 -mt-1">Exercícios Cap. 5</p>
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2 ml-3">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        {/* Item Matéria */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <i data-lucide="flask-conical" className="w-5 h-5 text-green-600"></i>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">Física</span>
                                    <span className="text-sm font-bold text-gray-800">60%</span>
                                D</div>
                                <p className="text-sm text-gray-500 -mt-1">Relatório Lab</p>
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2 ml-3">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                        {/* Item Matéria */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <i data-lucide="beaker" className="w-5 h-5 text-yellow-600"></i>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">Química</span>
                                    <span className="text-sm font-bold text-gray-800">85%</span>
                                </div>
                                <p className="text-sm text-gray-500 -mt-1">Revisão Orgânica</p>
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2 ml-3">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        {/* Item Matéria */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <i data-lucide="landmark" className="w-5 h-5 text-red-600"></i>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">História</span>
                                    <span className="text-sm font-bold text-gray-800">40%</span>
                                </div>
                                <p className="text-sm text-gray-500 -mt-1">Leitura Cap. 8</p>
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2 ml-3">
                                <div className="bg-red-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card: Lista de Tarefas (Ocupa 2 colunas no XL) */}
                <div className="bg-white p-6 rounded-xl shadow-md xl:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Lista de Tarefas</h2>
                        <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Ocultar Concluídas</a>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">3 pendentes, 1 concluída</p>
                    
                    {/* Adicionar Tarefa */}
                    <div className="flex space-x-2 mb-4">
                        <input type="text" placeholder="Adicionar nova tarefa..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <i data-lucide="plus" className="w-5 h-5"></i>
                        </button>
                    </div>

                    {/* Lista de Tarefas */}
                    <div className="space-y-3">
                        {/* Item Tarefa */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <div>
                                    <span className="font-medium text-gray-800">Revisar capítulo 5 de Matemática</span>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">alta</span>
                                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">estudos</span>
                                        <span className="text-xs text-gray-500">22/10/2025</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-red-500">
                                <i data-lucide="x" className="w-4 h-4"></i>
                            </button>
                        </div>
                        {/* Item Tarefa */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <div>
                                    <span className="font-medium text-gray-800">Fazer exercícios de Física</span>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">média</span>
                                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">estudos</span>
                                        <span className="text-xs text-gray-500">22/10/2025</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-red-500">
                                <i data-lucide="x" className="w-4 h-4"></i>
                            </button>
                        </div>
                        {/* Item Tarefa */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <div>
                                    <span className="font-medium text-gray-800">Ler artigo de História</span>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">baixa</span>
                                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">estudos</span>
                                        <span className="text-xs text-gray-500">22/10/2025</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-red-500">
                                <i data-lucide="x" className="w-4 h-4"></i>
                            </button>
                        </div>
                        {/* Item Tarefa */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <div>
                                    <span className="font-medium text-gray-800">Organizar agenda da semana</span>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">média</span>
                                        <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">pessoal</span>
                                        <span className="text-xs text-gray-500">22/10/2025</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-red-500">
                                <i data-lucide="x" className="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                    
                    {/* Rodapé do Card de Tarefas */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-500">Total: 4 Tarefas</span>
                            <span className="font-medium text-gray-700">Progresso: 25%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Card: Próximas Tarefas (Ocupa 1 coluna no XL) */}
                <div className="bg-white p-6 rounded-xl shadow-md xl:col-span-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Próximas Tarefas</h2>
                        <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Ver Calendário</a>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                        <i data-lucide="bell" className="w-4 h-4 text-gray-400"></i>
                        <span>Não esqueça desses compromissos</span>
                    </div>

                    <div className="space-y-5">
                        {/* Item Próxima Tarefa */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-gray-800">Prova de Matemática</p>
                                <p className="text-sm text-gray-500">Matemática</p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                                <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">alta</span>
                                <p className="text-sm text-gray-500 mt-1">24/10/2025</p>
                            </div>
                        </div>
                        {/* Item Próxima Tarefa */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-gray-800">Trabalho de História</p>
                                <p className="text-sm text-gray-500">História</p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">média</span>
                                <p className="text-sm text-gray-500 mt-1">26/10/2025</p>
                            </div>
                        </div>
                        {/* Item Próxima Tarefa */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-gray-800">Exercícios de Física</p>
                                <p className="text-sm text-gray-500">Física</p>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">baixa</span>
                                <p className="text-sm text-gray-500 mt-1">29/10/2025</p>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </main>
        {/* Fim: Conteúdo Principal */}

    </div>
  );
}
