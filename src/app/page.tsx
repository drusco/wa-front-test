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
    <section className="text-black">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        type="text"
        placeholder="Nome do item"
        className="block"
      ></input>
      <select>
        <option>-- selecionar --</option>
      </select>
      <button
        className="block bg-white rounded-sm py-1 px-3"
        onClick={() => {
          createItem({ name, items: [] });
        }}
      >
        Criar
      </button>
      <button
        className="block bg-white rounded-sm py-1 px-3"
        onClick={saveData}
      >
        salvar
      </button>
      <div>
        <textarea readOnly value={JSON.stringify(json, null, 4)}></textarea>
      </div>
    </section>
  );
}
