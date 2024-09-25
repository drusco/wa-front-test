"use client";

import React from "react";

import type { Item } from "./components/DraggableItem";
import type { hierarchy } from "./redux/features/hierarchySlice";
import { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { v4 as uuidv4 } from "uuid";
import { useDispatch } from "react-redux";
import { saveHierarchy } from "./redux/features/hierarchySlice";
import { faCircleDown } from "@fortawesome/free-solid-svg-icons";
import Header from "./components/Header";
import ItemsSidebar from "./components/ItemsSidebar";
import Hierarchies from "./components/Hierarchies";

export interface Data {
  data: Item[];
}

export default function Home() {
  const [name, setName] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [json, setJson] = useState<Data>({ data: [] });
  const [showSavedItems, setShowSavedItems] = useState<boolean>(true);

  const [currentHierarchy, setCurrentHierarchy] = useState<hierarchy>();

  const dispatch = useDispatch();

  const saveData = (): void => {
    console.log("save to store", items);

    dispatch(
      saveHierarchy({
        id: currentHierarchy?.id || uuidv4(),
        items,
      })
    );
  };

  const updateData = (): void => {
    const data: Data = { data: items };
    setJson(data);
  };

  const formatData = (items: Item[]): Item[] => {
    for (const item of items) {
      delete item.id;
      formatData(item.items);
    }
    return items;
  };

  const download = (): void => {
    updateData();

    const formattedData: Data = {
      data: formatData(JSON.parse(JSON.stringify(json.data))),
    };

    const blob = new Blob([JSON.stringify(formattedData, null, 4)], {
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

  useEffect(() => {
    if (!currentHierarchy) {
      return;
    }
    console.log(555, "items updated from hierarchy");
    setItems(JSON.parse(JSON.stringify(currentHierarchy.items)));
  }, [currentHierarchy]);

  return (
    <div className="absolute w-full h-full overflow-hidden">
      <div className="relative flex flex-col h-full w-full">
        <Header
          setShowSavedItems={setShowSavedItems}
          showSavedItems={showSavedItems}
        />

        <section className="h-full relative">
          <div className="absolute w-full h-full flex">
            <ItemsSidebar
              currentHierarchy={currentHierarchy}
              setCurrentHierarchy={setCurrentHierarchy}
              setShowSavedItems={setShowSavedItems}
              showSavedItems={showSavedItems}
            />

            <div className="flex flex-col grow h-full overflow-auto">
              <div className="p-3 bg-gray-300 text-gray-700">
                <div className="flex items-end">
                  <div className="w-full">
                    <label
                      htmlFor="item-name"
                      className="text-sm font-semibold mb-2 block"
                    >
                      Nova palavra
                    </label>
                    <input
                      id="item-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      type="text"
                      placeholder="Palavra"
                      className="border text-gray-600 outline-gray-700 border-r-0 w-full h-10 p-2 rounded-l border-gray-400 placeholder:text-sm"
                    ></input>
                  </div>
                  <button
                    className="h-10 rounded-l-none border w-28"
                    onClick={() => {
                      setName("");
                      setItems((items) => [
                        ...items,
                        { id: uuidv4(), name, items: [] },
                      ]);
                    }}
                  >
                    Criar
                  </button>
                </div>
                <small className="text-xs text-gray-700">
                  * Esta palavra sera criada no primeiro nível da lista
                </small>
              </div>

              <section className="flex h-full m-3 p-3 pt-0 pl-0 overflow-auto">
                <Hierarchies items={items} setItems={setItems} />
              </section>

              <footer className="items-center bg-white footer border-t border-gray-300">
                <div className="space-x-2">
                  <button onClick={saveData} className="primary">
                    Salvar
                  </button>
                  <button onClick={download} className="space-x-2">
                    <FontAwesomeIcon icon={faCircleDown} width={14} />
                    <span>Baixar Arquivo JSON</span>
                  </button>
                </div>
              </footer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
