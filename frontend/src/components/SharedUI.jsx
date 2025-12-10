import React from 'react';
import { FiLoader, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

// 1. Card Component
export const Card = ({ children, style, className = "" }) => (
    <div 
        className={`bg-white shadow-lg p-6 rounded-xl ${className}`} 
        style={style}
    >
        {children}
    </div>
);

// 2. Spinner Component
export const Spinner = ({ size = "md", className = "" }) => {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };
    return (
        <div className="flex justify-center items-center p-4">
            <FiLoader className={`animate-spin text-green-600 ${sizeClasses[size]} ${className}`} />
        </div>
    );
};

// 3. Alert Component
export const Alert = ({ type = 'info', children, className = "", style }) => {
    const colorClasses = {
        info: 'bg-blue-50 border-blue-200 text-blue-700',
        error: 'bg-red-50 border-red-200 text-red-700',
        success: 'bg-green-50 border-green-200 text-green-700',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    };

    const Icon = type === 'error' ? FiAlertTriangle : FiCheckCircle;

    return (
        <div 
            className={`p-4 border rounded-lg flex items-center gap-3 ${colorClasses[type]} ${className}`}
            style={style}
        >
            <Icon size={20} className="flex-shrink-0" />
            <p>{children}</p>
        </div>
    );
};

// 4. Button Component
export const Button = ({ children, onClick, disabled, className = "" }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-6 py-2 rounded-lg font-semibold transition-colors 
            ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}
            ${className}`}
    >
        {children}
    </button>
);

// 5. Select (Dropdown) Component
export const Select = ({ children, onChange, value, defaultValue, className = "" }) => (
    <select
        onChange={onChange}
        value={value}
        defaultValue={defaultValue}
        className={`p-2 border border-slate-300 rounded-lg focus:ring-green-600 focus:border-green-600 ${className}`}
    >
        {children}
    </select>
);

// 6. Textarea Component
export const Textarea = ({ placeholder, value, onChange, rows = 5, disabled, style }) => (
    <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        className="w-full p-3 border border-slate-300 rounded-lg resize-y focus:ring-green-600 focus:border-green-600"
        style={style}
    />
);

// 7. Modal Component
export const Modal = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-xl w-full" style={{ padding: 0 }}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-red-600">
                        &times;
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </Card>
        </div>
    );
};
// ... (The existing Card, Spinner, Alert, Button, Select, Textarea, and Modal exports)

// 8. Table Component (PLACHOLDER to prevent crash in HRFeedbackPage.jsx)
export const Table = ({ data, columns, keyField }) => {
    if (!data || data.length === 0) return <p className="p-4 text-center text-slate-500">No data available.</p>;

    return (
        <div className="overflow-x-auto shadow-md rounded-lg mt-4">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        {columns.map(col => (
                            <th key={col.header} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {data.map(item => (
                        <tr key={item[keyField]} className="hover:bg-slate-50">
                            {columns.map(col => (
                                <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {col.render ? col.render(item) : item[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};