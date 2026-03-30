import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, Map, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Inscription réussie ! Vérifiez vos emails si nécessaire.');
      }
    } catch (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Email ou mot de passe incorrect.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Votre email n\'a pas encore été confirmé. Vérifiez vos messages (et vos spams).');
      } else {
        setErrorMsg(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div className="modal-box" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '40px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            background: 'var(--accent-glow)', 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px' 
          }}>
            <Map size={32} color="var(--accent)" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Maply</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {isLogin ? "Connectez-vous pour continuer" : "Créez un compte pour commencer"}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '12px', borderRadius: '8px', color: 'var(--danger)', fontSize: '13px', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--success)', padding: '12px', borderRadius: '8px', color: 'var(--success)', fontSize: '13px', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </div>
              <input
                className="form-input"
                type="email"
                required
                style={{ paddingLeft: '40px' }}
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </div>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                required
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px', height: '44px', fontSize: '15px' }}
          >
            {loading ? (
              <span className="spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}></span>
            ) : isLogin ? (
              <><LogIn size={18} /> Se connecter</>
            ) : (
              <><UserPlus size={18} /> S'inscrire</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
