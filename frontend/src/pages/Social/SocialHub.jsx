import React, { useState } from 'react';
import { Users, MessageSquare, FileQuestion, Trophy } from 'lucide-react';
import CommunityTab from './CommunityTab';
import RankingTab from './RankingTab';
import './SocialHub.css';

const TABS = [
    { id: 'community', label: 'Comunidade', icon: Users },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'quizzes', label: 'Questionários', icon: FileQuestion },
    { id: 'ranking', label: 'Ranking', icon: Trophy }
];

const SocialHub = () => {
    const [activeTab, setActiveTab] = useState('community');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'community':
                return <CommunityTab />;
            case 'chats':
                return (
                    <div className="tab-placeholder">
                        <MessageSquare size={48} strokeWidth={1.5} />
                        <h3>Chats</h3>
                        <p>Acesse seus grupos de estudo pelo menu lateral.</p>
                        <a href="/chats" className="redirect-link">Ir para Chats →</a>
                    </div>
                );
            case 'quizzes':
                return (
                    <div className="tab-placeholder">
                        <FileQuestion size={48} strokeWidth={1.5} />
                        <h3>Questionários</h3>
                        <p>Crie e responda questionários para testar seus conhecimentos.</p>
                        <a href="/quiz" className="redirect-link">Ir para Questionários →</a>
                    </div>
                );
            case 'ranking':
                return <RankingTab />;
            default:
                return <CommunityTab />;
        }
    };

    return (
        <div className="social-hub">
            {/* Header */}
            <div className="social-header">
                <div>
                    <h1>Centro Social</h1>
                    <p>Conecte-se, aprenda e compete com seus colegas</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default SocialHub;
