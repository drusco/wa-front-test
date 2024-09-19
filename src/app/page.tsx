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

  const createItem = (item: Item, parent?: Item): void => {
    if (items.has(item)) {
      return;
    }

    if (!item.name) {
      return;
    }

    if (parent) {
      parent.items.push(item);
    }

    items.set(item, parent);
  };

  const removeItem = (item: Item): void => {
    const parent = items.get(item);
    items.delete(item);

    if (!parent) {
      return;
    }

    const index = parent.items.indexOf(item);

    if (index < 0) {
      return;
    }

    parent.items.splice(index, 1);
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

  const assignParent = (item: Item, newParent?: Item): void => {
    const parent = items.get(item);

    items.set(item, newParent);

    if (!parent) {
      return;
    }

    if (parent === newParent) {
      return;
    }

    const index = parent.items.indexOf(item);

    if (index >= 0) {
      parent.items.splice(index, 1);
    }

    if (newParent) {
      newParent.items.push(item);
    }
  };

  const orderMapItem = (
    map: Map<Item, Item | void>,
    item: Item,
    newIndex: number
  ): void => {
    if (!map.has(item)) {
      return;
    }

    if (newIndex < 0) {
      newIndex = 0;
    }

    if (newIndex >= map.size) {
      newIndex = map.size - 1;
    }

    const mapAsArray = Array.from(map);
    const index = mapAsArray.findIndex(([key]) => key === item);
    const value = mapAsArray.splice(index, 1)[0];

    mapAsArray.splice(newIndex, 0, value);

    setItems(new Map(mapAsArray));
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
      <div className="border border-black rounded overflow-hidden mt-2 min-h-[300px] relative">
        <textarea
          className="w-full h-full absolute p-3"
          readOnly
          value={JSON.stringify(json, null, 4)}
        ></textarea>
      </div>
    </section>
  );
}
