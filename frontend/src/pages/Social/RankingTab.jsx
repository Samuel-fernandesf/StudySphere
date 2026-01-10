import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { obterRanking, obterMeuRanking } from '../../services/socialService';

const RankingTab = () => {
    const [ranking, setRanking] = useState([]);
    const [myRanking, setMyRanking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                setLoading(true);
                const [rankingData, myData] = await Promise.all([
                    obterRanking(20),
                    obterMeuRanking()
                ]);
                setRanking(rankingData);
                setMyRanking(myData);
            } catch (error) {
                console.error('Erro ao carregar ranking:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRanking();
    }, []);

    const getPositionIcon = (position) => {
        switch (position) {
            case 1:
                return <Trophy className="position-icon gold" size={24} />;
            case 2:
                return <Medal className="position-icon silver" size={24} />;
            case 3:
                return <Award className="position-icon bronze" size={24} />;
            default:
                return <span className="position-number">{position}</span>;
        }
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
    };

    if (loading) {
        return (
            <div className="ranking-loading">
                <div className="loading-spinner"></div>
                <p>Carregando ranking...</p>
            </div>
        );
    }

    return (
        <div className="ranking-tab">
            {/* My Position Card */}
            {myRanking && (
                <div className="my-ranking-card">
                    <div className="my-ranking-content">
                        <TrendingUp size={24} />
                        <div className="my-ranking-info">
                            <span className="my-position">Sua posição: #{myRanking.position}</span>
                            <span className="my-points">{myRanking.pontos} pontos</span>
                        </div>
                    </div>
                    <p className="ranking-tip">
                        Complete pomodoros, quizzes e interaja na comunidade para subir no ranking!
                    </p>
                </div>
            )}

            {/* Top 3 Podium */}
            {ranking.length >= 3 && (
                <div className="podium">
                    {/* 2nd Place */}
                    <div className="podium-item second">
                        <div className="podium-avatar">{getInitials(ranking[1]?.nome_completo)}</div>
                        <Medal className="podium-icon silver" size={28} />
                        <span className="podium-name">{ranking[1]?.nome_completo}</span>
                        <span className="podium-points">{ranking[1]?.pontos} pts</span>
                    </div>

                    {/* 1st Place */}
                    <div className="podium-item first">
                        <div className="podium-avatar gold">{getInitials(ranking[0]?.nome_completo)}</div>
                        <Trophy className="podium-icon gold" size={32} />
                        <span className="podium-name">{ranking[0]?.nome_completo}</span>
                        <span className="podium-points">{ranking[0]?.pontos} pts</span>
                    </div>

                    {/* 3rd Place */}
                    <div className="podium-item third">
                        <div className="podium-avatar">{getInitials(ranking[2]?.nome_completo)}</div>
                        <Award className="podium-icon bronze" size={24} />
                        <span className="podium-name">{ranking[2]?.nome_completo}</span>
                        <span className="podium-points">{ranking[2]?.pontos} pts</span>
                    </div>
                </div>
            )}

            {/* Full Ranking List */}
            <div className="ranking-list">
                <h3>Ranking Geral</h3>
                {ranking.length === 0 ? (
                    <div className="empty-ranking">
                        <p>Nenhum usuário no ranking ainda.</p>
                    </div>
                ) : (
                    <div className="ranking-items">
                        {ranking.map((user) => (
                            <div
                                key={user.user_id}
                                className={`ranking-item ${user.position <= 3 ? `top-${user.position}` : ''}`}
                            >
                                <div className="ranking-position">
                                    {getPositionIcon(user.position)}
                                </div>
                                <div className="ranking-user">
                                    <div className="ranking-avatar">{getInitials(user.nome_completo)}</div>
                                    <div className="ranking-user-info">
                                        <span className="ranking-name">{user.nome_completo}</span>
                                        <span className="ranking-username">@{user.username}</span>
                                    </div>
                                </div>
                                <div className="ranking-score">
                                    <span className="points-value">{user.pontos}</span>
                                    <span className="points-label">pontos</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RankingTab;
