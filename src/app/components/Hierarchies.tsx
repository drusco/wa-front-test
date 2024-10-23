import type { Item } from "./DraggableItem";
import DraggableItems from "./DraggableItems";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider, XYCoord } from "react-dnd";

export default function Hierarchies({
  items,
  setItems,
}: {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}) {
  const isDescendant = (parent: Item, child: Item): boolean => {
    if (parent.items.includes(child)) {
      return true;
    }

    for (const subItem of parent.items) {
      if (isDescendant(subItem, child)) {
        return true;
      }
    }

    return false;
  };

  const findParent = (item: Item, fromArray?: Item[]): Item | void => {
    const itemList = fromArray ?? items;

    for (const root of itemList) {
      if (root.items.includes(item)) {
        return root;
      }
      const found = findParent(item, root.items);
      if (found) {
        return found;
      }
    }
  };

  const moveItem = (draggedItem: Item, targetItem?: Item): void => {
    setItems((items) => {
      if (draggedItem === targetItem) {
        // cancelled: dragged item equals target item
        return items;
      }

      if (targetItem && isDescendant(draggedItem, targetItem)) {
        // cancelled: prevent circular references
        return items;
      }

      const updatedItems = [...items];

      const parent = findParent(draggedItem, updatedItems);

      if (!parent && !targetItem) {
        // dragged item is on root already
        return items;
      }

      if (targetItem && targetItem.items.includes(draggedItem)) {
        // dragged item is already child of targetItem
        return items;
      }

      removeItem(draggedItem, updatedItems);

      if (targetItem) {
        // add dragged item to target items
        targetItem.items.push(draggedItem);
      } else {
        // add dragged item to root items
        updatedItems.push(draggedItem);
      }

      return updatedItems;
    });
  };

  const removeItem = (item: Item, fromArray?: Item[]): boolean => {
    const itemList = fromArray ?? items;
    const index = itemList.findIndex((entry) => entry.id === item.id);
    let result = false;

    if (index >= 0) {
      const [removedItem] = itemList.splice(index, 1);
      // removed removedItem from item list
      result = true;
    } else {
      for (const child of itemList) {
        if (removeItem(item, child.items)) {
          // removed item from parent
          result = true;
        }
      }
    }

    if (!fromArray) {
      setItems([...itemList]);
    }

    return result;
  };

  const orderItem = (item: Item, indexOffset: number): void => {
    setItems((items) => {
      const parent = findParent(item);
      const fromArray = parent ? parent.items : [...items];
      const index = fromArray.indexOf(item);

      if (index < 0) {
        return items;
      }

      let newIndex = index + indexOffset;

      if (newIndex < 0) {
        newIndex = 0;
      }

      if (newIndex >= fromArray.length) {
        newIndex = fromArray.length - 1;
      }

      if (newIndex !== index) {
        // updates item index

        fromArray.splice(index, 1);
        fromArray.splice(newIndex, 0, item);
      }

      if (parent) {
        return [...items];
      } else {
        return fromArray;
      }
    });
  };

  const switchItem = (
    movement: XYCoord,
    draggedItem: Item,
    item: Item
  ): void => {
    let offset: number | null = null;
    setItems((items) => {
      const draggedItemParent = findParent(draggedItem);
      const dropItemParent = findParent(item);

      if (draggedItemParent === dropItemParent) {
        const parent = dropItemParent?.items ?? items;
        const indexOfDraggedItem = parent.indexOf(draggedItem);
        const indexOfDropItem = parent.indexOf(item);

        if (movement.y < 0) {
          offset = indexOfDropItem - indexOfDraggedItem;
        } else {
          offset = indexOfDraggedItem + indexOfDropItem;
        }
      }

      return items;
    });

    if (offset !== null) {
      orderItem(draggedItem, offset);
    }
  };

  const createItem = (item: Item, parent?: Item): void => {
    if (parent) {
      parent.items.push(item);
    } else {
      items.push(item);
    }

    setItems([...items]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DraggableItems
        items={items}
        removeItem={removeItem}
        moveItem={moveItem}
        orderItem={orderItem}
        findParent={findParent}
        setItems={setItems}
        createItem={createItem}
        switchItem={switchItem}
      ></DraggableItems>
    </DndProvider>
  );
}
