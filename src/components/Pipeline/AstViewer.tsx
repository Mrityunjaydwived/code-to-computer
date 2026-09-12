import React, { useState } from 'react';
import { GitFork, ChevronDown, ChevronRight } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';
import { ASTNode } from '../../engine/types';

interface TreeNodeProps {
  node: ASTNode;
  level?: number;
  onSelect: (node: ASTNode) => void;
  selectedId?: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level = 0, onSelect, selectedId }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!node) return null;

  const isSelected = selectedId === node.id;

  const children: ASTNode[] = [];
  if (node.body && Array.isArray(node.body)) children.push(...node.body);
  if (node.consequent && Array.isArray(node.consequent)) children.push(...node.consequent);
  if (node.alternate && Array.isArray(node.alternate)) children.push(...node.alternate);
  if (node.left) children.push(node.left);
  if (node.right) children.push(node.right);
  if (node.value && typeof node.value === 'object' && node.value.type) children.push(node.value);
  if (node.target && typeof node.target === 'object' && node.target.type) children.push(node.target);
  if (node.condition && typeof node.condition === 'object') children.push(node.condition);
  if (node.args && Array.isArray(node.args)) children.push(...node.args);
  if (node.elements && Array.isArray(node.elements)) children.push(...node.elements);

  const hasChildren = children.length > 0;

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'Program':
        return 'text-[#2874F0] bg-[#E8F0FE] border-[#2874F0]/30';
      case 'Assignment':
        return 'text-[#2874F0] bg-[#E8F0FE] border-[#2874F0]/40';
      case 'BinaryExpression':
        return 'text-[#F09120] bg-[#FFF8E1] border-[#F09120]/40';
      case 'IfStatement':
      case 'WhileStatement':
      case 'ForStatement':
        return 'text-[#2874F0] bg-[#E8F0FE] border-[#2874F0]/40';
      case 'Literal':
        return 'text-[#388E3C] bg-[#E8F5E9] border-[#388E3C]/40';
      case 'Identifier':
        return 'text-[#1F74BA] bg-[#E8F0FE] border-[#1F74BA]/30';
      default:
        return 'text-[#212121] bg-[#FAFAFA] border-[#E0E0E0]';
    }
  };

  return (
    <div className="flex flex-col ml-3 pl-2 border-l border-[#E0E0E0] my-1 font-mono text-xs">
      <div className="flex items-center gap-1.5">
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 rounded text-[#878787] hover:text-[#212121]"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <button
          onClick={() => onSelect(node)}
          className={`px-2.5 py-1 rounded-md border transition-all text-left flex items-center gap-2 ${getNodeColor(
            node.type
          )} ${isSelected ? 'ring-2 ring-[#2874F0] scale-102 font-bold shadow-xs' : 'hover:border-[#2874F0]'}`}
        >
          <span className="font-bold">{node.type}</span>
          {node.name && <span className="text-[#666666] font-normal">'{node.name}'</span>}
          {node.operator && (
            <span className="px-1.5 py-0.2 rounded bg-white text-[#F09120] font-bold border border-[#E0E0E0]">
              {node.operator}
            </span>
          )}
          {node.value !== undefined && typeof node.value !== 'object' && (
            <span className="text-[#388E3C] font-bold">{String(node.value)}</span>
          )}
          {node.target && typeof node.target === 'string' && (
            <span className="text-[#2874F0]">target: {node.target}</span>
          )}
        </button>
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col">
          {children.map((child, idx) => (
            <TreeNode
              key={child.id || idx}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AstViewer: React.FC = () => {
  const { ast } = useExecutionStore();
  const [selectedNode, setSelectedNode] = useState<ASTNode | null>(null);

  if (!ast) {
    return (
      <div className="p-8 text-center text-xs text-[#878787] font-mono bg-[#FAFAFA] rounded-xl border border-[#E0E0E0]">
        No AST generated yet. Run or re-analyze the program.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-[#2874F0]" />
          <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
            Abstract Syntax Tree (AST) Hierarchy
          </h2>
        </div>
        <span className="text-[11px] text-[#878787] font-mono hidden sm:inline">
          Syntax Analysis • Parser Output
        </span>
      </div>

      {/* Tree Visualization Container */}
      <div className="max-h-72 overflow-y-auto p-3 bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl shadow-inner">
        <TreeNode
          node={ast}
          onSelect={(n) => setSelectedNode(n)}
          selectedId={selectedNode?.id}
        />
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#2874F0]/30 text-xs font-mono space-y-1.5 animate-in fade-in duration-150 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-1">
            <span className="text-[#2874F0] font-bold">Node: {selectedNode.type}</span>
            <span className="text-[#878787] text-[10px]">ID: {selectedNode.id}</span>
          </div>
          <p className="text-[11px] text-[#666666] font-sans">{selectedNode.description}</p>
        </div>
      )}
    </div>
  );
};
