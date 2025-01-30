import React from 'react';

const Script = ({ children, src, ...props }: any) => (
  <script src={src} {...props}>
    {children}
  </script>
);

export default Script; 