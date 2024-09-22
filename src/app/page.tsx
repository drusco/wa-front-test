"use client";

import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile } from "react-device-detect";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretRight,
  faCaretDown,
  faCaretUp,
} from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";

const backend = isMobile ? TouchBackend : HTML5Backend;

interface Item {
  id?: string;
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
  findParent: (item: Item, fromArray?: Item[]) => Item | void;
  createItem: (item: Item, parent?: Item) => void;
  setItems: Dispatch<SetStateAction<Item[]>>;
}

interface DraggableItem {
  item: Item;
  moveItem: (draggedItem: Item, targetItem?: Item) => void;
  removeItem: (item: Item) => boolean;
  orderItem: (item: Item, indexOffset: number) => void;
  findParent: (item: Item, fromArray?: Item[]) => Item | void;
  createItem: (item: Item, parent?: Item) => void;
  setItems: Dispatch<SetStateAction<Item[]>>;
}

const DraggableItems: React.FC<DraggableItems> = ({
  items,
  moveItem,
  removeItem,
  orderItem,
  findParent,
  createItem,
  setItems,
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
          findParent={findParent}
          setItems={setItems}
          createItem={createItem}
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
  findParent,
  createItem,
  setItems,
}) => {
  const [showChildren, setShowChildren] = useState<boolean>(true);
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

  useEffect(() => {
    setShowChildren(!!item.items.length);
  }, [item]);

  const [, drop] = useDrop(() => ({
    accept: "item",
    drop: (draggedItem: Item, monitor) => {
      const movement = monitor.getDifferenceFromInitialOffset();
      if (!movement) {
        return;
      }
      if (draggedItem !== item) {
        console.log("**", movement);
        if (movement.x >= 20) {
          moveItem(draggedItem, item);
          setShowChildren(true);
        } else {
          let offset: number | null = null;
          setItems((items) => {
            const draggedItemParent = findParent(draggedItem);
            const dropItemParent = findParent(item);

            if (draggedItemParent === dropItemParent) {
              const parent = dropItemParent?.items ?? items;
              const indexOfDraggedItem = parent.indexOf(draggedItem);
              const indexOfDropItem = parent.indexOf(item);

              console.log({ indexOfDraggedItem, indexOfDropItem });

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
        }
      }
    },
  }));

  return (
    <Fragment>
      <div
        ref={(node) => drag(drop(node))}
        className={`tree-item 
          ${isDragging ? "tree-item-dragging" : ""} 
          ${showChildren ? "tree-item-expanded" : ""}
        `}
      >
        <div className="tree-wrapper">
          <button
            className="tree-childrenButton"
            onClick={() => {
              setShowChildren(!showChildren);
            }}
          >
            <span>
              {showChildren && item.items.length > 0 && (
                <FontAwesomeIcon icon={faCaretUp} width={7} />
              )}
              {!showChildren && item.items.length > 0 && (
                <FontAwesomeIcon icon={faCaretDown} width={7} />
              )}
              {item.items.length === 0 && (
                <FontAwesomeIcon icon={faCaretRight} width={5.5} />
              )}
            </span>
          </button>

          <div className="tree-name">
            <input
              type="text"
              value={item.name}
              onChange={(e) => {
                item.name = e.target.value;
                setItems((items) => [...items]);
              }}
            />
          </div>
          <div className="tree-actions">
            <button onClick={() => orderItem(item, -1)}>-</button>
            <button onClick={() => orderItem(item, 1)}>+</button>
            <button onClick={() => removeItem(item)}>Del</button>
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
              findParent={findParent}
              setItems={setItems}
              createItem={createItem}
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
    setItems((items) => {
      console.log("-----------------\n\r", items);

      console.log("move", draggedItem.name, "to", targetItem?.name);

      if (draggedItem === targetItem) {
        console.log("cancelled: dragged item equals target item");
        return items;
      }

      if (targetItem && isDescendant(draggedItem, targetItem)) {
        console.log("cancelled: prevent circular references");
        return items;
      }

      const updatedItems = [...items];

      const parent = findParent(draggedItem, updatedItems);

      if (!parent && !targetItem) {
        console.log("dragged item is on root already");
        return items;
      }

      if (targetItem && targetItem.items.includes(draggedItem)) {
        console.log(draggedItem.name, "is already child of", targetItem.name);
        return items;
      }

      console.log(
        "before removeItem",
        JSON.parse(JSON.stringify(updatedItems))
      );
      removeItem(draggedItem, updatedItems);

      if (targetItem) {
        targetItem.items.push(draggedItem);
        console.log("added", draggedItem.name, "to target.items");
      } else {
        console.log("added", draggedItem.name, "to root items");
        updatedItems.push(draggedItem);
      }

      console.log("final", JSON.parse(JSON.stringify(updatedItems)));

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
      items.push(item);
    }

    setName("");
    setItems([...items]);
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
    const index = itemList.findIndex((entry) => entry.id === item.id);
    let result = false;

    if (index >= 0) {
      const [removedItem] = itemList.splice(index, 1);
      console.log("removed", removedItem.name, "from", itemList === fromArray);
      result = true;
    } else {
      for (const child of itemList) {
        if (removeItem(item, child.items)) {
          console.log("removed", item.name, "from", child.name);
          result = true;
        }
      }
    }

    if (!fromArray) {
      setItems([...itemList]);
    }

    return result;
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

      console.log("new index", index, "=>", newIndex);

      fromArray.splice(index, 1);
      fromArray.splice(newIndex, 0, item);

      if (parent) {
        return [...items];
      } else {
        return fromArray;
      }
    });
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

  return (
    <div className="absolute w-full h-full overflow-hidden">
      <div className="relative flex flex-col h-full w-full">
        <header className="p-3">
          <h2 className="text-lg font-bold">
            Criador de Hierarquia de Palavras
          </h2>
          <p>...</p>
        </header>

        <section className="h-full overflow-auto p-3">
          <div className="flex bg-white mb-4 rounded p-3">
            <div className="w-full">
              <label htmlFor="item-name" className="text-sm mb-1">
                Nome do item
              </label>
              <input
                id="item-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                type="text"
                placeholder="Nome"
                className="border w-full border-gray-600 rounded p-1 placeholder:text-sm"
              ></input>
            </div>
            <button
              onClick={() => {
                createItem({ id: uuidv4(), name, items: [] });
              }}
            >
              Criar
            </button>
          </div>
          <DndProvider backend={backend}>
            <DraggableItems
              items={items}
              removeItem={removeItem}
              moveItem={moveItem}
              orderItem={orderItem}
              findParent={findParent}
              setItems={setItems}
              createItem={createItem}
            ></DraggableItems>
          </DndProvider>
        </section>

        <footer className="bg-white p-3 border-t border-gray-300">
          <div className="space-x-2">
            <button onClick={saveData}>Salvar</button>
            <button onClick={download}>Baixar Arquivo JSON</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
