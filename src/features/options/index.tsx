import React from 'react';
import ReactDOM from 'react-dom/client';
import Options from './Options';

const init = () => {
    // Create container
    const container = document.createElement('div');
    container.id = 'react-extension-options';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    // Render your React component into the container
    root.render(<Options />);
};

init();
