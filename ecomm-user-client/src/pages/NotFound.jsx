import { Link } from "react-router-dom";
import errorImg from "../assets/404error.svg";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <img
        src={errorImg}
        alt="404 Error"
        className="w-full max-w-md mb-8"
      />

      <h1 className="text-3xl font-bold mb-3">Oops! Page not found</h1>

      <Link
        to="/"
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
