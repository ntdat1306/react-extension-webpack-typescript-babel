import React from 'react';
import ReactDOM from 'react-dom/client';
import ContentScripts from './ContentScripts';

const init = () => {
    // Create container
    const container = document.createElement('div');
    container.id = 'react-extension-content-scripts';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    // Render your React component into the container
    root.render(<ContentScripts />);
};

init();
