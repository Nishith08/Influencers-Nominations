import React from 'react';

const TreeNode = ({ node }) => {
  return (
    <li>
      <div className="node-card">
        👤 {node.name}
      </div>
      {/* If children exist, create a new sub-list (ul) */}
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

const NetworkTree = ({ data }) => {
  if (!data || data.length === 0) return <p>No network data available.</p>;

  return (
    <div className="tree">
      <ul>
        {/* Handle both single object or array of roots */}
        {Array.isArray(data) ? (
            data.map((root, i) => <TreeNode key={i} node={root} />)
        ) : (
            <TreeNode node={data} />
        )}
      </ul>
    </div>
  );
};

export default NetworkTree;