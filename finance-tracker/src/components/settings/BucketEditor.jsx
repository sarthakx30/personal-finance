import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import { GripVertical } from 'lucide-react';

// --- Sortable Item Component ---
function SortableItem({ id, category }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        "flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-700 transition-colors group",
        isDragging && "opacity-50"
      )}
    >
      <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-400" />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize truncate">
        {category}
      </span>
    </div>
  );
}

// --- Bucket Container Component ---
function BucketContainer({ id, title, categories, color }) {
  const { setNodeRef } = useSortable({
    id,
    data: {
      type: 'container',
    },
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div 
        className="p-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm flex items-center justify-between"
        style={{ borderTop: `4px solid ${color}` }}
      >
        <span className="text-slate-900 dark:text-white">{title}</span>
        <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
          {categories.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto space-y-2 min-h-[200px]">
        <SortableContext items={categories} strategy={verticalListSortingStrategy}>
          {categories.map((cat) => (
            <SortableItem key={cat} id={cat} category={cat} />
          ))}
        </SortableContext>
        {categories.length === 0 && (
           <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              Drop items here
           </div>
        )}
      </div>
    </div>
  );
}

// --- Main Editor Component ---
export default function BucketEditor({ onClose }) {
  const { config, updateBucketConfig } = useConfig();
  const [buckets, setBuckets] = useState(config.buckets);
  const [activeId, setActiveId] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  // Helper to find which bucket a category is in
  const findContainer = (id) => {
    if (id in buckets) return id;
    
    return Object.keys(buckets).find((key) =>
      buckets[key].categories.includes(id) // id is category name here
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5,
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id) || over.id; // over.id might be container id itself

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Move item to new container in state (during drag)
    setBuckets((prev) => {
      const activeItems = prev[activeContainer].categories;
      const overItems = prev[overContainer].categories;
      const activeIndex = activeItems.indexOf(active.id);
      
      // If dropping over a container, add to end. If over an item, insert at that index.
      const overIndex = overItems.indexOf(over.id);
      
      let newIndex;
      if (overIndex === -1) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
            over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: {
          ...prev[activeContainer],
          categories: [
            ...prev[activeContainer].categories.filter((item) => item !== active.id),
          ],
        },
        [overContainer]: {
          ...prev[overContainer],
          categories: [
            ...prev[overContainer].categories.slice(0, newIndex),
            active.id,
            ...prev[overContainer].categories.slice(newIndex, overItems.length),
          ],
        },
      };
    });
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    // State is already updated by DragOver for cross-container, 
    // but we need to handle sorting within the same container if we want to support reordering (optional but nice)
    
    const { active, over } = event;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over ? over.id : null) || (over ? over.id : null);

    if (
      activeContainer &&
      overContainer &&
      activeContainer === overContainer
    ) {
      const activeIndex = buckets[activeContainer].categories.indexOf(active.id);
      const overIndex = buckets[overContainer].categories.indexOf(over.id);

      if (activeIndex !== overIndex) {
        setBuckets((prev) => ({
          ...prev,
          [activeContainer]: {
            ...prev[activeContainer],
            categories: arrayMove(prev[activeContainer].categories, activeIndex, overIndex),
          },
        }));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBucketConfig(buckets);
      toast.success('Budget buckets updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to save buckets:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const moveCategory = (category, targetBucket) => {
    const sourceBucket = findContainer(category);
    if (!sourceBucket || sourceBucket === targetBucket) return;

    setBuckets((prev) => ({
      ...prev,
      [sourceBucket]: {
        ...prev[sourceBucket],
        categories: prev[sourceBucket].categories.filter((c) => c !== category),
      },
      [targetBucket]: {
        ...prev[targetBucket],
        categories: [...prev[targetBucket].categories, category],
      },
    }));
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  // Prepare flat list for mobile view
  const allCategories = Object.entries(buckets).flatMap(([bucketName, bucket]) => 
    bucket.categories.map(cat => ({ name: cat, bucket: bucketName }))
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="mb-4">
         <p className="text-slate-600 dark:text-slate-400 text-sm hidden md:block">
            Drag and drop categories between buckets to reorganize your budget. Changes will apply to all months.
         </p>
         <p className="text-slate-600 dark:text-slate-400 text-sm md:hidden">
            Select the appropriate bucket for each category.
         </p>
      </div>

      {/* Desktop View: Drag and Drop */}
      <div className="hidden md:block flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {Object.entries(buckets).map(([key, bucket]) => (
              <BucketContainer
                key={key}
                id={key}
                title={key}
                categories={bucket.categories}
                color={bucket.color}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeId ? (
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl cursor-grabbing">
                <GripVertical className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize">
                  {activeId}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Mobile View: List with Selectors */}
      <div className="md:hidden flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
        {allCategories.map(({ name, bucket }) => (
          <div key={name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize truncate max-w-[50%]">
              {name}
            </span>
            <select
              value={bucket}
              onChange={(e) => moveCategory(name, e.target.value)}
              className="text-xs font-medium py-1.5 pl-2 pr-6 rounded-md border-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 focus:ring-2 focus:ring-inset focus:ring-blue-600 capitalize"
            >
              {Object.keys(buckets).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
