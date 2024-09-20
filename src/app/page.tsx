"use client";

import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface Item {
  name: string;
  items: Item[];
}

interface Data {
  data: Item[];
}

interface DraggableItems {
  items: Item[];
  moveItem: (draggedItem: Item, targetItem?: Item) => void;
  removeItem: (item: Item) => void;
}

interface DraggableItem {
  item: Item;
  index: number;
  moveItem: (draggedItem: Item, targetItem?: Item) => void;
  removeItem: (item: Item) => void;
}

const DraggableItems: React.FC<DraggableItems> = ({
  items,
  moveItem,
  removeItem,
}) => {
  return (
    <ol className="tree">
      {items.map((item, index) => (
        <DraggableItem
          key={index}
          item={item}
          index={index}
          moveItem={moveItem}
          removeItem={removeItem}
        />
      ))}
    </ol>
  );
};

const DraggableItem: React.FC<DraggableItem> = ({
  item,
  index,
  moveItem,
  removeItem,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "item",
    item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: "item",
    drop: (draggedItem: Item) => {
      moveItem(draggedItem, item);
    },
  }));

  return (
    <li
      ref={(node) => drag(drop(node))}
      key={index}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="tree-wrapper">
        <button
          onClick={() => {
            moveItem({ name: "New Item", items: [] }, item);
          }}
        >
          +
        </button>
        <div className="tree-name">{item.name}</div>
        <div className="tree-actions">
          <button onClick={() => removeItem(item)}>Delete</button>
        </div>
      </div>
      {item.items.length > 0 && (
        <ol className="tree">
          {item.items.map((childItem, index) => (
            <DraggableItem
              key={index}
              item={childItem}
              index={index}
              moveItem={moveItem}
              removeItem={removeItem}
            />
          ))}
        </ol>
      )}
    </li>
  );
};

export default function Home() {
  const [name, setName] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [json, setJson] = useState<Data>({ data: [] });

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

  const moveItem = (draggedItem: Item, targetItem?: Item): void => {
    setItems((prevItems) => {
      if (draggedItem === targetItem) {
        return prevItems;
      }

      if (targetItem && isDescendant(draggedItem, targetItem)) {
        return prevItems;
      }

      let updatedItems = [...prevItems];

      const currentParent = findParent(updatedItems, draggedItem);

      if (currentParent) {
        currentParent.items = currentParent.items.filter(
          (item) => item !== draggedItem
        );
      } else {
        updatedItems = updatedItems.filter((item) => item !== draggedItem);
      }

      if (targetItem) {
        targetItem.items.push(draggedItem);
      } else {
        updatedItems.push(draggedItem);
      }

      return updatedItems;
    });
  };

  const createItem = (item: Item, parent?: Item): void => {
    if (!item.name) {
      return;
    }

    if (parent) {
      parent.items.push(item);
    } else {
      setItems((prevItems) => [...prevItems, item]);
    }

    setName("");
  };

  const removeItem = (item: Item): void => {
    const updatedItems = items.filter((rootItem) => {
      if (rootItem === item) {
        return false;
      }
      return !removeFromParent(rootItem, item);
    });

    setItems(updatedItems);
  };

  const saveData = (): void => {
    const data: Data = { data: items };
    setJson(data);
  };

  const removeFromParent = (parent: Item, childToRemove: Item): boolean => {
    const index = parent.items.findIndex((child) => child === childToRemove);

    if (index >= 0) {
      parent.items.splice(index, 1);
      return true;
    }

    for (const child of parent.items) {
      if (removeFromParent(child, childToRemove)) {
        return true;
      }
    }

    return false;
  };

  const findParent = (rootItems: Item[], child: Item): Item | void => {
    for (const root of rootItems) {
      if (root.items.includes(child)) {
        return root;
      }
      const found = findParent(root.items, child);
      if (found) {
        return found;
      }
    }
    return;
  };

  const assignParent = (item: Item, newParent?: Item): void => {
    const parent = findParent(items, item);

    if (parent === newParent) {
      return;
    }

    if (parent) {
      removeFromParent(parent, item);
    }

    if (newParent) {
      newParent.items.push(item);
    }

    setItems([...items]);
  };

  const orderItem = (item: Item, newIndex: number, parent?: Item): void => {
    const itemList = parent ? parent.items : items;

    if (newIndex < 0) {
      newIndex = 0;
    }

    if (newIndex >= itemList.length) {
      newIndex = itemList.length - 1;
    }

    const index = itemList.indexOf(item);
    if (index < 0) {
      return;
    }

    itemList.splice(index, 1);
    itemList.splice(newIndex, 0, item);

    setItems([...items]);
  };

  return (
    <section className="p-2">
      <div className="space-x-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          type="text"
          placeholder="Nome do item"
          className="border border-black rounded-sm p-1"
        ></input>
        <button
          className="text-white bg-black rounded-sm py-1 px-3"
          onClick={() => {
            createItem({ name, items: [] });
          }}
        >
          Criar
        </button>
      </div>
      <div className="border border-black rounded overflow-hidden mt-2 min-h-[200px] relative">
        <textarea
          className="w-full h-full absolute p-3"
          readOnly
          value={JSON.stringify(json, null, 4)}
        ></textarea>
      </div>

      <div className="mt-4">
        <DndProvider backend={HTML5Backend}>
          <DraggableItems
            items={items}
            removeItem={removeItem}
            moveItem={moveItem}
          ></DraggableItems>
        </DndProvider>
      </div>

      <div className="mt-4">
        <button
          className="text-white bg-black rounded-sm py-1 px-3"
          onClick={saveData}
        >
          salvar
        </button>
      </div>
    </section>
  );
}
