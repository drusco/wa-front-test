"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useEffect, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import { v4 as uuidv4 } from "uuid";

import {
  faCaretDown,
  faCaretUp,
  faChevronDown,
  faChevronUp,
  faCircle,
  faLinkSlash,
  faPlus,
  faShare,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export interface Item {
  id?: string;
  name: string;
  items: Item[];
}

export type treeView = "custom" | "expanded" | "root";

export interface DraggableItem {
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
  setCurrentView: Dispatch<SetStateAction<treeView>>;
  currentView: treeView;
  getTargetClientPosition: <T extends HTMLElement>(
    ref: React.MutableRefObject<T | null>
  ) => XYCoord | null;
}

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
  setCurrentView,
  currentView,
  getTargetClientPosition,
}) => {
  const [showChildren, setShowChildren] = useState<boolean>(true);
  const [openItem, setOpenItem] = useState<boolean>(false);
  const [subitemName, setSubitemName] = useState<string>("");
  const [showSubitemForm, setShowSubitemForm] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);
  const [isMovingItem, setIsMovingItem] = useState<boolean>(false);
  const dropTargetRef = React.useRef<HTMLDivElement | null>(null);

  const itemParent = findParent(item);

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
    setOpenItem(false);
    switch (currentView) {
      case "root":
        if (!findParent(item)) {
          setShowChildren(false);
        }
        break;
      case "expanded":
        setShowChildren(true);
        break;
      default:
        if (!findParent(item)) {
          setShowChildren(true);
        }
        break;
    }
  }, [currentView, item, findParent]);

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
      const targetPosition = getTargetClientPosition(dropTargetRef);

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
            setCurrentView("custom");
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
              <button
                onClick={() => {
                  setOpenItem(!openItem);
                  setShowSubitemForm(false);
                }}
              >
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
                {itemParent && itemParent.items.length > 1 ? (
                  <Fragment>
                    <button
                      className="disabled:opacity-30"
                      disabled={itemParent.items[0].id === item.id}
                      onClick={() => {
                        orderItem(item, -1);
                      }}
                    >
                      <FontAwesomeIcon icon={faCaretUp} width={12} />
                    </button>
                    <button
                      className="disabled:opacity-30"
                      disabled={
                        itemParent.items[itemParent.items.length - 1].id ===
                        item.id
                      }
                      onClick={() => {
                        orderItem(item, 1);
                      }}
                    >
                      <FontAwesomeIcon icon={faCaretDown} width={12} />
                    </button>
                  </Fragment>
                ) : (
                  ""
                )}

                <button
                  onClick={() => {
                    setShowSubitemForm(!showSubitemForm);
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} width={12} />
                  <span>Subitem</span>
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
                  <FontAwesomeIcon icon={faShare} width={12} />{" "}
                  <span>Mover</span>
                </button>

                {itemParent ? (
                  <button
                    onClick={() => {
                      moveItem(item);
                    }}
                  >
                    <FontAwesomeIcon icon={faLinkSlash} width={12} />{" "}
                    <span>Desvincular</span>
                  </button>
                ) : (
                  ""
                )}

                <button onClick={() => removeItem(item)}>
                  <FontAwesomeIcon icon={faXmark} width={12} />
                  <span>Excluir</span>
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
                        Subitem para:{" "}
                        <span className="font-normal">{item.name}</span>
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
                        setCurrentView("expanded");
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
              currentView={currentView}
              setCurrentView={setCurrentView}
              getTargetClientPosition={getTargetClientPosition}
            />
          ))}
        </div>
      )}
    </Fragment>
  );
};

export default DraggableItem;
