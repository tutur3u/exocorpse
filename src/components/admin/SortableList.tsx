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

export function canReorderItems(itemCount: number) {
  return itemCount > 1;
}

function SortableItem<T>({
  children,
  handleClassName,
  id,
  item,
}: {
  children: (item: T) => ReactNode;
  handleClassName?: string;
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
      className={`group/sortable relative h-full min-w-0 ${isDragging ? "z-40 opacity-70" : ""}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <Button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className={`absolute top-3 right-3 z-30 cursor-grab border-zinc-300 bg-white/90 text-zinc-600 opacity-0 shadow-md backdrop-blur transition-[opacity,background-color,border-color,color,box-shadow] group-hover/sortable:opacity-100 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 focus-visible:opacity-100 active:cursor-grabbing dark:border-slate-600 dark:bg-slate-950/90 dark:text-slate-300 dark:hover:border-cyan-300/60 dark:hover:bg-cyan-300/10 dark:hover:text-cyan-100 [@media(hover:none)]:opacity-100 ${isDragging ? "opacity-100" : ""} ${handleClassName ?? ""}`}
        size="icon"
        title="Drag to reorder"
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
  handleClassName,
  items,
  layout = "vertical",
  onReorder,
}: {
  children: (item: T) => ReactNode;
  className?: string;
  getId: (item: T) => string;
  handleClassName?: string;
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

  // A drag affordance is only useful when there is somewhere to move an item.
  // Rendering a plain list for empty/singleton collections also avoids making
  // one-image fields look like reorderable galleries.
  if (!canReorderItems(orderedItems.length)) {
    return (
      <div className={className}>
        {orderedItems.map((item) => (
          <div className="relative h-full min-w-0" key={getId(item)}>
            {children(item)}
          </div>
        ))}
      </div>
    );
  }

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
            <SortableItem
              handleClassName={handleClassName}
              id={getId(item)}
              item={item}
              key={getId(item)}
            >
              {children}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
