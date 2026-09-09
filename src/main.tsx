import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './client/App';
import './index.css';
import { createMatchID, createPlayerID } from './model/board';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="table-seats">
      {/*two different player in same match*/}
      <App matchID={createMatchID(1)} playerID={createPlayerID(0)} />
      <App matchID={createMatchID(1)} playerID={createPlayerID(1)} />
    </div>
  </React.StrictMode>
);
