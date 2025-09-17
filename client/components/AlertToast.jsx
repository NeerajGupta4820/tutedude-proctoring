import React from 'react';

const AlertToast = ({ message }) => (
  <div className="fixed bottom-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded shadow">
    {message}
  </div>
);

export default AlertToast;
