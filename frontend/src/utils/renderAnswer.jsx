import React from 'react';

export function renderAnswer(raw) {
  if (!raw || !raw.trim()) return null;
  
  try {
    const lines = raw.split('\n');
    const elements = [];
    let i = 0;

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
            const content = parts[k + 1];
            if (type === 'IC') out.push(<code key={k} className="aic">{content}</code>);
            else if (type === 'BO') out.push(<strong key={k} className="font-semibold text-ink">{content}</strong>);
            else out.push(<em key={k}>{content}</em>);
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
        elements.push(<hr key={`hr-${i}`} className="border-t border-white/10 my-3" />);
        i++;
        continue;
      }

      if (/^#{1,3}\s/.test(ln)) {
        elements.push(
          <div key={`h-${i}`} className="text-base font-semibold text-ink mb-2 pb-2 border-b border-white/6">
            {ln.replace(/^#+\s*/, '').replace(/\*\*/g, '')}
          </div>
        );
        i++;
        continue;
      }

      if (/^\*\*[^*]+\*\*:?\s*$/.test(trimmed)) {
        elements.push(
          <div key={`sub-${i}`} className="text-xs font-semibold text-green uppercase tracking-wider mt-3 mb-1">
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
        elements.push(
          <pre key={`code-${i}`} className="acode">
            {codeLines.join('\n')}
          </pre>
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
                    <th key={k} className="bg-surface text-ink3 font-semibold px-3 py-2 border border-white/10 text-[10px] uppercase tracking-wider">
                      {c.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, k) => (
                  <tr key={k}>
                    {r.map((c, j) => (
                      <td key={j} className="px-3 py-2 border border-white/10 text-ink2">
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
          <div key={`fs-${i}`} className="font-semibold text-ink mt-2 text-sm">
            {formatText(trimmed)}
          </div>
        );
        i++;
        continue;
      }

      if (isArrow(trimmed)) {
        elements.push(
          <div key={`arr-${i}`} className="text-green pl-2 text-sm">
            {trimmed}
          </div>
        );
        i++;
        continue;
      }

      if (isSub(ln)) {
        elements.push(
          <div key={`sub2-${i}`} className="text-ink3 pl-3 text-xs">
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
              <li key={k} className="text-ink2 text-sm">{formatText(item)}</li>
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
              <li key={k} className="text-ink2 text-sm">{formatText(item)}</li>
            ))}
          </ul>
        );
        continue;
      }

      const cleaned = ln.replace(/^#+\s/, '');
      if (cleaned.trim()) {
        elements.push(
          <p key={`p-${i}`} className="text-ink2 text-sm mb-2">
            {formatText(cleaned)}
          </p>
        );
      }
      i++;
    }

    if (elements.length === 0) {
      return (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} className="text-ink2 text-sm">
          {raw}
        </pre>
      );
    }
    return <div className="text-ink2 leading-relaxed">{elements}</div>;
  } catch (err) {
    return (
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }} className="text-ink2 text-sm">
        {raw}
      </pre>
    );
  }
}
