import React, { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Send, Trash2 } from 'lucide-react';
import { listarPosts, criarPost, curtirPost, deletarPost, listarComentarios, adicionarComentario } from '../../services/socialService';
import { listarMaterias } from '../../services/subjectService';
import { useAuthContext } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';

const CommunityTab = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [materias, setMaterias] = useState([]);
    const [posting, setPosting] = useState(false);
    const [expandedComments, setExpandedComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

    const { usuario } = useAuthContext();
    const { showAlert, showConfirm } = useModal();

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await listarPosts(1, 50);
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();

        const carregarMaterias = async () => {
            try {
                const data = await listarMaterias();
                setMaterias(data);
            } catch (error) {
                console.error('Erro ao carregar matérias:', error);
            }
        };
        carregarMaterias();
    }, [fetchPosts]);

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;

        setPosting(true);
        try {
            await criarPost(newPostContent, selectedSubject || null);
            setNewPostContent('');
            setSelectedSubject('');
            await fetchPosts();
            showAlert('Post publicado com sucesso!', 'success');
        } catch (error) {
            showAlert('Erro ao publicar post', 'error');
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const result = await curtirPost(postId);
            setPosts(prev => prev.map(post =>
                post.id === postId
                    ? { ...post, liked_by_user: result.liked, likes_count: result.likes_count }
                    : post
            ));
        } catch (error) {
            console.error('Erro ao curtir:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        const confirmed = await showConfirm('Tem certeza que deseja deletar este post?', 'Deletar Post', 'warning');
        if (!confirmed) return;

        try {
            await deletarPost(postId);
            await fetchPosts();
            showAlert('Post deletado', 'success');
        } catch (error) {
            showAlert('Erro ao deletar post', 'error');
        }
    };

    const toggleComments = async (postId) => {
        if (expandedComments[postId]) {
            setExpandedComments(prev => ({ ...prev, [postId]: null }));
        } else {
            try {
                const data = await listarComentarios(postId);
                setExpandedComments(prev => ({ ...prev, [postId]: data.comments || [] }));
            } catch (error) {
                console.error('Erro ao carregar comentários:', error);
            }
        }
    };

    const handleAddComment = async (postId) => {
        const content = commentInputs[postId]?.trim();
        if (!content) return;

        try {
            const result = await adicionarComentario(postId, content);
            setExpandedComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), result.comment]
            }));
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            setPosts(prev => prev.map(post =>
                post.id === postId
                    ? { ...post, comments_count: post.comments_count + 1 }
                    : post
            ));
        } catch (error) {
            showAlert('Erro ao adicionar comentário', 'error');
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}m atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        return `${diffDays}d atrás`;
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
    };

    return (
        <div className="community-tab">
            {/* Create Post Section */}
            <div className="create-post-card">
                <div className="create-post-header">
                    <div className="user-avatar">{getInitials(usuario?.nome_completo)}</div>
                    <textarea
                        placeholder="Compartilhe seus estudos, dúvidas ou conquistas..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={3}
                    />
                </div>
                <div className="create-post-footer">
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="subject-select-post"
                    >
                        <option value="">Selecionar matéria (opcional)</option>
                        {materias.map(mat => (
                            <option key={mat.id} value={mat.id}>{mat.name}</option>
                        ))}
                    </select>
                    <button
                        className="btn-publish"
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || posting}
                    >
                        {posting ? 'Publicando...' : 'Publicar'}
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="posts-feed">
                {loading ? (
                    <div className="loading-posts">Carregando posts...</div>
                ) : posts.length === 0 ? (
                    <div className="empty-posts">
                        <p>Nenhum post ainda. Seja o primeiro a compartilhar!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="post-card">
                            <div className="post-header">
                                <div className="post-author">
                                    <div className="user-avatar">{getInitials(post.user?.nome_completo)}</div>
                                    <div className="author-info">
                                        <span className="author-name">{post.user?.nome_completo}</span>
                                        <div className="post-meta">
                                            {post.subject && (
                                                <span className="subject-tag">{post.subject.name}</span>
                                            )}
                                            <span className="post-time">{formatTimeAgo(post.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                {usuario && post.user_id === parseInt(usuario.id) && (
                                    <button
                                        className="btn-post-menu"
                                        onClick={() => handleDeletePost(post.id)}
                                        title="Deletar post"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="post-content">
                                <p>{post.content}</p>
                            </div>

                            <div className="post-actions">
                                <button
                                    className={`action-btn ${post.liked_by_user ? 'liked' : ''}`}
                                    onClick={() => handleLike(post.id)}
                                >
                                    <Heart size={18} fill={post.liked_by_user ? 'currentColor' : 'none'} />
                                    <span>{post.likes_count}</span>
                                </button>
                                <button
                                    className="action-btn"
                                    onClick={() => toggleComments(post.id)}
                                >
                                    <MessageCircle size={18} />
                                    <span>{post.comments_count}</span>
                                </button>
                                <button className="action-btn">
                                    <Share2 size={18} />
                                    <span>Compartilhar</span>
                                </button>
                                <button className="action-btn bookmark">
                                    <Bookmark size={18} />
                                </button>
                            </div>

                            {/* Comments Section */}
                            {expandedComments[post.id] && (
                                <div className="comments-section">
                                    <div className="comments-list">
                                        {expandedComments[post.id].map(comment => (
                                            <div key={comment.id} className="comment-item">
                                                <div className="comment-avatar">{getInitials(comment.user?.nome_completo)}</div>
                                                <div className="comment-content">
                                                    <span className="comment-author">{comment.user?.nome_completo}</span>
                                                    <p>{comment.content}</p>
                                                    <span className="comment-time">{formatTimeAgo(comment.created_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="add-comment">
                                        <input
                                            type="text"
                                            placeholder="Escreva um comentário..."
                                            value={commentInputs[post.id] || ''}
                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                        />
                                        <button onClick={() => handleAddComment(post.id)}>
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommunityTab;
