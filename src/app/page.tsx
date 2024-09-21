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
  removeItem: (item: Item) => boolean;
  orderItem: (item: Item, indexOffset: number) => void;
}

interface DraggableItem {
  item: Item;
  moveItem: (draggedItem: Item, targetItem?: Item) => void;
  removeItem: (item: Item) => boolean;
  orderItem: (item: Item, indexOffset: number) => void;
}

const DraggableItems: React.FC<DraggableItems> = ({
  items,
  moveItem,
  removeItem,
  orderItem,
}) => {
  return (
    <div className="tree">
      {items.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          moveItem={moveItem}
          removeItem={removeItem}
          orderItem={orderItem}
        />
      ))}
    </div>
  );
};

const DraggableItem: React.FC<DraggableItem> = ({
  item,
  moveItem,
  removeItem,
  orderItem,
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
            <button onClick={() => orderItem(item, -1)}>up</button>
            <button onClick={() => orderItem(item, 1)}>down</button>
            <button onClick={() => removeItem(item)}>Delete</button>
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
              orderItem={orderItem}
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

    const parent = findParent(draggedItem, updatedItems);

    if (!parent && !targetItem) {
      return;
    }

    if (targetItem && targetItem.items.includes(draggedItem)) {
      return;
    }

    removeItem(draggedItem, updatedItems);

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
    console.log("save to store");
  };

  const updateData = (): void => {
    const data: Data = { data: items };
    setJson(data);
  };

  const removeItem = (item: Item, fromArray?: Item[]): boolean => {
    const itemList = fromArray ?? items;

    const index = itemList.findIndex((entry) => entry === item);

    if (index >= 0) {
      const [removedItem] = itemList.splice(index, 1);
      console.log("removed", removedItem.name, "from root");
      if (!fromArray) {
        setItems([...itemList]);
      }
      return true;
    }

    for (const child of itemList) {
      if (removeItem(item, child.items)) {
        console.log("removed", item.name, "from", child.name);
        if (!fromArray) {
          setItems([...itemList]);
        }
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

  const orderItem = (item: Item, indexOffset: number): void => {
    const parent = findParent(item);
    const fromArray = parent ? [...parent.items] : [...items];
    const index = fromArray.indexOf(item);

    if (index < 0) {
      return;
    }

    let newIndex = index + indexOffset;

    if (newIndex < 0) {
      newIndex = 0;
    }

    if (newIndex >= fromArray.length) {
      newIndex = fromArray.length - 1;
    }

    fromArray.splice(index, 1);
    fromArray.splice(newIndex, 0, item);

    if (parent) {
      parent.items = fromArray;
    } else {
      setItems(fromArray);
    }
  };

  const download = (): void => {
    updateData();

    const blob = new Blob([JSON.stringify(json, null, 4)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    updateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            orderItem={orderItem}
          ></DraggableItems>
        </DndProvider>
      </div>

      <div className="mt-4 space-x-2">
        <button onClick={saveData}>Salvar</button>
        <button onClick={download}>Baixar Arquivo JSON</button>
      </div>
    </section>
  );
}
