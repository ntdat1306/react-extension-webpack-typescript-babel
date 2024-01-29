import React from 'react';
import ReactDOM from 'react-dom/client';
import '@styles/global.scss';
import Popup from './Popup';

const init = () => {
    // Create container
    const container = document.createElement('div');
    container.id = 'react-extension-popup';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    // Render your React component into the container
    root.render(<Popup />);
};

init();
