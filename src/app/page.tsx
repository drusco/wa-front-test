"use client";

import { Fragment, useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface Item {
  id: string;
  name: string;
  items: Item[];
}

interface Data {
  data: Item[];
}

interface DraggableItems {
  items: Item[];
  moveItem: (draggedItem: Item, targetItem?: Item) => void;
  removeItem: (id: string) => boolean;
}

interface DraggableItem {
  item: Item;
  moveItem: (draggedItem: Item, targetItem?: Item) => void;
  removeItem: (id: string) => boolean;
}

const DraggableItems: React.FC<DraggableItems> = ({
  items,
  moveItem,
  removeItem,
}) => {
  return (
    <div className="tree">
      {items.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          moveItem={moveItem}
          removeItem={removeItem}
        />
      ))}
    </div>
  );
};

const DraggableItem: React.FC<DraggableItem> = ({
  item,
  moveItem,
  removeItem,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "item",
    item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (draggedItem: Item, monitor) => {
      const dropResult = !!monitor.getDropResult();
      if (!dropResult) {
        moveItem(draggedItem);
      }
    },
  }));

  const [, drop] = useDrop(() => ({
    accept: "item",
    drop: (draggedItem: Item) => {
      if (draggedItem !== item) {
        console.log("drop");
        moveItem(draggedItem, item);
      }
    },
  }));

  return (
    <Fragment>
      <div
        ref={(node) => drag(drop(node))}
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <div className="tree-wrapper">
          <button
            onClick={() => {
              moveItem(
                { id: self.crypto.randomUUID(), name: "New Item", items: [] },
                item
              );
            }}
          >
            +
          </button>
          <div className="tree-name">{item.name}</div>
          <div className="tree-actions">
            <button onClick={() => removeItem(item.id)}>Delete</button>
          </div>
        </div>
      </div>
      {item.items.length > 0 && (
        <div className="tree">
          {item.items.map((subitem) => (
            <DraggableItem
              key={subitem.id}
              item={subitem}
              moveItem={moveItem}
              removeItem={removeItem}
            />
          ))}
        </div>
      )}
    </Fragment>
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
    console.log("-----------------\n\r", items);

    console.log("move", draggedItem.name, "to", targetItem?.name);

    if (draggedItem === targetItem) {
      console.log("cancelled: dragged item equals target item");
      return;
    }

    if (targetItem && isDescendant(draggedItem, targetItem)) {
      console.log("cancelled: prevent circular references");
      return;
    }

    const updatedItems = [...items];

    const parent = findParent(updatedItems, draggedItem);

    if (!parent && !targetItem) {
      return;
    }

    if (targetItem && targetItem.items.includes(draggedItem)) {
      return;
    }

    removeItem(draggedItem.id, updatedItems);

    if (targetItem) {
      targetItem.items = [...targetItem.items, draggedItem];
      console.log("added", draggedItem.name, "to target.items");
    } else {
      console.log("added", draggedItem.name, "to root items");
      updatedItems.push(draggedItem);
    }

    console.log("final", JSON.parse(JSON.stringify(updatedItems)));

    setItems(updatedItems);
  };

  const createItem = (item: Item, parent?: Item): void => {
    if (!item.name) {
      return;
    }

    if (parent) {
      parent.items.push(item);
    } else {
      items.push(item);
    }

    setName("");
    setItems(items);
  };

  const saveData = (): void => {
    const data: Data = { data: items };
    setJson(data);
  };

  const removeItem = (id: string, fromArray?: Item[]): boolean => {
    const itemList = fromArray ?? items;

    const index = itemList.findIndex((item) => item.id === id);

    if (index >= 0) {
      const [removedItem] = itemList.splice(index, 1);
      console.log("removed", removedItem.name, "from root");
      if (!fromArray) {
        setItems([...itemList]);
      }
      return true;
    }

    for (const child of itemList) {
      if (removeItem(id, child.items)) {
        console.log("removed", id, "from", child.name);
        if (!fromArray) {
          setItems([...itemList]);
        }
        return true;
      }
    }

    return false;
  };

  const findParent = (fromArray: Item[], item: Item): Item | void => {
    for (const root of fromArray) {
      if (root.items.includes(item)) {
        return root;
      }
      const found = findParent(root.items, item);
      if (found) {
        return found;
      }
    }
    return;
  };

  const orderItem = (fromArray: Item[], item: Item, newIndex: number): void => {
    if (newIndex < 0) {
      newIndex = 0;
    }

    if (newIndex >= fromArray.length) {
      newIndex = fromArray.length - 1;
    }

    const index = fromArray.indexOf(item);

    if (index < 0) {
      return;
    }

    fromArray.splice(index, 1);
    fromArray.splice(newIndex, 0, item);

    setItems((items) => [...items]);
  };

  useEffect(() => {
    saveData();
  }, [items]);

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
            createItem({ id: self.crypto.randomUUID(), name, items: [] });
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
