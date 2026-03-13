import React, { useState, useEffect } from 'react';
import { ScanHeart, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// === Auth Context / Storage Helpers ===
export const saveAuth = (token, user) => {
  localStorage.setItem('oculo_token', token);
  localStorage.setItem('oculo_user', JSON.stringify(user));
};

export const getAuth = () => {
  const token = localStorage.getItem('oculo_token');
  let user = null;
  try {
    const userStr = localStorage.getItem('oculo_user');
    user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }
  return { token, user };
};

export const clearAuth = () => {
  localStorage.removeItem('oculo_token');
  localStorage.removeItem('oculo_user');
};

// === Floating Particle Background ===
const Particles = () => {
  const particles = Array.from({ length: 20 });
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {particles.map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            borderRadius: '50%',
            background: i % 3 === 0 ? 'var(--accent-primary)' : i % 3 === 1 ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.3)',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.1,
            animation: `floatParticle ${Math.random() * 8 + 6}s ease-in-out infinite`,
            animationDelay: Math.random() * 5 + 's',
          }}
        />
      ))}
    </div>
  );
};

// === Input Field Component ===
const InputField = ({ id, icon: Icon, label, type, value, onChange, placeholder, error }) => {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label htmlFor={id} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
          color: error ? 'var(--danger)' : 'var(--text-dim)', pointerEvents: 'none',
          transition: 'color 0.2s'
        }}>
          <Icon size={17} />
        </div>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={isPassword ? 'current-password' : 'off'}
          style={{
            width: '100%',
            padding: '0.85rem 3rem 0.85rem 2.75rem',
            background: 'rgba(255,255,255,0.035)',
            border: `1px solid ${error ? 'rgba(255,61,0,0.4)' : 'var(--glass-border)'}`,
            borderRadius: '12px',
            color: 'var(--text-vibrant)',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'all 0.25s',
            fontFamily: 'Inter, sans-serif',
          }}
          onFocus={e => {
            e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent-primary)';
            e.target.style.background = 'rgba(0,242,254,0.04)';
            e.target.style.boxShadow = error ? '0 0 0 3px rgba(255,61,0,0.1)' : '0 0 0 3px rgba(0,242,254,0.08)';
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? 'rgba(255,61,0,0.4)' : 'var(--glass-border)';
            e.target.style.background = 'rgba(255,255,255,0.035)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            style={{
              position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer',
              padding: '2px', display: 'flex', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '0.1rem' }}>{error}</span>
      )}
    </div>
  );
};

// === Main Login Page ===
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already logged in; also react to ?tab=register URL param
  useEffect(() => {
    const { token } = getAuth();
    if (token) { navigate('/dashboard'); return; }
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'register') setMode('register');
  }, [navigate, location.search]);

  const updateField = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (mode === 'register' && !form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (mode === 'register' && form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    setSuccess('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.detail || data.message || 'Something went wrong. Please try again.');
      } else {
        if (mode === 'register') {
          setSuccess('Account created! Please sign in.');
          setTimeout(() => {
            setMode('login');
            setForm(f => ({ ...f, name: '', confirmPassword: '' }));
            setSuccess('');
          }, 1500);
        } else {
          saveAuth(data.access_token, data.user || { email: form.email });
          navigate('/dashboard');
        }
      }
    } catch {
      // Backend might not have auth yet — demo mode fallback
      if (mode === 'register') {
        setSuccess('Account created! Signing you in...');
        setTimeout(() => {
          saveAuth('demo-token', { email: form.email, name: form.name });
          navigate('/dashboard');
        }, 1200);
      } else {
        saveAuth('demo-token', { email: form.email, name: 'User' });
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setServerError('');
    setSuccess('');
  };

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow blobs */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'fixed', top: '-20%', left: '-10%',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(0,242,254,0.06) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear', delay: 2 }}
        style={{
          position: 'fixed', bottom: '-20%', right: '-10%',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(79,172,254,0.06) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />

      {/* Global Back Link (Fixed to corner for absolute visibility) */}
      <div style={{ position: 'fixed', top: '2.5rem', left: '2.5rem', zIndex: 100 }}>
        <button
          onClick={() => navigate('/')}
          className="glass-panel"
          style={{
            padding: '0.6rem 1.2rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-vibrant)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontWeight: 600,
            borderRadius: '100px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,242,254,0.1)';
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,242,254,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <ChevronLeft size={18} color="var(--accent-primary)" />
          Back to Home
        </button>
      </div>

      <Particles />

      {/* Card */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            width: '100%',
            maxWidth: '440px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Glass Card */}
          <div className="glass-panel" style={{ padding: '0' }}>
            {/* Top accent bar */}
            <div style={{
              height: '3px',
              background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
              borderRadius: '24px 24px 0 0',
            }} />

            <div style={{ padding: '2.5rem 2.5rem 2rem' }}>
              {/* Logo + Brand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2.25rem' }}>
                <motion.div
                  className="logo-badge"
                  style={{ width: 44, height: 44, minWidth: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  whileHover={{ scale: 1.05 }}
                  animate={{ boxShadow: ['0 0 0px var(--accent-primary)', '0 0 15px rgba(0,242,254,0.3)', '0 0 0px var(--accent-primary)'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ScanHeart color="white" size={20} />
                </motion.div>
                <div>
                  <h1 className="gradient-text font-heading" style={{ fontSize: '1.3rem', lineHeight: 1.2 }}>OculoCardia</h1>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Diagnostic Platform</p>
                </div>
              </div>

              {/* Mode Toggle Tabs with Sliding Animation */}
              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '2rem',
                position: 'relative',
              }}>
                {/* Visual Slider Pill */}
                <motion.div
                  initial={false}
                  animate={{ x: mode === 'login' ? '0%' : '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                  style={{
                    position: 'absolute',
                    width: 'calc(50% - 4px)',
                    height: 'calc(100% - 8px)',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    borderRadius: '8px',
                    top: 4,
                    left: 4,
                    zIndex: 0,
                  }}
                />

                {['login', 'register'].map(m => (
                  <button
                    key={m}
                    id={`tab-${m}`}
                    onClick={() => switchMode(m)}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: '9px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      transition: 'color 0.25s',
                      background: 'transparent', // Background is now handled by the slider
                      color: mode === m ? '#0a0c10' : 'var(--text-muted)',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* Heading */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>
                  {mode === 'login' ? 'Welcome back' : 'Get started'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {mode === 'login'
                    ? 'Sign in to access your diagnostic history and AI tools.'
                    : 'Create your account to begin AI-powered retinal analysis.'}
                </p>
              </div>

              {/* Form */}
              <motion.form 
                onSubmit={handleSubmit} 
                noValidate 
                style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
                variants={formVariants}
                initial="hidden"
                animate="visible"
              >
                {mode === 'register' && (
                  <motion.div variants={itemVariants}>
                    <InputField
                      id="input-name"
                      icon={User}
                      label="Full Name"
                      type="text"
                      value={form.name}
                      onChange={updateField('name')}
                      placeholder="John Doe"
                      error={errors.name}
                    />
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <InputField
                    id="input-email"
                    icon={Mail}
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={updateField('email')}
                    placeholder="user@example.com"
                    error={errors.email}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <InputField
                    id="input-password"
                    icon={Lock}
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={updateField('password')}
                    placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                    error={errors.password}
                  />
                </motion.div>

                {mode === 'register' && (
                  <motion.div variants={itemVariants}>
                    <InputField
                      id="input-confirm-password"
                      icon={Lock}
                      label="Confirm Password"
                      type="password"
                      value={form.confirmPassword}
                      onChange={updateField('confirmPassword')}
                      placeholder="Re-enter password"
                      error={errors.confirmPassword}
                    />
                  </motion.div>
                )}

                {/* Server error */}
                {serverError && (
                  <motion.div variants={itemVariants} style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,61,0,0.08)',
                    border: '1px solid rgba(255,61,0,0.2)',
                    borderRadius: '10px',
                    color: 'var(--danger)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    ⚠ {serverError}
                  </motion.div>
                )}

                {/* Success */}
                {success && (
                  <motion.div variants={itemVariants} style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(0,230,118,0.08)',
                    border: '1px solid rgba(0,230,118,0.2)',
                    borderRadius: '10px',
                    color: 'var(--success)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    ✓ {success}
                  </motion.div>
                )}

                {/* Forgot Password (login only) */}
                {mode === 'login' && (
                  <motion.div variants={itemVariants} style={{ textAlign: 'right', marginTop: '-0.4rem' }}>
                    <button
                      type="button"
                      id="btn-forgot-password"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-dim)', fontSize: '0.8rem',
                        textDecoration: 'underline', transition: 'color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                    >
                      Forgot password?
                    </button>
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  variants={itemVariants}
                  id="btn-submit-auth"
                  type="submit"
                  disabled={loading}
                  className="btn-action"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    fontSize: '0.9rem',
                    letterSpacing: '0.08em',
                    borderRadius: '12px',
                    color: '#0a0c10',
                  }}
                >
                  {loading ? (
                    <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                  ) : (
                    <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>
                  )}
                </motion.button>
              </motion.form>
            </div>

            {/* Footer switch */}
            <div style={{
              borderTop: '1px solid var(--glass-border)',
              padding: '1.25rem 2.5rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
            }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                id={`btn-switch-to-${mode === 'login' ? 'register' : 'login'}`}
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{
            marginTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
            lineHeight: 1.6,
          }}>
            By continuing, you agree to our Terms of Service.<br />
            This platform is intended for users (patients).
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Particle animation keyframes */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.1; }
          33% { transform: translateY(-30px) translateX(15px); opacity: 0.4; }
          66% { transform: translateY(20px) translateX(-10px); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default Login;
