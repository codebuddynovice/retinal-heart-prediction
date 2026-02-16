import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Database, Eye, Activity, ShieldCheck } from 'lucide-react';

const About = () => {
    const features = [
        {
            icon: <Eye className="text-cyan-400" />,
            title: "Vascular Imaging",
            desc: "The retina is the only human organ where live blood vessels are directly visible."
        },
        {
            icon: <Brain className="text-blue-400" />,
            title: "U-Net Architecture",
            desc: "State-of-the-art segmentation model to map vessel trees with pixel-perfect accuracy."
        },
        {
            icon: <Cpu className="text-indigo-400" />,
            title: "Deep Inference",
            desc: "Using EfficientNet-B0 to calculate risk scores based on vascular tortuosity."
        },
        {
            icon: <Activity className="text-emerald-400" />,
            title: "Diagnostic Metrics",
            desc: "Analysis of Artery-to-Vein Ratio (AVR) and Fractal Dimensions (FD)."
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="about-page"
        >
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '2rem' }}>
                <h2 className="gradient-text font-heading" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>The Science Behind The Vision</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', maxWidth: '800px' }}>
                    RetinaHeart AI leverages the anatomical link between retinal micro-circulation and coronary macro-circulation.
                    By observing narrowing arterioles and twisted vessels in the fundus, our neural engine can predict
                    cardiovascular strain years before a major event occurs.
                </p>

                <div className="metrics-grid" style={{ marginTop: '3rem' }}>
                    {features.map((f, i) => (
                        <div key={i} className="metric-item">
                            <div style={{ marginBottom: '1rem' }}>{f.icon}</div>
                            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>{f.title}</h4>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 className="font-heading" style={{ marginBottom: '1rem' }}>Model Pipeline</h3>
                    <div className="pipeline-step">
                        <div className="step-num">01</div>
                        <div>
                            <p className="step-title">Preprocessing</p>
                            <p className="step-desc">CLAHE enhancement & Green Channel extraction via OpenCV.</p>
                        </div>
                    </div>
                    <div className="pipeline-step">
                        <div className="step-num">02</div>
                        <div>
                            <p className="step-title">Segmentation</p>
                            <p className="step-desc">U-Net binary mask generation for vascular isolation.</p>
                        </div>
                    </div>
                    <div className="pipeline-step">
                        <div className="step-num">03</div>
                        <div>
                            <p className="step-title">Feature Extraction</p>
                            <p className="step-desc">Calculation of AVR, Tortuosity, and Fractal Complexity.</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                    <div className="logo-badge" style={{ margin: '0 auto 1.5rem', width: 60, height: 60 }}>
                        <Database size={30} />
                    </div>
                    <h3 className="font-heading">Data Sourcing</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                        Validated against the **DRIVE** and **UK Biobank** datasets, containing over 50,000+ clinical retinal scans.
                    </p>
                    <button className="btn-action" style={{ marginTop: '2rem', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>
                        Dataset Documentation
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .pipeline-step {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
        }
        .step-num {
          font-family: 'Outfit';
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-primary);
          opacity: 0.5;
        }
        .step-title { font-weight: 600; color: white; }
        .step-desc { color: var(--text-dim); font-size: 0.85rem; }
      `}} />
        </motion.div>
    );
};

export default About;
