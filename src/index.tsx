import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

import './styles/vendor/reset.css';
import './styles/colors.css';
import './styles/main.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
