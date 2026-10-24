import React, { useState } from 'react';
import { UserSession, UserRole } from '../../types';
import { Shield, Sparkles, User, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { SignatureOrb } from '../orb/SignatureOrb';

interface LoginDemoEntryProps {
  onLogin: (session: UserSession) => void;
}

export const LoginDemoEntry: React.FC<LoginDemoEntryProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('business_owner');

  const handleDemoLogin = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      business_owner: 'Elena Rostova (Business Owner)',
      supply_chain_manager: 'Marcus Vance (Supply Chain VP)',
      business_analyst: 'Devon Reed (Lead Analyst)'
    };

    onLogin({
      id: `usr_${role}_01`,
      name: roleNames[role],
      email: `${role}@apexretail.io`,
      role: role,
      workspaceName: 'Apex Electronics [Demo Workspace]',
      isDemoMode: true
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin({
      id: 'usr_custom_01',
      name: email.split('@')[0],
      email,
      role: selectedRole,
      workspaceName: 'Production Workspace (Custom)',
      isDemoMode: false
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-signal-blue/15 via-signal-cyan/15 to-signal-magenta/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 glass-panel rounded-3xl p-8 border border-surface-border shadow-2xl text-left">
        {/* Top Logo & Orb */}
        <div className="flex flex-col items-center text-center mb-6">
          <SignatureOrb size="sm" className="mb-3" />
          <h2 className="text-2xl font-bold text-white tracking-tight">SignalTrace AI</h2>
          <p className="text-xs text-slate-400 mt-1">
            Detect the Signal. Prove the Cause. Resolve the Problem.
          </p>
        </div>

        {/* Demo Fast Entry Options */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-signal-cyan uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast Hackathon Demo Access</span>
          </div>

          <button
            type="button"
            onClick={() => handleDemoLogin('business_owner')}
            className="w-full p-3.5 rounded-xl bg-surface-card hover:bg-surface-light border border-signal-cyan/40 hover:border-signal-cyan text-left transition-all flex items-center justify-between group shadow-cyan-glow/10"
          >
            <div>
              <span className="text-xs font-semibold text-white group-hover:text-signal-cyan block">
                Enter as Business Owner (Elena)
              </span>
              <span className="text-[11px] text-slate-400">
                Apex Electronics • Sales Decline Flagship
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-signal-cyan group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('supply_chain_manager')}
            className="w-full p-3 rounded-xl bg-surface-dark hover:bg-surface-light border border-surface-border text-left transition-all flex items-center justify-between text-xs text-slate-300"
          >
            <span>Enter as Supply Chain Manager (Marcus)</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-border" />
          </div>
          <span className="relative px-3 bg-surface text-[11px] font-mono text-slate-400 uppercase">
            Or Standard Session
          </span>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@enterprise.com"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-dark border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-signal-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-dark border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-signal-cyan"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-surface-light hover:bg-surface-border border border-surface-border text-xs font-semibold text-white transition-colors"
          >
            Sign In with Workspace Credentials
          </button>
        </form>

        {/* Security Footnote */}
        <div className="mt-6 pt-4 border-t border-surface-border text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Shield className="w-3.5 h-3.5 text-signal-cyan" />
            <span>Zero-Exposure Security • Secrets Protected Server-Side</span>
          </div>
        </div>
      </div>
    </div>
  );
};
