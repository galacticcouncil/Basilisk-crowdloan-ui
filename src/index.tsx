import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import log, { LogLevelDesc } from 'loglevel'
import linearScale from 'simple-linear-scale';

var scaleFunction = linearScale([10, 20], [10, 0], true);
console.log('scaleFunction', scaleFunction(11)) // 10

// <reference types="simple-linear-scale.d.ts">

let logLevel = (() => {
  let params = (new URL(document.location as unknown as string)).searchParams;
  return params.get('loglevel') as LogLevelDesc;
})() || 'info'

log.setLevel(logLevel)

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
