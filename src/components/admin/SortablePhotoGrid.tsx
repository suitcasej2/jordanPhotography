"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { ProtectedImage } from "@/components/ui/ProtectedImage";

export type ManagePhoto = {
  id: string;
  originalName: string;
  url: string;
};

function SortablePhotoTile({
  photo,
  index,
  isCoverPhoto,
  onSetCoverPhoto,
  settingCoverPhoto,
  onRemove,
  removing,
  confirmId,
  onConfirm,
  onCancel,
  isOverlay,
}: {
  photo: ManagePhoto;
  index: number;
  isCoverPhoto: boolean;
  onSetCoverPhoto: (id: string) => void;
  settingCoverPhoto: string | null;
  onRemove: (id: string) => void;
  removing: string | null;
  confirmId: string | null;
  onConfirm: (id: string) => void;
  onCancel: () => void;
  isOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled: isOverlay });

  const isConfirming = confirmId === photo.id;
  const isRemoving = removing === photo.id;
  const isSettingCover = settingCoverPhoto === photo.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      className={`group relative aspect-square overflow-hidden rounded-sm bg-surface ${
        isDragging && !isOverlay ? "z-10 opacity-40" : ""
      } ${isOverlay ? "scale-[1.03] shadow-2xl ring-1 ring-accent/40" : ""} ${
        isCoverPhoto ? "ring-2 ring-accent/70" : ""
      }`}
    >
      <ProtectedImage
        src={photo.url}
        alt={photo.originalName}
        fill
        className={`object-cover transition ${isConfirming ? "scale-105 blur-[2px]" : ""}`}
        sizes="(max-width: 768px) 50vw, 25vw"
      />

      {!isConfirming && !isOverlay ? (
        <>
          <div className="absolute top-2 left-2 flex items-center gap-1">
            {isCoverPhoto ? (
              <span className="bg-accent px-2 py-1 text-[10px] tracking-[0.1em] uppercase text-background">
                Share preview
              </span>
            ) : null}
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              className={`cursor-grab bg-black/60 px-2 py-1 text-xs tracking-[0.1em] uppercase text-white/80 active:cursor-grabbing hover:bg-black/80 hover:text-white ${
                isCoverPhoto ? "" : "opacity-0 transition group-hover:opacity-100"
              }`}
              aria-label={`Drag to reorder ${photo.originalName}`}
            >
              Drag
            </button>
          </div>
          <span className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 text-[10px] tracking-wider text-white/70 opacity-0 transition group-hover:opacity-100">
            {index + 1}
          </span>
        </>
      ) : null}

      {isConfirming ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-3"
        >
          <p className="text-center text-xs tracking-[0.15em] uppercase text-white/90">
            Remove photo?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onConfirm(photo.id)}
              disabled={isRemoving}
              className="bg-red-500/90 px-3 py-1.5 text-xs tracking-[0.1em] uppercase text-white transition hover:bg-red-500 disabled:opacity-50"
            >
              {isRemoving ? "Removing…" : "Yes"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isRemoving}
              className="border border-white/30 px-3 py-1.5 text-xs tracking-[0.1em] uppercase text-white/80 transition hover:border-white/60 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : !isOverlay ? (
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 transition group-hover:opacity-100">
          {!isCoverPhoto ? (
            <button
              type="button"
              onClick={() => onSetCoverPhoto(photo.id)}
              disabled={isSettingCover}
              className="bg-black/60 px-2.5 py-1 text-xs tracking-[0.1em] uppercase text-white/80 transition hover:bg-black/80 hover:text-white disabled:opacity-50"
            >
              {isSettingCover ? "Setting…" : "Set preview"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onRemove(photo.id)}
            className="bg-black/60 px-2.5 py-1 text-xs tracking-[0.1em] uppercase text-white/80 transition hover:bg-black/80 hover:text-white"
          >
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SortablePhotoGrid({
  catalogId,
  photos,
  coverPhotoId,
  onCoverPhotoChange,
  onPhotosChange,
  onRemove,
  removing,
  confirmId,
  onConfirm,
  onCancel,
}: {
  catalogId: string;
  photos: ManagePhoto[];
  coverPhotoId: string | null;
  onCoverPhotoChange: (coverPhotoId: string | null) => void;
  onPhotosChange: (photos: ManagePhoto[]) => void;
  onRemove: (id: string) => void;
  removing: string | null;
  confirmId: string | null;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [settingCoverPhoto, setSettingCoverPhoto] = useState<string | null>(null);

  const effectiveCoverPhotoId =
    coverPhotoId && photos.some((photo) => photo.id === coverPhotoId)
      ? coverPhotoId
      : photos[0]?.id ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activePhoto = activeId ? photos.find((photo) => photo.id === activeId) : null;
  const activeIndex = activePhoto ? photos.indexOf(activePhoto) : -1;

  async function persistCoverPhoto(photoId: string) {
    setSettingCoverPhoto(photoId);
    const previousCoverPhotoId = coverPhotoId;
    onCoverPhotoChange(photoId);

    try {
      const response = await fetch(`/api/admin/catalogs/${catalogId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhotoId: photoId }),
      });
      if (!response.ok) {
        throw new Error("Failed to set preview photo");
      }

      const data = (await response.json()) as { coverPhotoId?: string | null };
      onCoverPhotoChange(data.coverPhotoId ?? photoId);
    } catch {
      onCoverPhotoChange(previousCoverPhotoId);
    } finally {
      setSettingCoverPhoto(null);
    }
  }

  async function persistOrder(previousPhotos: ManagePhoto[], nextPhotos: ManagePhoto[]) {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/catalogs/${catalogId}/photos`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: nextPhotos.map((photo) => photo.id) }),
      });
      if (!response.ok) {
        throw new Error("Failed to save order");
      }
    } catch {
      onPhotosChange(previousPhotos);
    } finally {
      setSaving(false);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = photos.findIndex((photo) => photo.id === active.id);
    const newIndex = photos.findIndex((photo) => photo.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const nextPhotos = arrayMove(photos, oldIndex, newIndex);
    onPhotosChange(nextPhotos);
    void persistOrder(photos, nextPhotos);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-xs tracking-[0.15em] uppercase text-muted">
          Drag photos to set gallery order · Set preview for link shares
        </p>
        {saving ? (
          <p className="text-xs tracking-[0.15em] uppercase text-accent">Saving order…</p>
        ) : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={photos.map((photo) => photo.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo, index) => (
              <SortablePhotoTile
                key={photo.id}
                photo={photo}
                index={index}
                isCoverPhoto={photo.id === effectiveCoverPhotoId}
                onSetCoverPhoto={(photoId) => void persistCoverPhoto(photoId)}
                settingCoverPhoto={settingCoverPhoto}
                onRemove={onRemove}
                removing={removing}
                confirmId={confirmId}
                onConfirm={onConfirm}
                onCancel={onCancel}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay adjustScale={false}>
          {activePhoto ? (
            <SortablePhotoTile
              photo={activePhoto}
              index={activeIndex}
              isCoverPhoto={activePhoto.id === effectiveCoverPhotoId}
              onSetCoverPhoto={(photoId) => void persistCoverPhoto(photoId)}
              settingCoverPhoto={settingCoverPhoto}
              onRemove={onRemove}
              removing={removing}
              confirmId={confirmId}
              onConfirm={onConfirm}
              onCancel={onCancel}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
