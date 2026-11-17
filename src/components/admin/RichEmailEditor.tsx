import React, { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';

export interface RichEmailEditorHandle {
  insertText: (text: string) => void;
}

interface Props {
  value: string;
  onChange: (html: string) => void;
  /** Bump to force the editor to reload `value` (template switch / reset). */
  resetKey?: string;
}

const COLORS = ['#0f172a', '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#64748b'];

/**
 * Gmail-style visual editor: type directly, format with the toolbar.
 * (contentEditable + execCommand — no HTML knowledge needed.)
 */
export const RichEmailEditor = forwardRef<RichEmailEditorHandle, Props>(({ value, onChange, resetKey }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef<string>('');

  // Load external value only when it differs from what the editor itself produced
  useEffect(() => {
    const el = editorRef.current;
    if (el && value !== lastEmitted.current) {
      el.innerHTML = value;
      lastEmitted.current = value;
    }
  }, [value, resetKey]);

  const emit = () => {
    const html = editorRef.current?.innerHTML ?? '';
    lastEmitted.current = html;
    onChange(html);
  };

  const exec = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      editorRef.current?.focus();
      document.execCommand('insertText', false, text);
      emit();
    },
  }));

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)');
    if (url && /^(https?:\/\/|mailto:)/i.test(url.trim())) exec('createLink', url.trim());
    else if (url) window.alert('Please enter a URL starting with https:// or mailto:');
  };

  const Btn: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({ title, onClick, children }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      // mouseDown preventDefault keeps the text selection while clicking toolbar buttons
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="h-8 min-w-8 px-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-200 cursor-pointer flex items-center justify-center"
    >
      {children}
    </button>
  );

  const Icon = ({ name }: { name: string }) => <span className="material-symbols-outlined text-[18px]">{name}</span>;
  const Sep = () => <span className="w-px h-5 bg-neutral-300 mx-1" />;

  return (
    <div className="rounded-2xl border border-neutral-300 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary/40">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-neutral-100 border-b border-neutral-200">
        <Btn title="Undo" onClick={() => exec('undo')}><Icon name="undo" /></Btn>
        <Btn title="Redo" onClick={() => exec('redo')}><Icon name="redo" /></Btn>
        <Sep />
        <Btn title="Heading" onClick={() => exec('formatBlock', 'h2')}><span className="font-bold text-xs">H</span></Btn>
        <Btn title="Normal text" onClick={() => exec('formatBlock', 'p')}><span className="text-xs">¶</span></Btn>
        <Sep />
        <Btn title="Bold" onClick={() => exec('bold')}><Icon name="format_bold" /></Btn>
        <Btn title="Italic" onClick={() => exec('italic')}><Icon name="format_italic" /></Btn>
        <Btn title="Underline" onClick={() => exec('underline')}><Icon name="format_underlined" /></Btn>
        <Sep />
        <Btn title="Bulleted list" onClick={() => exec('insertUnorderedList')}><Icon name="format_list_bulleted" /></Btn>
        <Btn title="Numbered list" onClick={() => exec('insertOrderedList')}><Icon name="format_list_numbered" /></Btn>
        <Btn title="Align left" onClick={() => exec('justifyLeft')}><Icon name="format_align_left" /></Btn>
        <Btn title="Align center" onClick={() => exec('justifyCenter')}><Icon name="format_align_center" /></Btn>
        <Sep />
        <Btn title="Insert link" onClick={addLink}><Icon name="link" /></Btn>
        <Btn title="Remove link" onClick={() => exec('unlink')}><Icon name="link_off" /></Btn>
        <Sep />
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={`Text color ${c}`}
            aria-label={`Text color ${c}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('foreColor', c)}
            className="w-5 h-5 rounded-full border border-white shadow ring-1 ring-neutral-300 mx-0.5 cursor-pointer"
            style={{ background: c }}
          />
        ))}
        <Sep />
        <Btn title="Clear formatting" onClick={() => exec('removeFormat')}><Icon name="format_clear" /></Btn>
      </div>

      {/* The “paper” — what you see is what the recipient gets */}
      <div className="bg-slate-100 p-3 sm:p-4">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onInput={emit}
          onBlur={emit}
          onPaste={(e) => {
            // Paste as plain text so foreign styles never leak into the email
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
          }}
          className="min-h-[320px] bg-white rounded-xl p-4 text-sm text-slate-700 outline-none overflow-auto [&_a]:text-blue-600 [&_a]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2"
        />
      </div>
    </div>
  );
});
RichEmailEditor.displayName = 'RichEmailEditor';
