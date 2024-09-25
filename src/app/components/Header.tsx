import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Header({
  setShowSavedItems,
  showSavedItems,
}: {
  setShowSavedItems: React.Dispatch<React.SetStateAction<boolean>>;
  showSavedItems: boolean;
}) {
  return (
    <header className="header bg-slate-600 text-white">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowSavedItems(!showSavedItems)}
          className="bg-transparent !text-inherit border hover:bg-slate-500 focus:bg-slate-500 !border-white"
        >
          <FontAwesomeIcon icon={faBars} width={12} />
        </button>
        <h2 className="text-lg font-bold">Criador de Hierarquia de Palavras</h2>
      </div>
    </header>
  );
}
