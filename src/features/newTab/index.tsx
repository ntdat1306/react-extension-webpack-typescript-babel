import React from 'react';
import ReactDOM from 'react-dom/client';
import '@styles/global.scss';
import NewTab from './NewTab';

const init = () => {
    // Create container
    const container = document.createElement('div');
    container.id = 'react-extension-new-tab';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    // Render your React component into the container
    root.render(<NewTab />);
};

init();
