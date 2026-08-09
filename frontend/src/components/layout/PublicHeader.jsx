import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";

export default function PublicHeader({ title, subtitle }) {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <Link to="/" className="inline-flex items-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md">
          <PawPrint size={24} />
        </div>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">
          PawBack
        </span>
      </Link>
      {title && (
        <h2 className="mt-2 text-xl font-semibold text-gray-900">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-1 text-sm text-gray-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}
