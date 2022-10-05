// @ts-nocheck

import React, { memo } from 'react';
import { Handle } from 'reactflow';

const IncomeNode = ({ data, isConnectable }) => {
  return (
    <>
      {/* <Handle
        type="target"
        position="left"
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      /> */}
      <div style={{backgroundColor: "#fff", padding: '10px', margin: '10px', color: '#000'}}>
        Income: <strong>{data.amount}</strong>
      </div>
      {/* <input className="nodrag" type="color" onChange={data.onChange} defaultValue={data.color} /> */}
      <Handle
        type="source"
        position="right"
        id="a"
        style={{ top: 25, background: '#555' }}
        isConnectable={isConnectable}
      />
      {/* <Handle
        type="source"
        position="right"
        id="b"
        style={{ bottom: 10, top: 'auto', background: '#555' }}
        isConnectable={isConnectable}
      /> */}
    </>
  );
};

export default memo(IncomeNode);