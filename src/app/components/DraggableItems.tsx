import { Dispatch, SetStateAction, useState } from "react";
import { Item, treeView } from "./DraggableItem";
import { XYCoord } from "react-dnd";
import DraggableItem from "./DraggableItem";

export interface DraggableItems {
  items: Item[];
  moveItem: (draggedItem: Item, targetItem?: Item) => void;
  removeItem: (item: Item) => boolean;
  orderItem: (item: Item, indexOffset: number) => void;
  findParent: (item: Item, fromArray?: Item[]) => Item | void;
  createItem: (item: Item, parent?: Item) => void;
  setItems: Dispatch<SetStateAction<Item[]>>;
  switchItem: (movement: XYCoord, draggedItem: Item, item: Item) => void;
}

const DraggableItems: React.FC<DraggableItems> = ({
  items,
  moveItem,
  removeItem,
  orderItem,
  findParent,
  createItem,
  setItems,
  switchItem,
}) => {
  const [movingItem, setMovingItem] = useState<Item | null>(null);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [currentView, setCurrentView] = useState<treeView>("expanded");

  const getTargetClientPosition = <T extends HTMLElement>(
    ref: React.MutableRefObject<T | null>
  ): XYCoord | null => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return { x: rect.left, y: rect.top };
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="mb-6 px-4">
        <div>
          {items.length > 0 && (
            <select
              value={currentView}
              onChange={(e) => {
                setCurrentView(e.target.value as treeView);
              }}
            >
              <option value="expanded">Mostrar tudo</option>
              <option value="root">Mostrar primeiro nível</option>
              <option value="custom">Personalizado</option>
            </select>
          )}
        </div>
      </div>
      <div className={`tree ${movingItem && "tree-item-selection"}`}>
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            moveItem={moveItem}
            removeItem={removeItem}
            orderItem={orderItem}
            findParent={findParent}
            setItems={setItems}
            createItem={createItem}
            switchItem={switchItem}
            setMovingItem={setMovingItem}
            setCurrentItem={setCurrentItem}
            currentItem={currentItem}
            setCurrentView={setCurrentView}
            currentView={currentView}
            getTargetClientPosition={getTargetClientPosition}
          />
        ))}
      </div>
    </div>
  );
};

export default DraggableItems;
