import { faPlus, faSitemap, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import type { rootState } from "../redux/store";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

import {
  hierarchy,
  hierarchySlice,
  removeHierarchy,
  saveHierarchy,
} from "../redux/features/hierarchySlice";

export default function ItemsSidebar({
  currentHierarchyId,
  setShowSavedItems,
  setCurrentHierarchyId,
  showSavedItems,
}: {
  currentHierarchyId: string;
  setShowSavedItems: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentHierarchyId: React.Dispatch<React.SetStateAction<string>>;
  showSavedItems: boolean;
}) {
  const hierarchyState: hierarchySlice = useSelector(
    (state: rootState) => state.hierarchies
  );

  const dispatch = useDispatch();

  return (
    <div
      className={`hierarchy-sidebar bg-slate-700 flex flex-col w-full overflow-hidden sm:w-80 shrink-0 h-full ${
        showSavedItems ? "hierarchy-sidebar-open" : "!w-px -ml-px"
      }`}
    >
      <header className="header bg-slate-700 text-white space-x-2">
        <FontAwesomeIcon icon={faSitemap} width={14} />
        <strong>Minhas Hierarquias</strong>
      </header>
      <section className="h-full m-1.5 p-1.5 overflow-auto text-white">
        {hierarchyState.hierarchies.map((hierarchy, index) => (
          <div
            key={hierarchy.id}
            className={`bg-slate-600 border border-slate-500 rounded mb-3 
              ${hierarchy.id === currentHierarchyId ? "bg-slate-800" : ""}`}
          >
            <div className="p-3 text-sm">
              <div className="mb-2">
                <span className="font-bold">Hierarquia {index + 1}</span>
              </div>
              <div>
                Criado:{" "}
                {moment(hierarchy?.createDate).format("DD/MM/YYYY HH:mm")}
              </div>
              <div>
                Atualizado:{" "}
                {moment(hierarchy?.updateDate).format("DD/MM/YYYY HH:mm")}
              </div>
            </div>
            <div
              className={`bg-slate-600 p-2 space-x-2 ${
                hierarchy.id === currentHierarchyId ? "bg-slate-700" : ""
              }`}
            >
              {hierarchy.id !== currentHierarchyId ? (
                <>
                  <button
                    className="bg-slate-700 hover:bg-slate-800 !border-slate-500 hidden sm:inline"
                    onClick={() => setCurrentHierarchyId(hierarchy.id)}
                  >
                    Abrir
                  </button>
                  <button
                    className="bg-slate-700 hover:bg-slate-800 !border-slate-500 sm:hidden"
                    onClick={() => {
                      setShowSavedItems(false);
                      setCurrentHierarchyId(hierarchy.id);
                    }}
                  >
                    Abrir
                  </button>
                </>
              ) : (
                ""
              )}
              <button
                className="bg-slate-700 hover:bg-slate-800 space-x-2  !border-slate-500"
                onClick={() => dispatch(removeHierarchy({ id: hierarchy.id }))}
              >
                <FontAwesomeIcon width={9} icon={faTrash} />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </section>
      <footer className="footer">
        <button
          onClick={() => {
            const newId = uuidv4();
            setCurrentHierarchyId(newId);
            dispatch(saveHierarchy({ id: newId, items: [] }));
          }}
          className="bg-slate-500 hover:border-slate-400 focus:border-slate-400 text-white space-x-2 px-4 p-2 w-full text-base hidden sm:inline"
        >
          <FontAwesomeIcon icon={faPlus} width={12} />
          <span>Nova Hierarquia</span>
        </button>
      </footer>
    </div>
  );
}
