'use client';

import React, { useState, useEffect, useRef } from 'react';
import { shoppingListService } from '@/services/shoppingListService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityEditorProps {
  itemId: string;
  listId: string;
  currentQuantity: string;
  currentUnit: string;
  onUpdate: (newQuantity: string) => void;
}

export const QuantityEditor: React.FC<QuantityEditorProps> = ({
  itemId,
  listId,
  currentQuantity,
  currentUnit,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(currentQuantity);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const validateQuantity = (qty: string): string | null => {
    if (!qty || qty.trim().length === 0) {
      return 'Quantity is required';
    }
    if (qty.length > 50) {
      return 'Quantity too long (max 50 characters)';
    }
    // Allow numbers, spaces, dots, commas, and fractions
    if (!/^[\d\s\/.,]+$/.test(qty)) {
      return 'Invalid quantity format (numbers/fractions only)';
    }
    return null;
  };

  const handleSave = async () => {
    const trimmedQty = quantity.trim();
    if (trimmedQty === currentQuantity) {
      setIsEditing(false);
      return;
    }

    const error = validateQuantity(trimmedQty);
    if (error) {
      toast.error(error);
      setQuantity(currentQuantity);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await shoppingListService.updateShoppingItem(listId, itemId, trimmedQty);
      onUpdate(trimmedQty);
      toast.success('Quantity updated');
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update quantity');
      setQuantity(currentQuantity);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setQuantity(currentQuantity);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="w-20 px-2 py-1 text-sm font-bold border-2 border-emerald-500 rounded-lg outline-none bg-white text-emerald-900 shadow-sm"
        />
        <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
          {currentUnit}
        </span>
        {isSaving && <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />}
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={cn(
        "flex items-center gap-2 text-sm font-medium cursor-pointer px-2 py-1 -ml-2 rounded-lg transition-colors hover:bg-zinc-100",
        isSaving ? "text-zinc-400" : "text-zinc-500"
      )}
    >
      <span className="font-bold text-emerald-900">{currentQuantity}</span>
      <span className="text-zinc-400">{currentUnit}</span>
    </div>
  );
};
