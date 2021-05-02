import React, { useState, useEffect } from 'react';
import './index.css';
import { MinusOutlined, ShrinkOutlined, ShareAltOutlined, CloseOutlined } from '@ant-design/icons';
const { ipcRenderer } = window.require('electron');

const WindowTop = () => {
  const [isMaximized, setIsMaximized] = useState(null);

  const mainProcessListner = () => {
    ipcRenderer.on('maximized', () => {
      setIsMaximized(true);
    });

    ipcRenderer.on('unmaximized', () => {
      setIsMaximized(false);
    });
  };

  useEffect(() => {
    setIsMaximized(ipcRenderer.send('isMaximized'));
    mainProcessListner();
  }, []);

  const minHandler = () => {
    ipcRenderer.send('minimize');
  };
  const maxHandler = () => {
    if (!isMaximized) {
      ipcRenderer.send('maximize');
      setIsMaximized(true);
    } else {
      ipcRenderer.send('unmaximize');
      setIsMaximized(false);
    }
  };
  const closeHandler = () => {
    ipcRenderer.send('close');
  };
  return (
    <div className='top'>
      <button onClick={minHandler}>
        <MinusOutlined />
      </button>
      <button onClick={maxHandler}>{isMaximized ? <ShrinkOutlined /> : <ShareAltOutlined />}</button>
      <button onClick={closeHandler}>
        <CloseOutlined />
      </button>
    </div>
  );
};

export default WindowTop;
