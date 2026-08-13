"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@tuturuuu/ui/button";
import { GripVertical } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export function mergeVisibleOrder<T>(
  allItems: T[],
  visibleItems: T[],
  getId: (item: T) => string,
) {
  const visibleIds = new Set(visibleItems.map(getId));
  const queue = [...visibleItems];
  return allItems.map((item) =>
    visibleIds.has(getId(item)) ? (queue.shift() ?? item) : item,
  );
}

function SortableItem<T>({
  children,
  id,
  item,
}: {
  children: (item: T) => ReactNode;
  id: string;
  item: T;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  return (
    <div
      className={`relative min-w-0 ${isDragging ? "z-40 opacity-70" : ""}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <Button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="absolute top-3 left-3 z-30 cursor-grab border-zinc-600 bg-zinc-950/85 text-white shadow-lg backdrop-blur active:cursor-grabbing"
        size="icon"
        type="button"
        variant="outline"
      >
        <GripVertical className="h-4 w-4" />
      </Button>
      {children(item)}
    </div>
  );
}

export default function SortableList<T>({
  children,
  className,
  getId,
  items,
  layout = "vertical",
  onReorder,
}: {
  children: (item: T) => ReactNode;
  className?: string;
  getId: (item: T) => string;
  items: T[];
  layout?: "grid" | "vertical";
  onReorder: (items: T[]) => void | Promise<void>;
}) {
  const [orderedItems, setOrderedItems] = useState(items);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => setOrderedItems(items), [items]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over || event.active.id === event.over.id) return;
    const previousIndex = orderedItems.findIndex(
      (item) => getId(item) === event.active.id,
    );
    const nextIndex = orderedItems.findIndex(
      (item) => getId(item) === event.over?.id,
    );
    if (previousIndex < 0 || nextIndex < 0) return;
    const nextItems = arrayMove(orderedItems, previousIndex, nextIndex);
    setOrderedItems(nextItems);
    void onReorder(nextItems);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={orderedItems.map(getId)}
        strategy={
          layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy
        }
      >
        <div className={className}>
          {orderedItems.map((item) => (
            <SortableItem id={getId(item)} item={item} key={getId(item)}>
              {children}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
