interface SimpleToken {
  kind: string;
  raw: string;
  label: string;
}

export function generateMermaidDiagram(tokens: SimpleToken[]): string {
  if (!tokens || tokens.length === 0) {
    return 'flowchart LR\n  Start([Start]) --> End([End])';
  }

  const lines: string[] = ['flowchart LR', '  Start([● Start])'];
  let prevNodeId = 'Start';

  tokens.forEach((t, i) => {
    const nodeId = `N${i}`;
    const cleanRaw = t.raw.replace(/"/g, "'").replace(/[\[\]]/g, '\\$&');
    const cleanLabel = t.label.replace(/"/g, "'");

    if (t.kind === 'ANCHOR_START') {
      lines.push(`  ${nodeId}{{"^ Start"}}`);
    } else if (t.kind === 'ANCHOR_END') {
      lines.push(`  ${nodeId}{{"$ End"}}`);
    } else if (t.kind === 'ALTERNATION') {
      lines.push(`  ${nodeId}{{"OR |"}}`);
    } else if (t.kind === 'QUANTIFIER') {
      lines.push(`  ${nodeId}[/"${cleanRaw} (${cleanLabel})"/\\]`);
    } else {
      lines.push(`  ${nodeId}["${cleanRaw} <br/> <small>${cleanLabel}</small>"]`);
    }

    lines.push(`  ${prevNodeId} --> ${nodeId}`);
    prevNodeId = nodeId;
  });

  lines.push('  End([■ End])');
  lines.push(`  ${prevNodeId} --> End`);

  return lines.join('\n');
}

export async function exportSvgAsPng(svgElement: SVGSVGElement, filename = 'regex-railroad.png'): Promise<void> {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = () => {
    const scale = 2; // High-res retina
    const canvas = document.createElement('canvas');
    canvas.width = svgElement.clientWidth * scale || 1200;
    canvas.height = svgElement.clientHeight * scale || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobURL);
  };
  image.src = blobURL;
}
