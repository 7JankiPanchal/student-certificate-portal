import React, { useState } from 'react';
import { X, Zap, HardDrive, Shield, Star, Check, Sparkles, Crown, Rocket } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    storage: '15 GB',
    price: '₹99',
    period: '/month',
    color: 'from-sky-500 to-cyan-400',
    colorLight: 'from-sky-50 to-cyan-50',
    border: 'border-sky-200 dark:border-sky-500/30',
    ring: 'ring-sky-400',
    badge: null,
    icon: HardDrive,
    iconColor: 'text-sky-500',
    features: [
      '15 GB Secure Storage',
      'Up to 50 Documents',
      'Basic Verification',
      'Email Support',
      'SHA-256 Hashing',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    storage: '50 GB',
    price: '₹249',
    period: '/month',
    color: 'from-indigo-600 to-violet-600',
    colorLight: 'from-indigo-50 to-violet-50',
    border: 'border-indigo-300 dark:border-indigo-500/40',
    ring: 'ring-indigo-500',
    badge: 'Most Popular',
    icon: Rocket,
    iconColor: 'text-indigo-600',
    features: [
      '50 GB Secure Storage',
      'Unlimited Documents',
      'Priority Verification',
      'Batch Validation',
      'RSA Digital Signatures',
      'Priority Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    storage: '100 GB',
    price: '₹499',
    period: '/month',
    color: 'from-amber-500 to-orange-500',
    colorLight: 'from-amber-50 to-orange-50',
    border: 'border-amber-300 dark:border-amber-500/30',
    ring: 'ring-amber-400',
    badge: 'Best Value',
    icon: Crown,
    iconColor: 'text-amber-600',
    features: [
      '100 GB Secure Storage',
      'Unlimited Everything',
      'Dedicated Faculty Portal',
      'Bulk Upload & Verify',
      'Custom Certificates',
      'API Access',
      '24/7 Priority Support',
    ],
  },
];

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-4xl glass-strong p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/[0.06] dark:hover:text-white transition"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={12} />
            CloudCert Premium
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Choose Your Plan
          </h2>
          <p className="text-slate-500 dark:text-white/40 max-w-sm mx-auto text-sm">
            Unlock more storage, advanced features, and priority support for your academic journey.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isSelected = selected === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                  isSelected
                    ? `ring-2 ${plan.ring} ring-offset-2 ring-offset-white dark:ring-offset-dark-900 border-transparent`
                    : `${plan.border} hover:border-indigo-300 dark:hover:border-white/20`
                } bg-gradient-to-br ${plan.colorLight} dark:bg-none dark:bg-white/[0.03]`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${plan.color} shadow-lg whitespace-nowrap`}>
                    {plan.badge}
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <PlanIcon size={22} className="text-white" />
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                <p className={`text-sm font-bold ${plan.iconColor} dark:text-white/50 mb-3`}>{plan.storage} Storage</p>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-slate-400 dark:text-white/30 text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center shrink-0`}>
                        <Check size={10} className="text-white" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-r ${plan.color} text-white shadow-lg`
                      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
                  }`}
                >
                  {isSelected ? '✓ Selected' : `Choose ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-white/30">
            <Shield size={14} />
            <span>Secure payment · Cancel anytime · 30-day money back guarantee</span>
          </div>
          <button
            onClick={() => {
              if (selected) {
                alert(`🎉 You selected the ${plans.find(p => p.id === selected)?.name} plan! (Demo mode)`);
                onClose();
              } else {
                alert('Please select a plan first!');
              }
            }}
            className="btn-primary px-8 py-3 flex items-center gap-2"
          >
            <Zap size={16} />
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};
