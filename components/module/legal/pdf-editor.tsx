"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Save } from "lucide-react"

interface PDFEditorProps {
  documentType: string
  documentData: {
    metadata?: {
      content?: string
    }
  }
  onSave: (data: { content: string }) => void
}

const getTemplate = (type: string) => {
  switch (type) {
    case 'will':
      return 'Will template content...'
    default:
      return 'Default template content...'
  }
}

export function PDFEditor({ documentType, documentData, onSave }: PDFEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [initialContent] = useState<string>(() => {
    if (documentData?.metadata?.content) {
      return documentData.metadata.content
    }
    return getTemplate(documentType)
  })

  const handleSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onSave({ content })
    }
  }

  const handleDownloadPDF = async () => {
    alert('PDF download will be implemented')
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Document Editor</h2>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[500px] p-4 border rounded-lg bg-white text-black"
          dangerouslySetInnerHTML={{ __html: initialContent }}
        />
      </CardContent>
    </Card>
  )
}
