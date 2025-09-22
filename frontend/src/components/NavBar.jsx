import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import Logo from "../assets/logo.png";

import { FaUser } from "react-icons/fa";
import { FiGrid } from "react-icons/fi";
import { LuHouse } from "react-icons/lu";
import { MdOutlineTextSnippet, MdOutlineLan } from "react-icons/md";

const navLinks = [
  { href: "/views/dashboard", label: "Dashboard", icon: LuHouse },
  { href: "/views/workflows", label: "Workflows", icon: MdOutlineLan },
  { href: "/views/prompts", label: "Prompts", icon: MdOutlineTextSnippet },
  { href: "/views/gallery", label: "Gallery", icon: FiGrid },
];

export default function Navbar() {
  const [hasMounted, setHasMounted] = useState(false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <nav className="bg-black text-white sticky top-0 z-10 w-screen shadow-md px-4 md:px-8 py-3 md:py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between flex-wrap gap-4">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 cursor-pointer max-h-[50px]">
          <RouterLink to="/views/dashboard">
            <img
              src={Logo}
              alt="AInterior Logo"
              className="h-10 w-auto object-contain block"
            />
          </RouterLink>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center md:justify-center gap-4 flex-grow">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <div key={href} className="flex items-center gap-2">
              <Icon size={20} />
              <RouterLink
                to={href}
                className="px-3 py-2 text-white hover:text-gray-300 no-underline"
              >
                {label}
              </RouterLink>
            </div>
          ))}
        </div>

        {/* Auth Controls */}
        <div className="flex items-center gap-4 justify-center md:justify-end flex-shrink-0">
          {isAuthenticated && (
            <RouterLink to="/views/account/profile">
              <div className="cursor-pointer">
                <FaUser color="white" size={27} />
              </div>
            </RouterLink>
          )}

          <RouterLink
            to={isAuthenticated ? "/views/account/logout" : "/views/account/login"}
          >
            <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg">
              {isAuthenticated ? "Logout" : "Login"}
            </button>
          </RouterLink>
        </div>
      </div>
    </nav>
  );
}
