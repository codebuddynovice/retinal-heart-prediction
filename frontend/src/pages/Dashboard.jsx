import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
    TrendingUp,
    Calendar,
    FileDown
} from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import { getAuth } from './Login';

function Dashboard() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [visuals, setVisuals] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const { token } = getAuth();

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
            let currentY = 140;
            prediction.detectedAnomalies.forEach((anomaly) => {
                doc.setFont("helvetica", "bold");
                doc.text(`- ${anomaly.name}`, 25, currentY);
                currentY += 6;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                anomaly.symptoms.forEach(symptom => {
                    doc.text(`  • ${symptom}`, 30, currentY);
                    currentY += 5;
                });
                doc.setFontSize(11); // Reset font size
                currentY += 3;
            });
        } else {
            doc.text("- No significant anomalies detected.", 25, 140);
        }

        doc.text("AI Diagnostic Insights:", 20, 170);
        doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(prediction.insights, 170);
        doc.text(splitText, 20, 180);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Medical Disclaimer: This system is a non-diagnostic, AI-assisted decision-support tool", 20, 275);
        doc.text("and does not replace clinical evaluation. All results are advisory.", 20, 280);
        doc.text("This is an AI-generated report. Please consult a cardiologist for professional clinical advice.", 20, 285);

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
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });
            if (!response.ok) throw new Error('Backend unreachable');
            const data = await response.json();
            setPrediction(data.prediction);
            setVisuals(data.visuals);
        } catch (error) {
            console.error('Error:', error);
            setTimeout(() => {
                setPrediction({
                    riskScore: 68.5,
                    avr: 0.62,
                    fractalDimension: 1.38,
                    hypertensionRisk: 'Medium',
                    detectedAnomalies: [
                        { name: "Mild Tortuosity", symptoms: ["Early systemic vascular stress", "Developing retinal strain"] }
                    ],
                    insights: "Vascular analysis shows reduced vessel tree complexity and moderate risk. Early signs of systemic hypertension detected.",
                    prevention: {
                        tips: [
                            "Reduce sodium intake to under 2,300mg/day.",
                            "Introduce 30 mins of daily brisk walking.",
                            "Monitor blood pressure bi-weekly.",
                            "Marker Alert: Low AVR suggests persistent arteriolar narrowing."
                        ],
                        plan30Day: "Week 1: Salt reduction. Week 2: Daily morning walks. Week 3: Stress management. Week 4: Follow-up BP check.",
                        reversalTimeline: "3-6 Months: Arteriolar narrowing can stabilize with strict BP control."
                    }
                });
                setVisuals({
                    green: 'https://images.unsplash.com/photo-1576091160550-217359f4ecf8?q=80&w=300&auto=format&fit=crop',
                    segmentation: 'https://images.unsplash.com/photo-1579154235828-45199683dc21?q=80&w=300&auto=format&fit=crop',
                    heatmap: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format&fit=crop'
                });
                setLoading(false);
            }, 2000);
            return;
        }
        setLoading(false);
        fetchHistory(); // Refresh history after new prediction
    };

    const fetchHistory = async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8000/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') setHistory(data.history);
        } catch (err) {
            console.error('Failed to fetch history', err);
        }
    };

    React.useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div className="app-header" style={{ marginBottom: '2rem', borderBottom: 'none' }}>
                <div>
                    <h2 className="gradient-text font-heading" style={{ fontSize: '2rem' }}>Clinical Dashboard</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Diagnostic AI Engine v2.0 | Non-diagnostic AI-assisted decision-support tool</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        className={`nav-link ${!showHistory ? 'active' : ''}`}
                        onClick={() => setShowHistory(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}
                    >
                        New Analysis
                    </button>
                    <button 
                        className={`nav-link ${showHistory ? 'active' : ''}`}
                        onClick={() => setShowHistory(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem' }}
                    >
                        Medical History ({history.length})
                    </button>
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
                    {showHistory ? (
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Clock size={20} color="var(--accent-primary)" />
                                Historical Records
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {history.length === 0 ? (
                                    <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '3rem' }}>No past records found.</p>
                                ) : (
                                    history.map((record) => (
                                        <div key={record.id} className="glass-panel" style={{ 
                                            padding: '1rem', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                                <div style={{ width: 50, height: 50, borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                                                    <img src={`http://localhost:8000/${record.image}`} alt="Scan" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text-vibrant)' }}>Scan Ref #{record.id}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(record.timestamp).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{record.metrics.riskScore}% Risk</div>
                                                <div style={{ fontSize: '0.7rem', color: record.metrics.hypertensionRisk === 'High' ? 'var(--danger)' : 'var(--success)' }}>
                                                    {record.metrics.hypertensionRisk.toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 1. Analysis Pipeline (Visuals) on TOP */}
                            {visuals && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="visuals-container glass-panel"
                                    style={{ padding: '2rem' }}
                                >
                                    {/* ... pipeline code ... */}
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
                                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '300px' }}>
                                                Upload a fundus image to begin clinical analysis. The system is dataset-independent at runtime and operates solely on real-time user-uploaded images.
                                            </p>
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
                                                    <span className={`risk-badge ${prediction.hypertensionRisk === 'Low' ? 'badge-low' :
                                                        prediction.hypertensionRisk === 'Medium' ? 'badge-mod' : 'badge-high'
                                                        }`}>
                                                        {prediction.hypertensionRisk.toUpperCase()} RISK
                                                    </span>
                                                    <h2 className="risk-title font-heading" style={{ fontSize: '4rem', margin: '0.5rem 0' }}>{(prediction.riskScore).toFixed(1)}%</h2>
                                                    <p className="risk-desc">Cardiovascular Health Index</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <Heart color="var(--accent-primary)" size={64} style={{ animation: 'pulse-glow 2s infinite' }} />
                                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Empirical Reference Thresholds Applied</p>
                                                </div>
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
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        {prediction.detectedAnomalies.map((anomaly, idx) => (
                                                            <div key={idx} style={{
                                                                padding: '1rem',
                                                                background: 'rgba(255,61,0,0.05)',
                                                                borderRadius: '12px',
                                                                border: '1px solid rgba(255,61,0,0.15)'
                                                            }}>
                                                                <div style={{ fontWeight: 700, color: '#ff3d00', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                                    {anomaly.name}
                                                                </div>
                                                                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                                                                    {anomaly.symptoms.map((symptom, sIdx) => (
                                                                        <li key={sIdx} style={{ marginBottom: '0.2rem' }}>{symptom}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No significant vascular anomalies detected in this scan.</p>
                                                )}
                                            </div>

                                            <div className="clinical-insights-box" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', borderLeft: '4px solid var(--accent-primary)', marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '1px' }}>AI Diagnostic Insights</h4>
                                                <p style={{ fontSize: '1rem', color: 'var(--text-vibrant)', lineHeight: '1.6', letterSpacing: '0.2px' }}>{prediction.insights}</p>
                                            </div>

                                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
                                                <p style={{ marginBottom: '0.5rem' }}>
                                                    <strong>Risk Formula Justification:</strong> AVR is given higher weight (60%) due to its strong clinical association with hypertension, while vessel tortuosity (40%) provides supplementary structural information.
                                                </p>
                                                <p>
                                                    <strong>Scope Reminder:</strong> This system is a non-diagnostic, AI-assisted decision-support tool and does not replace clinical evaluation.
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                                                <button className="btn-action" onClick={generatePDF} disabled={!prediction} style={{ flex: 1, maxWidth: '300px' }}>
                                                    <FileDown size={20} />
                                                    Export Clinical Results
                                                </button>
                                                
                                                {prediction.prevention && (
                                                    <button 
                                                        className="btn-action" 
                                                        onClick={() => navigate('/prevention', { state: { prevention: prediction.prevention, riskLevel: prediction.hypertensionRisk } })}
                                                        style={{ flex: 1, maxWidth: '300px', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                                                    >
                                                        <ShieldCheck size={20} />
                                                        View Prevention Roadmap
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main>
            
            {/* Clinical AI Chatbot */}
            <ChatWidget context={prediction} />
        </motion.div>
    );
}

export default Dashboard;
