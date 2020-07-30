import React from 'react';
import Discord from './Page/Discord-tool.js';
import Manual from './Page/Manual.js';
import Login from './Page/Login';
import { HashRouter, Route } from 'react-router-dom';

function App() {
  //React Toute 路由
  return (
    <HashRouter>
      <div>
        <Route path='/login' component={Login} />
        <Route exact path='/' component={Discord} />
        <Route path='/manual' component={Manual} />
      </div>
    </HashRouter>
  );
}

export default App;
