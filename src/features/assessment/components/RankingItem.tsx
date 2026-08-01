import { useId } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PublicAssessmentItem } from "@/data/assessment.items.v0.2";

interface RankingItemProps {
  item: PublicAssessmentItem;
  presentedOrder: string[];
  rankedOptionIds: string[];
  explicitNoMatch: boolean;
  onChange: (next: { rankedOptionIds: string[]; explicitNoMatch: boolean }) => void;
}

/**
 * Le glisser-deposer (souris/tactile/clavier via @dnd-kit) ne sert qu'a REORDONNER la liste deja
 * classee -- un usage simple et bien supporte par dnd-kit. Le passage d'une proposition entre
 * "Non classees" et "Mon classement" se fait par bouton, garanti accessible au clavier et au
 * lecteur d'ecran sans logique de glisser-deposer inter-conteneurs a risque. Voir
 * docs/ARCHITECTURE.md §3.
 */
export function RankingItem({
  item,
  presentedOrder,
  rankedOptionIds,
  explicitNoMatch,
  onChange
}: RankingItemProps) {
  const headingId = useId();
  const optionsById = new Map(item.options.map((option) => [option.id, option]));
  const unrankedIds = presentedOrder.filter((id) => !rankedOptionIds.includes(id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function addOption(optionId: string) {
    if (rankedOptionIds.length >= 6 || rankedOptionIds.includes(optionId)) return;
    onChange({ rankedOptionIds: [...rankedOptionIds, optionId], explicitNoMatch: false });
  }

  function removeOption(optionId: string) {
    onChange({
      rankedOptionIds: rankedOptionIds.filter((id) => id !== optionId),
      explicitNoMatch
    });
  }

  function moveOption(optionId: string, direction: -1 | 1) {
    const index = rankedOptionIds.indexOf(optionId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= rankedOptionIds.length) return;
    onChange({ rankedOptionIds: arrayMove(rankedOptionIds, index, nextIndex), explicitNoMatch });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rankedOptionIds.indexOf(String(active.id));
    const newIndex = rankedOptionIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onChange({ rankedOptionIds: arrayMove(rankedOptionIds, oldIndex, newIndex), explicitNoMatch });
  }

  function toggleNoMatch() {
    if (explicitNoMatch) {
      onChange({ rankedOptionIds, explicitNoMatch: false });
    } else {
      onChange({ rankedOptionIds: [], explicitNoMatch: true });
    }
  }

  return (
    <article className="ranking-item" aria-labelledby={headingId}>
      <h3 id={headingId} className="ranking-item__title">
        {item.prompt}
      </h3>

      <div className="ranking-item__zones">
        <section aria-label="Mon classement, du plus vrai au moins vrai">
          <h4>Mon classement</h4>
          {rankedOptionIds.length === 0 ? (
            <p className="ranking-item__empty">
              Ajoute ici les propositions qui te ressemblent, de la plus vraie à la moins vraie.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={rankedOptionIds} strategy={verticalListSortingStrategy}>
                <ol className="ranking-item__ranked-list">
                  {rankedOptionIds.map((optionId, index) => {
                    const option = optionsById.get(optionId);
                    if (!option) return null;
                    return (
                      <RankedOption
                        key={optionId}
                        id={optionId}
                        rank={index + 1}
                        text={option.text}
                        isFirst={index === 0}
                        isLast={index === rankedOptionIds.length - 1}
                        onMoveUp={() => moveOption(optionId, -1)}
                        onMoveDown={() => moveOption(optionId, 1)}
                        onRemove={() => removeOption(optionId)}
                      />
                    );
                  })}
                </ol>
              </SortableContext>
            </DndContext>
          )}
        </section>

        <section aria-label="Propositions non classées">
          <h4>Non classées</h4>
          <ul className="ranking-item__pool-list">
            {unrankedIds.map((optionId) => {
              const option = optionsById.get(optionId);
              if (!option) return null;
              return (
                <li key={optionId} className="ranking-item__pool-option">
                  <span>{option.text}</span>
                  <button
                    type="button"
                    onClick={() => addOption(optionId)}
                    disabled={explicitNoMatch}
                  >
                    Ajouter
                  </button>
                </li>
              );
            })}
            {unrankedIds.length === 0 && !explicitNoMatch && (
              <li className="ranking-item__empty">Toutes les propositions sont classées.</li>
            )}
          </ul>
        </section>
      </div>

      <label className="ranking-item__no-match">
        <input type="checkbox" checked={explicitNoMatch} onChange={toggleNoMatch} />
        Aucune proposition ne me correspond suffisamment pour cette situation.
      </label>
    </article>
  );
}

interface RankedOptionProps {
  id: string;
  rank: number;
  text: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

function RankedOption({
  id,
  rank,
  text,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove
}: RankedOptionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`ranking-item__ranked-option${isDragging ? " is-dragging" : ""}`}
    >
      <span className="ranking-item__rank-badge">{rank}</span>
      <span
        className="ranking-item__drag-handle"
        {...attributes}
        {...listeners}
        aria-label={`Réordonner : ${text}`}
      >
        ⠿
      </span>
      <span className="ranking-item__option-text">{text}</span>
      <span className="ranking-item__option-actions">
        <button type="button" onClick={onMoveUp} disabled={isFirst} aria-label="Monter">
          ↑
        </button>
        <button type="button" onClick={onMoveDown} disabled={isLast} aria-label="Descendre">
          ↓
        </button>
        <button type="button" onClick={onRemove} aria-label="Retirer du classement">
          Retirer
        </button>
      </span>
    </li>
  );
}
