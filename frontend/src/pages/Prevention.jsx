import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, 
    TrendingUp, 
    Calendar, 
    ArrowLeft,
    Heart,
    Activity,
    AlertCircle
} from 'lucide-react';

const Prevention = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { prevention, riskLevel } = location.state || {};

    useEffect(() => {
        if (!prevention) {
            navigate('/dashboard');
        }
    }, [prevention, navigate]);

    if (!prevention) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="prevention-page"
        >
            <div className="app-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="minimize-btn"
                        style={{ width: '40px', height: '40px' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="gradient-text font-heading" style={{ fontSize: '2rem' }}>Prevention & Lifestyle Roadmap</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Personalized Intervention Strategy based on AI Clinical Findings</p>
                    </div>
                </div>
                
                <div className={`glass-panel risk-summary-badge ${riskLevel}`}>
                    <ShieldCheck size={18} />
                    <span>Clinical Risk: {riskLevel}</span>
                </div>
            </div>

            <div className="prevention-layout" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Hero Section */}
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)' }}>
                    <div className="logo-badge" style={{ width: 80, height: 80, margin: '0 auto 1.5rem' }}>
                        <Heart size={40} className="pulse-animation" />
                    </div>
                    <h3 className="font-heading" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Targeted Cardiovascular Reversal</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.8' }}>
                        Based on your retinal vascular biomarkers, we have developed a specialized roadmap to mitigate 
                        systemic risk and improve your micro-circulatory health.
                    </p>
                </div>

                <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {/* Lifestyle Changes */}
                    <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid var(--success)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <TrendingUp color="var(--success)" />
                            <h4 className="font-heading" style={{ fontSize: '1.2rem' }}>Clinical Recommendations</h4>
                        </div>
                        <ul className="prevention-list">
                            {prevention.tips.map((tip, idx) => (
                                <motion.li 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    style={{ 
                                        padding: '1rem', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        borderRadius: '12px',
                                        marginBottom: '0.75rem',
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <div style={{ 
                                        marginTop: '4px',
                                        width: '6px', 
                                        height: '6px', 
                                        borderRadius: '50%', 
                                        background: tip.includes('Marker Alert') ? '#ff3d00' : 'var(--success)',
                                        boxShadow: `0 0 10px ${tip.includes('Marker Alert') ? '#ff3d00' : 'var(--success)'}`
                                    }}></div>
                                    <span style={{ color: tip.includes('Marker Alert') ? '#ff7d5c' : 'var(--text-vibrant)', fontSize: '0.95rem' }}>
                                        {tip}
                                    </span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* 30-Day Plan */}
                    <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Calendar color="var(--accent-primary)" />
                            <h4 className="font-heading" style={{ fontSize: '1.2rem' }}>30-Day Clinical Protocol</h4>
                        </div>
                        
                        <div className="protocol-container">
                            {prevention.plan30Day.split('. ').map((step, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    gap: '1.5rem', 
                                    marginBottom: '1.5rem',
                                    position: 'relative'
                                }}>
                                    <div className="step-count">{idx + 1}</div>
                                    <div style={{ padding: '1rem', background: 'rgba(0, 242, 254, 0.03)', borderRadius: '12px', flex: 1, border: '1px solid rgba(0, 242, 254, 0.1)' }}>
                                        <p style={{ color: 'white', fontSize: '0.95rem', lineHeight: '1.6' }}>{step}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reversal Timeline */}
                <div className="glass-panel timeline-footer" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Activity color="var(--accent-primary)" size={20} />
                        <h4 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Risk Reversal Timeline</h4>
                    </div>
                    <div className="timeline-banner">
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{prevention.reversalTimeline}</p>
                    </div>
                    <p style={{ marginTop: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        *Timelines are based on empirical clinical observations of micro-vascular stabilization under optimized lifestyle conditions.
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .risk-summary-badge {
                    padding: 0.5rem 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    border-radius: 100px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .risk-summary-badge.Low { color: var(--success); border-color: var(--success); }
                .risk-summary-badge.Medium { color: #ffab00; border-color: #ffab00; }
                .risk-summary-badge.High { color: #ff3d00; border-color: #ff3d00; }

                .step-count {
                    width: 32px;
                    height: 32px;
                    background: var(--accent-primary);
                    color: black;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.9rem;
                    flex-shrink: 0;
                }

                .pulse-animation {
                    color: var(--accent-primary);
                    animation: pulse-glow 2s infinite;
                }

                .timeline-banner {
                    padding: 2rem;
                    background: rgba(0, 242, 254, 0.05);
                    border-radius: 16px;
                    border: 1px dashed rgba(0, 242, 254, 0.3);
                    text-align: center;
                `
            }} />
        </motion.div>
    );
};

export default Prevention;
