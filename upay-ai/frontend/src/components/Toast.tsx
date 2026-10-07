'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastType, React.ComponentType<any>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; bar: string }> = {
  success: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
    icon: '#10B981',
    bar: '#10B981',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.25)',
    icon: '#EF4444',
    bar: '#EF4444',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.25)',
    icon: '#3B82F6',
    bar: '#3B82F6',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.25)',
    icon: '#F59E0B',
    bar: '#F59E0B',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type];
  const colors = COLORS[toast.type];
  const duration = toast.duration || 4000;
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px 14px 14px',
        borderRadius: '12px',
        background: 'var(--bg-white)',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(20px)',
        minWidth: '320px',
        maxWidth: '420px',
        overflow: 'hidden',
        animation: exiting
          ? 'toast-exit 0.3s ease forwards'
          : 'toast-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: colors.bar,
          borderRadius: '0 3px 0 0',
          animation: `toast-progress ${duration}ms linear forwards`,
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        <Icon size={15} style={{ color: colors.icon }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
          }}
        >
          {toast.title}
        </div>
        {toast.message && (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: '3px',
              lineHeight: 1.4,
            }}
          >
            {toast.message}
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-dim)',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message, duration }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none',
          }}
        >
          {toasts.map((toast) => (
            <div key={toast.id} style={{ pointerEvents: 'auto' }}>
              <ToastItem toast={toast} onDismiss={dismissToast} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};
