import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { phoneNumber } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const Nav = ({ to, text }: { to: string; text: string }) => {
    return (
      <Link
        to={to}
        className={
          isActive(to)
            ? "font-bold border-b-2 pb-2"
            : "pb-2 border-b-2 border-transparent"
        }
      >
        {text}
      </Link>
    );
  };

  return (
    <nav className="flex gap-4 justify-center items-center py-4 mb-4">
      <Nav to="/" text="🏠 Home" />
      {phoneNumber ? (
        <>
          <Nav to="/roster" text="📆 更表" />
          <Nav to="/availability" text="🙋‍♂️ 舉手" />
          <Nav to="/profile" text="👤 Profile" />
        </>
      ) : (
        <Nav to="/auth" text="🔑 登入" />
      )}
      {/* Add more links as needed */}
    </nav>
  );
};

export default Navbar;
