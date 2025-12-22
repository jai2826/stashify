// packages/ui/src/lib/atoms.ts
import { atom } from "jotai";

// Standard state for the dialog visibility
export const uploadDialogOpenAtom = atom(false);
export const createFolderDialogOpenAtom = atom(false);

// Optional: Store metadata if you want to pre-select a folder 
// when opening the dialog from a specific folder view
export const uploadFolderIdAtom = atom<string | null>(null);