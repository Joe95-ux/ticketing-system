"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Image as ImageIcon
} from "lucide-react";
import { useState } from 'react';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ 
  content = '', 
  onChange,
  placeholder = 'Write something...'
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full h-auto',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px]',
        placeholder: placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="border rounded-lg">
      <div className="border-b p-2 flex gap-1 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
          className="data-[active=true]:bg-muted"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic')}
          className="data-[active=true]:bg-muted"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive('bulletList')}
          className="data-[active=true]:bg-muted"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive('orderedList')}
          className="data-[active=true]:bg-muted"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            disabled={isUploading}
            className="relative"
          >
            <ImageIcon className="h-4 w-4" />
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </Button>
        </div>
      </div>
      <div className="p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
} 