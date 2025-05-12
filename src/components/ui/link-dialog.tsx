
import * as React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Input } from './input'
import { Label } from './label'
import { Button } from './button'

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (url: string, text: string) => void
  initialUrl?: string
  initialText?: string
}

export function LinkDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  initialUrl = '',
  initialText = '' 
}: LinkDialogProps) {
  const [url, setUrl] = React.useState(initialUrl)
  const [text, setText] = React.useState(initialText)
  
  React.useEffect(() => {
    if (open) {
      setUrl(initialUrl)
      setText(initialText)
    }
  }, [open, initialUrl, initialText])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(url, text)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] z-[9999]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>
              Add a hyperlink to your content
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="text">Link Text</Label>
              <Input
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Display text"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Insert Link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
