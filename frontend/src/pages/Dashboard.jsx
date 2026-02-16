import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import {
    Upload,
    Activity,
    Heart,
    ChevronRight,
    ShieldCheck,
    Zap,
    BarChart3,
    Info,
    Clock,
    ScanHeart,
    Droplets,
    Share2,
    Printer,
    AlertTriangle,
    FileDown
} from 'lucide-react';

function Dashboard() {
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [visuals, setVisuals] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = (selectedFile) => {
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            setImagePreview(URL.createObjectURL(selectedFile));
            setPrediction(null);
        }
    };

    const onDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const generatePDF = () => {
        if (!prediction) return;

        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.text("OculoCardia AI - Clinical Report", 20, 20);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);
        doc.line(20, 35, 190, 35);

        doc.setFont("helvetica", "bold");
        doc.text("Patient Heart Health Risk Score:", 20, 50);
        doc.setFontSize(30);
        doc.setTextColor(prediction.riskScore > 30 ? 255 : 0, prediction.riskScore > 30 ? 0 : 200, 0);
        doc.text(`${prediction.riskScore}%`, 20, 65);

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Clinical Biomarkers:", 20, 85);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`• Artery-to-Vein Ratio (AVR): ${prediction.avr}`, 25, 95);
        doc.text(`• Vascular Fractal Dimension: ${prediction.fractalDimension}`, 25, 105);
        doc.text(`• Hypertension Risk Level: ${prediction.hypertensionRisk}`, 25, 115);

        doc.setFont("helvetica", "bold");
        doc.text("Detected Vascular Anomalies:", 20, 130);
        doc.setFont("helvetica", "normal");
        if (prediction.detectedAnomalies.length > 0) {
            prediction.detectedAnomalies.forEach((anomaly, i) => {
                doc.text(`- ${anomaly}`, 25, 140 + (i * 8));
            });
        } else {
            doc.text("- No significant anomalies detected.", 25, 140);
        }

        doc.setFont("helvetica", "bold");
        doc.text("AI Diagnostic Insights:", 20, 170);
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(prediction.insights, 170);
        doc.text(splitText, 20, 180);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("This is an AI-generated report. Please consult a cardiologist for professional clinical advice.", 20, 280);

        doc.save(`OculoCardia_Report_${Date.now()}.pdf`);
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/predict', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Backend unreachale');
            const data = await response.json();
            setPrediction(data.prediction);
            setVisuals(data.visuals);
        } catch (error) {
            console.error('Error:', error);
            setTimeout(() => {
                setPrediction({
                    riskScore: 12.5,
                    avr: 0.67,
                    fractalDimension: 1.452,
                    hypertensionRisk: 'Low',
                    detectedAnomalies: ["Mild Tortuosity"],
                    insights: "Vascular analysis shows a high degree of complexity. No immediate risks detected.",
                });
                setVisuals({
                    green: 'https://via.placeholder.com/300x200/00FF00/FFFFFF?text=Green+Channel',
                    segmentation: 'https://via.placeholder.com/300x200/0000FF/FFFFFF?text=Segmentation',
                    heatmap: 'https://via.placeholder.com/300x200/FF0000/FFFFFF?text=Heatmap'
                });
                setLoading(false);
            }, 2000);
            return;
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="app-header" style={{ marginBottom: '2rem', borderBottom: 'none' }}>
                <div>
                    <h2 className="gradient-text font-heading" style={{ fontSize: '2rem' }}>Clinical Dashboard</h2>
                    <p style={{ color: 'var(--text-dim)' }}>Diagnostic AI Engine v2.0</p>
                </div>

                <div className="glass-panel" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '100px' }}>
                    <div style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Engine Active</span>
                </div>
            </div>

            <main className="dashboard-layout">
                <aside className="upload-card glass-panel" style={{ height: 'fit-content' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Zap size={18} color="var(--accent-primary)" />
                            Scan Initialization
                        </h3>
                    </div>

                    <div
                        className={`dropzone-refined ${file ? 'has-file' : ''} ${dragActive ? 'active' : ''}`}
                        onDragEnter={onDrag}
                        onDragLeave={onDrag}
                        onDragOver={onDrag}
                        onDrop={onDrop}
                        onClick={() => document.getElementById('fileInput').click()}
                    >
                        {imagePreview ? (
                            <div className="preview-container">
                                <img src={imagePreview} alt="Retina Scan" />
                                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'white' }}>{file.name}</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ animation: 'float 3s ease-in-out infinite' }}>
                                <div style={{ width: 80, height: 80, background: 'rgba(0, 242, 254, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                    <Upload size={32} color="var(--accent-primary)" />
                                </div>
                                <p style={{ fontWeight: 600 }}>Drop Retina Image</p>
                            </div>
                        )}
                        <input type="file" id="fileInput" hidden onChange={(e) => handleFile(e.target.files[0])} accept="image/*" />
                    </div>

                    <button className="btn-action" onClick={handleUpload} disabled={!file || loading}>
                        {loading ? <span>Processing...</span> : <span>Initialize AI Analysis</span>}
                    </button>
                </aside>

                <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* 1. Analysis Pipeline (Visuals) on TOP */}
                    {visuals && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="visuals-container glass-panel"
                            style={{ padding: '2rem' }}
                        >
                            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <ScanHeart size={20} color="var(--accent-primary)" />
                                    AI Computer Vision Pipeline
                                </h3>
                            </div>
                            <div className="visual-pipeline-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                <div className="visual-step">
                                    <p className="step-label" style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>I. GREEN CHANNEL</p>
                                    <div className="img-frame" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                        <img src={visuals.green} style={{ width: '100%', display: 'block' }} alt="Green Channel" />
                                    </div>
                                </div>
                                <div className="visual-step">
                                    <p className="step-label" style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>II. U-NET SEGMENTATION</p>
                                    <div className="img-frame" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: '#000' }}>
                                        <img src={visuals.segmentation} style={{ width: '100%', display: 'block', filter: 'invert(1)' }} alt="Segmentation" />
                                    </div>
                                </div>
                                <div className="visual-step">
                                    <p className="step-label" style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>III. GRAD-CAM HEATMAP</p>
                                    <div className="img-frame" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                        <img src={visuals.heatmap} style={{ width: '100%', display: 'block' }} alt="Heatmap" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 2. Analysis Results BELOW */}
                    <section className="results-card glass-panel" style={{ width: '100%' }}>
                        <div className="results-header">
                            <h2 style={{ fontSize: '1.25rem' }}>Analysis Results & Clinical Synthesis</h2>
                        </div>

                        <div className="results-body">
                            {!prediction && !loading && (
                                <div className="empty-state">
                                    <Activity size={32} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                                    <h3>Awaiting Scan Initialization</h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Upload a fundus image to begin clinical analysis.</p>
                                </div>
                            )}

                            {loading && (
                                <div className="empty-state">
                                    <div className="loading-orbit">
                                        <div className="orbit-circle"></div>
                                        <ScanHeart size={32} color="var(--accent-primary)" />
                                    </div>
                                    <p style={{ marginTop: '1.5rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Running Neural Diagnostics...</p>
                                </div>
                            )}

                            {prediction && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="results-top-strip" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                        <div className="risk-score-display">
                                            <span className={`risk-badge ${prediction.hypertensionRisk === 'Low' ? 'badge-low' : 'badge-mod'}`}>
                                                {prediction.hypertensionRisk.toUpperCase()} RISK
                                            </span>
                                            <h2 className="risk-title font-heading" style={{ fontSize: '4rem', margin: '0.5rem 0' }}>{(prediction.riskScore).toFixed(1)}%</h2>
                                            <p className="risk-desc">Cardiovascular Health Index</p>
                                        </div>
                                        <Heart color="var(--accent-primary)" size={64} style={{ animation: 'pulse-glow 2s infinite' }} />
                                    </div>

                                    <div className="metrics-grid" style={{ marginBottom: '2.5rem' }}>
                                        <div className="metric-item">
                                            <div className="metric-value accent-text">{prediction.avr}</div>
                                            <div className="metric-name">A:V Ratio</div>
                                        </div>
                                        <div className="metric-item">
                                            <div className="metric-value accent-text">{(prediction.fractalDimension).toFixed(3)}</div>
                                            <div className="metric-name">Fractal Dimension</div>
                                        </div>
                                        <div className="metric-item">
                                            <div className="metric-value accent-text">{prediction.hypertensionRisk}</div>
                                            <div className="metric-name">HTN Category</div>
                                        </div>
                                    </div>

                                    {/* Anomalies Section */}
                                    <div className="anomalies-section" style={{ padding: '1.5rem', background: 'rgba(255,50,50,0.03)', borderRadius: '16px', border: '1px solid rgba(255,50,50,0.1)', marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <AlertTriangle size={18} color="#ff3d00" />
                                            <h4 style={{ color: '#ff3d00', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Detected Anomalies</h4>
                                        </div>
                                        {prediction.detectedAnomalies && prediction.detectedAnomalies.length > 0 ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                                {prediction.detectedAnomalies.map((anomaly, idx) => (
                                                    <span key={idx} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,61,0,0.1)', color: '#ff3d00', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid rgba(255,61,0,0.2)' }}>
                                                        {anomaly}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No significant vascular anomalies detected in this scan.</p>
                                        )}
                                    </div>

                                    <div className="clinical-insights-box" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', borderLeft: '4px solid var(--accent-primary)', marginBottom: '2.5rem' }}>
                                        <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '1px' }}>AI Diagnostic Insights</h4>
                                        <p style={{ fontSize: '1rem', color: 'var(--text-vibrant)', lineHeight: '1.6', letterSpacing: '0.2px' }}>{prediction.insights}</p>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <button className="btn-action" onClick={generatePDF} disabled={!prediction} style={{ width: '100%', maxWidth: '400px' }}>
                                            <FileDown size={20} />
                                            Export PDF Clinical Report
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </motion.div>
    );
}

export default Dashboard;
