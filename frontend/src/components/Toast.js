import React, { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
    const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
    const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
                        <span style={{ flex: 1 }}>{toast.message}</span>
                        <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) return { success: () => { }, error: () => { }, info: () => { }, addToast: () => { } };
    return ctx;
};
