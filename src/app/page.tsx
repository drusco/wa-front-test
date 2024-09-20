"use client";

import { useState } from "react";

interface Item {
  name: string;
  items: Item[];
}

interface Data {
  data: Item[];
}

export default function Home() {
  const [name, setName] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [json, setJson] = useState<Data>({ data: [] });

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
    items.forEach((rootItem) => {
      removeFromParent(rootItem, item);
    });

    setItems((prevItems) => prevItems.filter((rootItem) => rootItem !== item));
  };

  const saveData = (): void => {
    const data: Data = { data: items };
    setJson(data);
  };

  const removeFromParent = (parent: Item, child: Item) => {
    const index = parent.items.indexOf(child);
    if (index >= 0) {
      parent.items.splice(index, 1);
      setItems([...items]);
    }
  };

  const findParent = (rootItems: Item[], child: Item): Item | undefined => {
    for (const root of rootItems) {
      if (root.items.includes(child)) {
        return root;
      }
      const found = findParent(root.items, child);
      if (found) {
        return found;
      }
    }
    return undefined;
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
    } else {
      setItems((prevItems) => [...prevItems, item]);
    }
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

  const renderItems = (items: Item[]): JSX.Element => {
    return (
      <ol className="tree">
        {items.map((item, index) => (
          <li key={index}>
            <div className="tree-wrapper">
              <div className="tree-actions">
                <button
                  onClick={() => {
                    orderItem(item, index - 1);
                  }}
                >
                  up
                </button>
                <button
                  onClick={() => {
                    orderItem(item, index + 1);
                  }}
                >
                  down
                </button>
              </div>
              <div className="tree-name">{item.name}</div>
              <div className="tree-actions">
                <button
                  onClick={() => {
                    createItem({ name, items: [] }, item);
                  }}
                >
                  + subitem
                </button>
                <button
                  onClick={() => {
                    removeItem(item);
                  }}
                >
                  delete
                </button>
              </div>
            </div>
            {item.items.length > 0 && renderItems(item.items)}
          </li>
        ))}
      </ol>
    );
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
        <button
          className="text-white bg-black rounded-sm py-1 px-3"
          onClick={saveData}
        >
          salvar
        </button>
      </div>
      <div className="border border-black rounded overflow-hidden mt-2 min-h-[200px] relative">
        <textarea
          className="w-full h-full absolute p-3"
          readOnly
          value={JSON.stringify(json, null, 4)}
        ></textarea>
      </div>

      <div className="mt-4">{renderItems(items)}</div>
    </section>
  );
}
