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
  const [items, setItems] = useState<Map<Item, Item | void>>(new Map());
  const [json, setJson] = useState<Data>({ data: [] });

  const createItem = (item: Item): void => {
    if (!item.name) {
      return;
    }
    items.set(item);
  };

  const removeItem = (item: Item): void => {
    const parent = items.get(item);

    if (!parent) {
      items.delete(item);
      return;
    }

    const index = parent.items.indexOf(item);

    if (index < 0) {
      return;
    }

    parent.items.splice(index, 1);
    items.delete(item);
  };

  const saveData = (): void => {
    const tree = buildTree();
    const data: Data = { data: tree };

    setJson(data);
  };

  const buildTree = (): Item[] => {
    const tree: Item[] = [...items.keys()].filter((item) => !items.get(item));
    return tree;
  };

  const assignItem = (item: Item, newParent?: Item): void => {
    const parent = items.get(item);

    if (!parent) {
      return;
    }

    if (parent == newParent) {
      return;
    }

    const index = parent.items.indexOf(item);

    if (index >= 0) {
      parent.items.splice(index, 1);
    }

    if (newParent) {
      newParent.items.push(item);
    }

    items.set(item, newParent);
  };

  const orderItem = (item: Item, newIndex: number): void => {
    const parent = items.get(item);

    if (!parent) {
      return;
    }

    if (newIndex < 0) {
      newIndex = 0;
    }

    if (newIndex >= parent.items.length) {
      newIndex = parent.items.length - 1;
    }

    const index = parent.items.indexOf(item);

    if (index < 0) {
      return;
    }

    parent.items.splice(index, 1);
    parent.items.splice(newIndex, 0, item);
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
        <select className="p-1 border-black border rounded-sm">
          <option>-- selecionar --</option>
        </select>
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
      <div className="border border-black mt-2">
        <textarea
          className="w-full h-full"
          readOnly
          value={JSON.stringify(json, null, 4)}
        ></textarea>
      </div>
    </section>
  );
}
