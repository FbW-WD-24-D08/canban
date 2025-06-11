import { Link } from "react-router";

export function Hero() {
  return (
    <section className="bg-gradient-to-r from-teal-500 to-teal-600 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Canban</h1>
        <p className="text-lg mb-8">
          Your personal kanban board for managing tasks efficiently.
        </p>
        <Link
          to="/signup"
          className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
