import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ScanHeart,
    ChevronRight,
    Eye,
    Microscope,
    Brain,
    ArrowRight
} from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <motion.div
            className="home-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Hero Section */}
            <section className="hero-section">
                <motion.div variants={itemVariants} className="badge-wrapper">
                    <div className="status-badge">
                        <span className="pulse-dot"></span>
                        Pioneering Ocular Biomarkers for Cardiology.
                        <span className="accent-text" style={{ marginLeft: '8px', cursor: 'pointer' }}>Learn more →</span>
                    </div>
                </motion.div>

                <motion.h1 variants={itemVariants} className="hero-title font-heading">
                    The Eye is the Window to Your <span className="highlight-text">Heart</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="hero-subtitle">
                    OculoCardia AI leverages advanced U-Net segmentation and Deep Learning to analyze retinal vasculature.
                    Detect hypertension, AV nicking, and cardiac risk markers non-invasively in seconds.
                </motion.p>

                <motion.div variants={itemVariants} className="cta-group">
                    <button className="btn-action primary-cta" onClick={() => navigate('/dashboard')}>
                        <ScanHeart size={20} />
                        Launch Diagnostics
                    </button>
                    <button className="secondary-cta" onClick={() => navigate('/about')}>
                        View Project Documentation
                        <ArrowRight size={18} />
                    </button>
                </motion.div>
            </section>

            {/* Features Grid */}
            <motion.section variants={containerVariants} className="features-grid">
                <FeatureCard
                    variants={itemVariants}
                    icon={<Eye size={32} className="card-icon" />}
                    title="Non-Invasive"
                    description="No surgery, just a simple fundus photograph analysis. Painless and ultra-fast diagnostics."
                />
                <FeatureCard
                    variants={itemVariants}
                    icon={<Microscope size={32} className="card-icon" />}
                    title="Clinical Accuracy"
                    description="Trained on Kaggle and DRIVE datasets for high precision vascular mapping."
                />
                <FeatureCard
                    variants={itemVariants}
                    icon={<Brain size={32} className="card-icon" />}
                    title="Explainable AI"
                    description="Grad-CAM heatmaps highlight relevant vascular anomalies, ensuring medical trust."
                />
            </motion.section>

            <style dangerouslySetInnerHTML={{
                __html: `
        .home-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 4rem 1rem;
          text-align: center;
        }

        .hero-section {
          margin-bottom: 6rem;
        }

        .badge-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .status-badge {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 0.6rem 1.25rem;
          border-radius: 100px;
          font-size: 0.85rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: var(--accent-primary);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--accent-primary);
          animation: pulse-glow 2s infinite;
        }

        .hero-title {
          font-size: 4.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: white;
          letter-spacing: -2px;
        }

        .highlight-text {
          background: linear-gradient(135deg, var(--accent-primary) 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 700px;
          margin: 0 auto 3rem;
        }

        .cta-group {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
        }

        .primary-cta {
          padding: 1.25rem 2.5rem;
          font-size: 1.1rem;
          border-radius: 100px;
        }

        .secondary-cta {
          background: transparent;
          border: none;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s;
          padding: 0.5rem;
        }

        .secondary-cta:hover {
          color: var(--accent-primary);
          transform: translateX(5px);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .feat-card {
          padding: 2.5rem;
          text-align: left;
          height: 100%;
          transition: transform 0.3s;
        }

        .feat-card:hover {
          transform: translateY(-10px);
          border-color: var(--accent-primary);
        }

        .card-icon {
          color: var(--accent-primary);
          margin-bottom: 1.5rem;
          background: rgba(0, 242, 254, 0.05);
          padding: 10px;
          border-radius: 12px;
          box-sizing: content-box;
        }

        .feat-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
        }

        .feat-desc {
          color: var(--text-dim);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .hero-title { font-size: 3rem; }
          .features-grid { grid-template-columns: 1fr; }
          .cta-group { flex-direction: column; gap: 1rem; }
        }
      `}} />
        </motion.div>
    );
};

const FeatureCard = ({ icon, title, description, variants }) => (
    <motion.div variants={variants} className="feat-card glass-panel">
        {icon}
        <h3 className="feat-title font-heading">{title}</h3>
        <p className="feat-desc">{description}</p>
    </motion.div>
);

export default Home;
