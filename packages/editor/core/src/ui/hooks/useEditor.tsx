import { useEditor as useCustomEditor, Editor, Extension, Node, Mark } from "@tiptap/react";
import { useImperativeHandle, useRef, MutableRefObject, forwardRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { UploadImage } from '@/types/upload-image';
import { DeleteImage } from '@/types/delete-image';
import { TiptapEditorProps } from "../props";
import { TiptapExtensions } from "../extensions";
import { EditorProps } from '@tiptap/pm/view';

const DEBOUNCE_DELAY = 1500;

interface CustomEditorProps {
  editable?: boolean;
  uploadFile: UploadImage;
  setIsSubmitting?: (isSubmitting: "submitting" | "submitted" | "saved") => void;
  setShouldShowAlert?: (showAlert: boolean) => void;
  value: string;
  deleteFile: DeleteImage;
  debouncedUpdatesEnabled?: boolean;
  onChange?: (json: any, html: string) => void;
  extensions?: any;
  editorProps?: EditorProps;
  forwardedRef?: any;
}

export const useEditor = ({ uploadFile, editable, deleteFile, editorProps = {}, value, extensions = [], onChange, setIsSubmitting, debouncedUpdatesEnabled, forwardedRef, setShouldShowAlert, }: CustomEditorProps) => {
  const editor = useCustomEditor({
    editable: editable ?? true,
    editorProps: {
      ...TiptapEditorProps(uploadFile, setIsSubmitting),
      ...editorProps,
    },
    extensions: [...TiptapExtensions(deleteFile), ...extensions],
    content: (typeof value === "string" && value.trim() !== "") ? value : "<p></p>",
    onUpdate: async ({ editor }) => {
      // for instant feedback loop
      setIsSubmitting?.("submitting");
      setShouldShowAlert?.(true);
      if (debouncedUpdatesEnabled) {
        debouncedUpdates({ onChange: onChange, editor });
      } else {
        onChange?.(editor.getJSON(), editor.getHTML());
      }
    },
  });

  const editorRef: MutableRefObject<Editor | null> = useRef(null);
  editorRef.current = editor;

  useImperativeHandle(forwardedRef, () => ({
    clearEditor: () => {
      editorRef.current?.commands.clearContent();
    },
    setEditorValue: (content: string) => {
      editorRef.current?.commands.setContent(content);
    },
  }));

  const debouncedUpdates = useDebouncedCallback(async ({ onChange, editor }) => {
    if (onChange) {
      onChange(editor.getJSON(), editor.getHTML());
    }
  }, DEBOUNCE_DELAY);

  if (!editor) {
    return null;
  }

  return editor;
};