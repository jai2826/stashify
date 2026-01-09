import MediaPreview from "@/modules/files/ui/components/media-preview";
import { Doc } from "@workspace/backend/convex/_generated/dataModel";
import {
  ScrollArea,
  ScrollBar,
} from "@workspace/ui/components/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableFile = ({
  file,
  onClick,
}: {
  file: Doc<"media">;
  onClick: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.4 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="cursor-grab active:cursor-grabbing touch-none">
      <MediaPreview media={file} />
    </div>
  );
};

const SortableFileGroupView = ({
  filteredFiles,
  setFileToPreview,
  setOpenFilePreview,
  className,
  onReorder,
}: {
  filteredFiles: Doc<"media">[];
  setFileToPreview: (file: Doc<"media">) => void;
  setOpenFilePreview: (open: boolean) => void;
  className?: string;
  onReorder: (newOrder: Doc<"media">[]) => void;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredFiles.findIndex(
        (f) => f._id === active.id
      );
      const newIndex = filteredFiles.findIndex(
        (f) => f._id === over.id
      );

      const newArray = arrayMove(
        filteredFiles,
        oldIndex,
        newIndex
      );
      onReorder(newArray);
    }
  };

  if (filteredFiles.length === 0) {
    return (
      <div
        className={`p-4 italic text-sm text-center text-muted-foreground ${className}`}>
        No files in this folder.
      </div>
    );
  }

  return (
    <ScrollArea className={`${className} `}>
      <div className="p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}>
          <SortableContext
            items={filteredFiles.map((f) => f._id)}
            strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <SortableFile
                  key={file._id}
                  file={file}
                  onClick={() => {
                    setFileToPreview(file);
                    setOpenFilePreview(true);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

export default SortableFileGroupView;
