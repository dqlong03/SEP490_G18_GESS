import Link from 'next/link';
const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            GESS
          </Link>
          {/* Add navigation items here */}
        </div>
      </nav>
    </header>
  );
};
export default Header;