
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Write your announcement here...' }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'min-h-[100px] p-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })
  
  if (!editor) {
    return null
  }

  const setLink = () => {
    // cancelled
    if (linkUrl === '') {
      return
    }

    // add https:// if not present
    const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') 
      ? linkUrl 
      : `https://${linkUrl}`

    // activate link extension
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } else {
      editor.chain().focus().toggleLink({ href: url }).run()
    }
    
    setLinkUrl('')
  }

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 p-1 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
          type="button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
          type="button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-muted' : ''}
          type="button"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={editor.isActive('link') ? 'bg-muted' : ''}
              type="button"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="flex flex-col gap-2">
              <label className="text-sm">Add Link URL:</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <Button onClick={setLink} type="button" size="sm">Add</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  )
}
