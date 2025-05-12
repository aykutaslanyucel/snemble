
import React, { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import "./ui/toast.tsx";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectionRange, setSelectionRange] = useState<any>(null);

  // Initialize toolbar handlers
  useEffect(() => {
    if (!quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    
    // Custom handler for links to show dialog
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('link', () => {
      const range = quill.getSelection();
      
      if (range && range.length > 0) {
        const text = quill.getText(range.index, range.length);
        setLinkText(text);
        setSelectionRange(range);
        setShowLinkDialog(true);
      } else {
        setLinkText('');
        setSelectionRange({ index: quill.getSelection()?.index || 0, length: 0 });
        setShowLinkDialog(true);
      }
    });
  }, []);

  const insertLink = () => {
    if (!quillRef.current || !selectionRange) return;
    
    const quill = quillRef.current.getEditor();
    
    if (linkUrl) {
      if (selectionRange.length > 0) {
        quill.formatText(selectionRange.index, selectionRange.length, 'link', linkUrl);
      } else {
        const linkToInsert = linkText || linkUrl;
        quill.insertText(selectionRange.index, linkToInsert, 'link', linkUrl);
      }
    }
    
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Custom module configuration for Quill
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link'],
        ['clean'],
      ],
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link',
  ];

  return (
    <div className="relative">
      <style>{`
        .ql-toolbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background-color: var(--background);
          border: 1px solid var(--border);
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
        }
        .ql-container {
          border: 1px solid var(--border);
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          border-top: none;
          min-height: 150px;
        }
        .ql-editor {
          min-height: 150px;
          font-size: 1rem;
        }
      `}</style>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md" style={{ zIndex: 100 }}>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-text">Link Text</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Display text"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={insertLink}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
