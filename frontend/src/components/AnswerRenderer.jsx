import React, { useState } from 'react';

export function AnswerRenderer({ content }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!content || !content.trim()) {
    return null;
  }

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  try {
    const formatText = (txt) => {
      if (!txt || typeof txt !== 'string') return txt;
      try {
        const delimiter = '\x01';
        let s = txt
          .replace(/`([^`\n]+)`/g, (_, c) => `${delimiter}IC${delimiter}${c}${delimiter}`)
          .replace(/\*\*([^*\n]+)\*\*/g, (_, b) => `${delimiter}BO${delimiter}${b}${delimiter}`)
          .replace(/\*([^*\n]+)\*/g, (_, b) => `${delimiter}IT${delimiter}${b}${delimiter}`);
        
        const parts = s.split(delimiter);
        const out = [];
        let k = 0;
        
        while (k < parts.length) {
          if ((parts[k] === 'IC' || parts[k] === 'BO' || parts[k] === 'IT') && k + 1 < parts.length) {
            const type = parts[k];
            const textContent = parts[k + 1];
            if (type === 'IC') out.push(<code key={k} className="inline-code">{textContent}</code>);
            else if (type === 'BO') out.push(<strong key={k} className="font-semibold text-gray-900">{textContent}</strong>);
            else out.push(<em key={k}>{textContent}</em>);
            k += 3;
          } else {
            if (parts[k]) out.push(parts[k]);
            k++;
          }
        }
        return out.length ? out : txt;
      } catch (e) {
        return txt;
      }
    };

    const isInterviewFormat = (raw) => /Q\[\d+\]:/i.test(raw) && /A\[\d+\]:/i.test(raw);

    const parseInterview = (raw) => {
      const pairs = [];

      // Split by [NEXT] separator
      const blocks = raw
        .split('[NEXT]')
        .map(b => b.trim())
        .filter(b => b.length > 0);

      blocks.forEach(block => {
        // Find Q line
        const qMatch = block.match(/Q\[\d+\]:\s*(.+?)(?=\nA\[\d+\]:)/s);
        // Find A line
        const aMatch = block.match(/A\[\d+\]:\s*(.+?)$/s);

        if (qMatch && aMatch) {
          pairs.push({
            q: `Q[${pairs.length + 1}]: ${qMatch[1].trim()}`,
            a: `A[${pairs.length + 1}]: ${aMatch[1].trim()}`
          });
        }
      });

      // Fallback: if [NEXT] parsing fails, try line by line parsing
      if (pairs.length === 0) {
        const lines = raw.split('\n');
        let currentQ = null;
        let currentA = null;

        lines.forEach(line => {
          const trimmed = line.trim();
          if (/^Q\[\d+\]:/.test(trimmed)) {
            if (currentQ && currentA) {
              pairs.push({ q: currentQ, a: currentA });
            }
            currentQ = trimmed;
            currentA = null;
          } else if (/^A\[\d+\]:/.test(trimmed)) {
            currentA = trimmed;
          } else if (currentA && trimmed) {
            currentA += ' ' + trimmed;
          } else if (currentQ && !currentA && trimmed) {
            currentQ += ' ' + trimmed;
          }
        });

        // Push last pair
        if (currentQ && currentA) {
          pairs.push({ q: currentQ, a: currentA });
        }
      }

      return pairs;
    };

    const renderInterview = (raw) => {
      const pairs = parseInterview(raw);
      const fmt = formatText;

      if (pairs.length === 0) {
        // Fallback plain text render
        return (
          <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {raw}
          </pre>
        );
      }

      return (
        <div className="space-y-3">
          {pairs.map((pair, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white hover:bg-gray-50 transition-all">
              {/* Question */}
              <p className="text-sm font-semibold text-gray-900 leading-relaxed mb-3">
                {fmt(pair.q)}
              </p>
              {/* Answer */}
              <div className="pl-3 border-l-2 border-green-300">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {fmt(pair.a)}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    };

    if (isInterviewFormat(content)) {
      return renderInterview(content);
    }

    const lines = content.split('\n');
    const elements = [];
    let i = 0;

    const isFlowStep = (ln) => /^[1-9️⃣🔟]+[\s\uFE0F]*[\.:\-\)]/.test(ln) || /^\d+️⃣/.test(ln) || /^[①-⑩]/.test(ln);
    const isArrow = (ln) => /^\s*[↓→←↑▼▶]/.test(ln) || ln.trim() === '↓' || ln.trim() === '→';
    const isSub = (ln) => /^\s{2,}\(/.test(ln) || /^\s*\(/.test(ln);

    while (i < lines.length) {
      const ln = lines[i];
      const trimmed = ln.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      if (/^[-─═]{3,}$/.test(trimmed)) {
        elements.push(<hr key={`hr-${i}`} className="border-t border-gray-200 my-3" />);
        i++;
        continue;
      }

      if (/^#{1,3}\s/.test(ln)) {
        elements.push(
          <div key={`h-${i}`} className="text-base font-semibold text-gray-900 mb-2 pb-2 border-b border-gray-100">
            {ln.replace(/^#+\s*/, '').replace(/\*\*/g, '')}
          </div>
        );
        i++;
        continue;
      }

      if (/^\*\*[^*]+\*\*:?\s*$/.test(trimmed)) {
        elements.push(
          <div key={`sub-${i}`} className="text-xs font-semibold text-green-600 uppercase tracking-wider mt-3 mb-1">
            {trimmed.replace(/\*\*/g, '').replace(/:$/, '')}
          </div>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('```')) {
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        const codeContent = codeLines.join('\n');
        const codeIndex = i;
        elements.push(
          <div key={`code-${i}`} className="code-block group">
            <button
              onClick={() => copyToClipboard(codeContent, codeIndex)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copiedIndex === codeIndex ? 'Copied!' : 'Copy'}
            </button>
            <pre className="mt-2">{codeContent}</pre>
          </div>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('|')) {
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          if (!/^[\|\s\-:]+$/.test(lines[i].trim())) {
            tableLines.push(lines[i].trim().split('|').filter(c => c.trim() !== ''));
          }
          i++;
        }
        if (tableLines.length > 0) {
          const [header, ...rows] = tableLines;
          elements.push(
            <table key={`tbl-${i}`} className="w-full border-collapse text-xs rounded-lg overflow-hidden my-2">
              <thead>
                <tr>
                  {header.map((c, k) => (
                    <th key={k} className="bg-gray-50 text-gray-500 font-semibold px-3 py-2 border border-gray-200 text-[10px] uppercase tracking-wider">
                      {c.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, k) => (
                  <tr key={k}>
                    {r.map((c, j) => (
                      <td key={j} className="px-3 py-2 border border-gray-200 text-gray-600">
                        {formatText(c.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
        continue;
      }

      if (isFlowStep(trimmed)) {
        elements.push(
          <div key={`fs-${i}`} className="font-semibold text-gray-900 mt-2 text-sm">
            {formatText(trimmed)}
          </div>
        );
        i++;
        continue;
      }

      if (isArrow(trimmed)) {
        elements.push(
          <div key={`arr-${i}`} className="text-green-600 pl-2 text-sm">
            {trimmed}
          </div>
        );
        i++;
        continue;
      }

      if (isSub(ln)) {
        elements.push(
          <div key={`sub2-${i}`} className="text-gray-500 pl-3 text-xs">
            {formatText(trimmed)}
          </div>
        );
        i++;
        continue;
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const items = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          items.push(lines[i].replace(/^\d+\.\s/, '').trim());
          i++;
        }
        elements.push(
          <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 mb-2">
            {items.map((item, k) => (
              <li key={k} className="text-gray-600 text-sm">{formatText(item)}</li>
            ))}
          </ol>
        );
        continue;
      }

      if (/^[-*•]\s/.test(trimmed)) {
        const items = [];
        while (i < lines.length && /^[-*•]\s/.test(lines[i].trim())) {
          items.push(lines[i].replace(/^[-*•]\s/, '').trim());
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 mb-2">
            {items.map((item, k) => (
              <li key={k} className="text-gray-600 text-sm">{formatText(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      const cleaned = ln.replace(/^#+\s/, '');
      if (cleaned.trim()) {
        elements.push(
          <p key={`p-${i}`} className="text-gray-600 text-sm mb-2">
            {formatText(cleaned)}
          </p>
        );
      }
      i++;
    }

    if (elements.length === 0) {
      return (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} className="text-gray-600 text-sm">
          {content}
        </pre>
      );
    }
    return <div className="text-gray-600 leading-relaxed">{elements}</div>;
  } catch (err) {
    return (
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} className="text-gray-600 text-sm">
        {content}
      </pre>
    );
  }
}
