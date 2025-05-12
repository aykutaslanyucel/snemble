
import { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { LinkDialog } from "./ui/link-dialog";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [editorHtml, setEditorHtml] = useState(value);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  
  // Handle external value changes
  useEffect(() => {
    if (value !== editorHtml) {
      setEditorHtml(value);
    }
  }, [value]);
  
  const handleChange = (html: string) => {
    setEditorHtml(html);
    onChange(html);
  };
  
  const handleInsertLink = () => {
    setShowLinkDialog(true);
  };
  
  const handleSubmitLink = (url: string, text: string) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      if (range) {
        // If text is provided, insert it and format as link
        if (text) {
          editor.deleteText(range.index, range.length);
          editor.insertText(range.index, text);
          editor.formatText(range.index, text.length, 'link', url);
          editor.setSelection(range.index + text.length, 0);
        } else {
          // If no selection, just format the selected text as link
          editor.formatText(range.index, range.length, 'link', url);
        }
      } else {
        // If no selection, insert at the end
        const length = editor.getLength();
        const textToInsert = text || url;
        editor.insertText(length - 1, textToInsert);
        editor.formatText(length - 1, textToInsert.length, 'link', url);
      }
    }
  };

  // Custom toolbar handlers
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        link: handleInsertLink
      }
    }
  };

  return (
    <div className="rich-text-editor" style={{ zIndex: 50, position: "relative" }}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorHtml}
        onChange={handleChange}
        modules={modules}
        style={{ minHeight: '200px' }}
      />
      <LinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onSubmit={handleSubmitLink}
      />
      
      <style>
        {`
        .rich-text-editor .ql-editor {
          min-height: 150px;
        }
        
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          z-index: 40 !important;
          position: relative;
        }
        
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          z-index: 40 !important;
          position: relative;
        }
        
        .ql-tooltip {
          z-index: 100 !important;
        }
        `}
      </style>
    </div>
  );
}
