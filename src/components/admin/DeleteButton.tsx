'use client';

import { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DeleteButtonProps {
  onDelete: () => void;
  itemName?: string;
}

export function DeleteButton({ onDelete, itemName = 'this item' }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
    setShowConfirm(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div
        className="absolute inset-0 bg-zinc-900/95 rounded-xl flex flex-col items-center justify-center p-4 z-10"
        onClick={(e) => e.preventDefault()}
      >
        <p className="text-white text-center mb-4 text-sm">
          Delete {itemName}?
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCancel}
          >
            <X size={14} className="mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800/80 hover:bg-red-600 text-zinc-400 hover:text-white transition-colors z-10"
      title="Delete submission"
    >
      <Trash2 size={14} />
    </button>
  );
}
