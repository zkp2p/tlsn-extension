import React, { useEffect } from 'react';

const Offscreen = () => {
  useEffect(() => {
    (async () => {
      const { initRPC } = await import('./rpc');
      initRPC();
    })();
  }, []);

  return <div className="Offscreen" />;
};

export default Offscreen;
