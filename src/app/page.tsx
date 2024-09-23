"use client";

import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop, XYCoord } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faCircleDown,
  faBars,
  faXmark,
  faChevronDown,
  faChevronUp,
  faSitemap,
  faShare,
  faPlus,
  faArrowDownShortWide,
  faCaretDown,
  faCaretUp,
} from "@fortawesome/free-solid-svg-icons";
import { v4 as uuidv4 } from "uuid";
import React from "react";

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
  switchItem: (movement: XYCoord, draggedItem: Item, item: Item) => void;
}

interface DraggableItem {
  item: Item;
  moveItem: (draggedItem: Item, targetItem?: Item) => void;
  removeItem: (item: Item) => boolean;
  orderItem: (item: Item, indexOffset: number) => void;
  findParent: (item: Item, fromArray?: Item[]) => Item | void;
  createItem: (item: Item, parent?: Item) => void;
  setItems: Dispatch<SetStateAction<Item[]>>;
  switchItem: (movement: XYCoord, draggedItem: Item, item: Item) => void;
  setMovingItem: Dispatch<SetStateAction<Item | null>>;
  setCurrentItem: Dispatch<SetStateAction<Item | null>>;
  currentItem: Item | null;
}

const DraggableItems: React.FC<DraggableItems> = ({
  items,
  moveItem,
  removeItem,
  orderItem,
  findParent,
  createItem,
  setItems,
  switchItem,
}) => {
  const [movingItem, setMovingItem] = useState<Item | null>(null);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  return (
    <div className={`tree ${movingItem && "tree-item-selection"}`}>
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
          switchItem={switchItem}
          setMovingItem={setMovingItem}
          setCurrentItem={setCurrentItem}
          currentItem={currentItem}
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
  switchItem,
  setMovingItem,
  setCurrentItem,
  currentItem,
}) => {
  const [showChildren, setShowChildren] = useState<boolean>(true);
  const [openItem, setOpenItem] = useState<boolean>(false);
  const [subitemName, setSubitemName] = useState<string>("");
  const [showSubitemForm, setShowSubitemForm] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);
  const [isMovingItem, setIsMovingItem] = useState<boolean>(false);

  useEffect(() => {
    if (clicked) {
      setMovingItem((movingItem) => {
        if (movingItem) {
          setTimeout(() => {
            moveItem(movingItem, item);
            setShowChildren(true);
          });
        }

        return null;
      });
      setClicked(false);
    }
  }, [clicked, item, moveItem, setMovingItem]);

  useEffect(() => {
    if (openItem) {
      setCurrentItem(item);
    }
  }, [openItem, setCurrentItem, item]);

  useEffect(() => {
    if (currentItem !== item) {
      setOpenItem(false);
    }
  }, [currentItem, item]);

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
      if (draggedItem === item) {
        return;
      }

      const movement = monitor.getDifferenceFromInitialOffset();
      const draggedPosition = monitor.getClientOffset();
      const targetPosition = getTargetClientPosition();

      if (!movement || !draggedPosition || !targetPosition) {
        return;
      }

      const movementX = draggedPosition.x - targetPosition.x;

      console.log("**", movementX);

      if (movementX >= 50) {
        moveItem(draggedItem, item);
        setShowChildren(true);
      } else {
        switchItem(movement, draggedItem, item);
      }
    },
  }));

  const getTargetClientPosition = () => {
    if (dropTargetRef.current) {
      const rect = dropTargetRef.current.getBoundingClientRect();
      return { x: rect.left, y: rect.top };
    }
    return null;
  };

  const dropTargetRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <Fragment>
      <div
        className={`tree-item 
          ${isDragging ? "tree-item-dragging" : ""} 
          ${showChildren && item.items.length ? "tree-item-expanded" : ""}
          ${item.items.length && "tree-item-expandable"} 
          ${isMovingItem && "tree-item-moving"}
        `}
      >
        <button
          className="tree-childrenButton"
          onClick={() => {
            setShowChildren(!showChildren);
          }}
        >
          <span>
            {showChildren && item.items.length > 0 && (
              <FontAwesomeIcon icon={faCircle} width={6} />
            )}
            {!showChildren && item.items.length > 0 && (
              <FontAwesomeIcon icon={faCircle} width={6} />
            )}
            {item.items.length === 0 && (
              <FontAwesomeIcon icon={faCircle} width={3} />
            )}
          </span>
        </button>
        <div className="tree-wrapper-outer">
          <div
            className="tree-wrapper"
            ref={(node) => {
              drag(drop(node));
              dropTargetRef.current = node;
            }}
            onClick={() => {
              setClicked(true);
            }}
          >
            <div className="tree-item-name">
              <input
                type="text"
                value={item.name}
                placeholder="Palavra"
                onChange={(e) => {
                  item.name = e.target.value;
                  setItems((items) => [...items]);
                }}
              />
              <span className="tree-item-draggable"></span>
            </div>
            <div className="tree-actions">
              <button onClick={() => setOpenItem(!openItem)}>
                {openItem && <FontAwesomeIcon icon={faChevronUp} width={14} />}
                {!openItem && (
                  <FontAwesomeIcon icon={faChevronDown} width={14} />
                )}
              </button>
            </div>
          </div>
          {openItem && (
            <div>
              <section className="tree-item-options">
                <button
                  className="mr-3"
                  onClick={() => {
                    setShowSubitemForm(!showSubitemForm);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} width={12} />
                </button>

                <button
                  onClick={() => {
                    orderItem(item, -1);
                  }}
                >
                  <FontAwesomeIcon icon={faCaretUp} width={12} />
                </button>
                <button
                  onClick={() => {
                    orderItem(item, 1);
                  }}
                >
                  <FontAwesomeIcon icon={faCaretDown} width={12} />
                </button>

                <button
                  onClick={() => {
                    setMovingItem(item);
                    setIsMovingItem(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setMovingItem(null);
                      setIsMovingItem(false);
                    }, 100);
                  }}
                >
                  <FontAwesomeIcon icon={faShare} width={12} /> Mover
                </button>

                {findParent(item) ? (
                  <button
                    onClick={() => {
                      moveItem(item);
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowDownShortWide} width={12} />{" "}
                    Desvincular
                  </button>
                ) : (
                  ""
                )}

                <button onClick={() => removeItem(item)}>
                  <FontAwesomeIcon icon={faXmark} width={12} /> Eliminar
                </button>
              </section>
              {showSubitemForm && (
                <section className="">
                  <div className="flex items-end">
                    <div className="w-1/2 text-gray-700">
                      <label
                        htmlFor={`${item.id}-subitem-name`}
                        className="text-sm font-semibold mb-2 block"
                      >
                        Subitem para: <u className="font-normal">{item.name}</u>
                      </label>
                      <input
                        id={`${item.id}-subitem-name`}
                        value={subitemName}
                        onChange={(event) => setSubitemName(event.target.value)}
                        type="text"
                        placeholder="Palavra"
                        className="border text-gray-600 outline-gray-700 border-r-0 w-full h-10 p-2 rounded-l border-gray-400 placeholder:text-sm"
                      ></input>
                    </div>
                    <button
                      className="h-10 rounded-l-none border w-28"
                      disabled={!subitemName.length}
                      onClick={() => {
                        createItem(
                          { id: uuidv4(), name: subitemName, items: [] },
                          item
                        );
                        setSubitemName("");
                        setShowChildren(true);
                      }}
                    >
                      Criar
                    </button>
                  </div>
                  <small className="text-xs text-gray-700">
                    * Precisa ser preenchido para criar sub-item
                  </small>
                </section>
              )}
            </div>
          )}
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
              switchItem={switchItem}
              setMovingItem={setMovingItem}
              setCurrentItem={setCurrentItem}
              currentItem={currentItem}
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
  const [showSavedItems, setShowSavedItems] = useState<boolean>(true);

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

  const switchItem = (
    movement: XYCoord,
    draggedItem: Item,
    item: Item
  ): void => {
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
        <header className="header bg-slate-600 text-white">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setShowSavedItems(!showSavedItems);
              }}
              className="bg-transparent !text-inherit border hover:bg-slate-500 focus:bg-slate-500 !border-white"
            >
              <FontAwesomeIcon icon={faBars} width={12} />
            </button>
            <h2 className="text-lg font-bold">
              Criador de Hierarquia de Palavras
            </h2>
          </div>
        </header>

        <section className="h-full relative">
          <div className="absolute w-full h-full flex">
            <div
              className={`hierarchy-sidebar flex flex-col w-full overflow-hidden sm:w-80 shrink-0 h-full ${
                showSavedItems ? "hierarchy-sidebar-open" : "!w-px -ml-px"
              }`}
            >
              <header className="header bg-sky-600 text-white space-x-2">
                <FontAwesomeIcon icon={faSitemap} width={14} />
                <strong>Minhas Hierarquias</strong>
              </header>
              <section className="h-full overflow-auto bg-slate-700 text-white"></section>
              {items.length === 0 && (
                <footer className="footer bg-slate-600 sm:hidden">
                  <button
                    onClick={() => {
                      setShowSavedItems(false);
                    }}
                    className="primary space-x-2 p-3 px-4 w-full text-base"
                  >
                    <FontAwesomeIcon icon={faPlus} width={12} />
                    <span>Nova Hierarquia</span>
                  </button>
                </footer>
              )}
            </div>

            <div className="flex flex-col grow h-full overflow-auto">
              <header className="p-3 bg-gray-300 text-gray-700">
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
                      createItem({ id: uuidv4(), name, items: [] });
                    }}
                  >
                    Criar
                  </button>
                </div>
                <small className="text-xs text-gray-700">
                  * Esta palavra sera criada no primeiro nível da lista
                </small>
              </header>

              <section className="flex h-full m-3 p-3 pl-0 overflow-auto">
                <DndProvider backend={HTML5Backend}>
                  <DraggableItems
                    items={items}
                    removeItem={removeItem}
                    moveItem={moveItem}
                    orderItem={orderItem}
                    findParent={findParent}
                    setItems={setItems}
                    createItem={createItem}
                    switchItem={switchItem}
                  ></DraggableItems>
                </DndProvider>
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
