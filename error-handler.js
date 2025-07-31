// Error handling and loading state management
class ErrorBoundary {
    static handleError(error, component) {
        console.error(`Error in ${component}:`, error);
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.innerHTML = `
            <p>Something went wrong. Please try again.</p>
            <button onclick="window.location.reload()">Reload Page</button>
        `;
        return errorContainer;
    }

    static showLoading(container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
    }

    static hideLoading(container) {
        const spinner = container.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

// Add loading spinner CSS
const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--color-gray-200);
        border-top: 4px solid var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .error-message {
        text-align: center;
        padding: 2rem;
        background-color: var(--color-bg-4);
        border-radius: 8px;
        margin: 1rem;
    }
    
    .error-message button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: var(--color-primary);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
`;
document.head.appendChild(style);
