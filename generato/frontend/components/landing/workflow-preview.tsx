const wires = [
  { left: 68, top: 82, width: 170, angle: 0, color: "#62e7ff" },
  { left: 236, top: 84, width: 130, angle: 36, color: "#d9ff3f" },
  { left: 236, top: 196, width: 154, angle: -18, color: "#8c7bff" },
  { left: 386, top: 150, width: 140, angle: 0, color: "#ff7e8f" },
];

const nodes = [
  { left: 22, top: 48, title: "Prompt source", label: "Source" },
  { left: 206, top: 48, title: "Camera path", label: "Transform" },
  { left: 206, top: 176, title: "Style grade", label: "Transform" },
  { left: 414, top: 116, title: "Render output", label: "Output" },
];

export function WorkflowPreview() {
  return (
    <div className="workflow-preview" aria-hidden="true">
      {wires.map((wire, index) => (
        <span
          className="wire"
          key={`${wire.left}-${wire.top}-${index}`}
          style={{
            left: wire.left,
            top: wire.top,
            width: wire.width,
            transform: `rotate(${wire.angle}deg)`,
            background: wire.color,
            boxShadow: `0 0 14px ${wire.color}`,
          }}
        />
      ))}

      {nodes.map((node) => (
        <div className="wire-node" key={node.title} style={{ left: node.left, top: node.top }}>
          <span>{node.label}</span>
          <strong>{node.title}</strong>
        </div>
      ))}
    </div>
  );
}
