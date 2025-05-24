import React from 'react';

const ErrorMessage = ({ message, type = 'error_general', onClose }) => {
  const getErrorStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-orange-900/30 border-orange-800/50',
          text: 'text-orange-200',
          icon: 'text-orange-400'
        };
      case 'info':
        return {
          container: 'bg-blue-900/30 border-blue-800/50',
          text: 'text-blue-200',
          icon: 'text-blue-400'
        };
      case 'success':
        return {
          container: 'bg-green-900/30 border-green-800/50',
          text: 'text-green-200',
          icon: 'text-green-400'
        };
      case 'licencia_duplicada':
      case 'email_duplicado':
        return {
          container: 'bg-orange-900/30 border-orange-800/50',
          text: 'text-orange-200',
          icon: 'text-orange-400'
        };
      default:
        return {
          container: 'bg-red-900/30 border-red-800/50',
          text: 'text-red-200',
          icon: 'text-red-400'
        };
    }
  };

  const styles = getErrorStyles();

  if (!message) return null;

  return (
    <div className={`rounded-md p-4 ${styles.container} border animate-fade-in`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg 
            className={`h-5 w-5 ${styles.icon}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            {type === 'success' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : type === 'info' ? (
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
        </div>
        <div className="ml-3 flex-grow">
          <p className={`text-sm ${styles.text}`}>
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              className={`inline-flex rounded-md p-1.5 ${styles.text} hover:${styles.icon} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary`}
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage; 