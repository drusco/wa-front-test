"use client";

import React from "react";

import type { Item } from "./components/DraggableItem";
import { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { hierarchySlice, saveHierarchy } from "./redux/features/hierarchySlice";
import { faCircleDown } from "@fortawesome/free-solid-svg-icons";
import Header from "./components/Header";
import ItemsSidebar from "./components/ItemsSidebar";
import Hierarchies from "./components/Hierarchies";
import { rootState } from "./redux/store";

export interface Data {
  data: Item[];
}

export default function Home() {
  const [name, setName] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [json, setJson] = useState<Data>({ data: [] });
  const [showSavedItems, setShowSavedItems] = useState<boolean>(true);
  const [currentHierarchyId, setCurrentHierarchyId] = useState<string>(
    uuidv4()
  );
  const [hasNameError, setHasNameError] = useState<boolean>(false);

  const dispatch = useDispatch();
  const hierarchyState: hierarchySlice = useSelector(
    (state: rootState) => state.hierarchies
  );

  const saveData = (): void => {
    // save items to the redux store

    dispatch(
      saveHierarchy({
        id: currentHierarchyId,
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

  const createFirstLevelItem = (): void => {
    if (!name.length) {
      if (!hasNameError) {
        setHasNameError(true);
        setTimeout(() => {
          setHasNameError(false);
        }, 2000);
      }
      return;
    }

    setName("");
    setHasNameError(false);
    setItems((items) => [...items, { id: uuidv4(), name, items: [] }]);
  };

  useEffect(() => {
    updateData();
    saveData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    // current hierarchy id changed
    const hierarchy = hierarchyState.hierarchies.find(
      (hierarchy) => hierarchy?.id === currentHierarchyId
    );

    setItems(hierarchy ? JSON.parse(JSON.stringify(hierarchy.items)) : []);
  }, [currentHierarchyId]);

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
              currentHierarchyId={currentHierarchyId}
              setShowSavedItems={setShowSavedItems}
              setCurrentHierarchyId={setCurrentHierarchyId}
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
                      Criar nova palavra
                    </label>
                    <input
                      id="item-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      type="text"
                      placeholder="Inserir palavra..."
                      className={`border text-gray-600 outline-gray-700 border-r-0 w-full h-10 p-2 rounded-l border-gray-400 placeholder:text-sm ${
                        hasNameError
                          ? "border-red-600 placeholder:text-red-600"
                          : ""
                      }`}
                    ></input>
                  </div>
                  <button
                    className="h-10 rounded-l-none border w-32"
                    onClick={createFirstLevelItem}
                  >
                    Criar
                  </button>
                </div>
                <div className="text-xs text-gray-700 mt-2">
                  * Obrigatorio. Esta palavra sera criada no primeiro nível da
                  lista
                </div>
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
