"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Strikethrough,
  Undo,
  Redo,
} from "lucide-react";
import { useState } from 'react';
import { toast } from 'sonner';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import DOMPurify from 'isomorphic-dompurify';
import { LinkDialog } from './link-dialog';

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
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full h-auto',
        },
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:underline',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content: DOMPurify.sanitize(content),
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-3 py-2',
        placeholder: placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      // Sanitize HTML before saving
      const sanitizedHtml = DOMPurify.sanitize(editor.getHTML());
      onChange?.(sanitizedHtml);
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const loadingToast = toast.loading('Uploading image...');

      // Generate a unique filename
      const filename = `${nanoid()}-${file.name}`;
      const blob = await put(filename, file, {
        access: 'public',
        token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN!
      });

      editor?.chain().focus().setImage({ src: blob.url }).run();
      toast.dismiss(loadingToast);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkSubmit = (url: string) => {
    if (!editor) return;
    
    // If text is selected, turn it into a link
    if (editor.state.selection.empty) {
      // If no text is selected, insert the URL as a link
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'text',
            text: url,
            marks: [
              {
                type: 'link',
                attrs: { href: url }
              }
            ]
          }
        ])
        .run();
    } else {
      // If text is selected, convert it to a link
      editor
        .chain()
        .focus()
        .setLink({ href: url })
        .run();
    }
  };

  const handleLinkButtonClick = () => {
    // If a link is selected, unset it
    if (editor?.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    // Otherwise show the link dialog
    setShowLinkDialog(true);
  };

  if (!editor) return null;

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <div className="border-b p-2 flex gap-1 flex-wrap bg-muted/50">
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-px h-6 bg-border mx-2 my-auto" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            data-active={editor.isActive('heading', { level: 1 })}
            className="data-[active=true]:bg-muted"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            data-active={editor.isActive('heading', { level: 2 })}
            className="data-[active=true]:bg-muted"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-2 my-auto" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive('bold')}
            className="data-[active=true]:bg-muted"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive('italic')}
            className="data-[active=true]:bg-muted"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            data-active={editor.isActive('strike')}
            className="data-[active=true]:bg-muted"
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            data-active={editor.isActive('code')}
            className="data-[active=true]:bg-muted"
            title="Code"
          >
            <Code className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-2 my-auto" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive('bulletList')}
            className="data-[active=true]:bg-muted"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive('orderedList')}
            className="data-[active=true]:bg-muted"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            data-active={editor.isActive('blockquote')}
            className="data-[active=true]:bg-muted"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-2 my-auto" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLinkButtonClick}
            data-active={editor.isActive('link')}
            className="data-[active=true]:bg-muted"
            title={editor.isActive('link') ? "Remove Link" : "Add Link"}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              disabled={isUploading}
              className="relative"
              title="Upload Image"
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
        <EditorContent editor={editor} />
      </div>
      <LinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onSubmit={handleLinkSubmit}
      />
    </>
  );
} 