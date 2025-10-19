import { FaUser } from "react-icons/fa";
import { FiGrid } from "react-icons/fi";
import { LuHouse } from "react-icons/lu";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { MdOutlineTextSnippet, MdOutlineLan } from "react-icons/md";
import { MdAdminPanelSettings } from "react-icons/md";

import Logo from "../assets/logo.png";

const baseLinks = [
  { href: "/views/dashboard", label: "Dashboard", icon: LuHouse },
  { href: "/views/workflows", label: "Workflows", icon: MdOutlineLan },
  { href: "/views/prompts", label: "Prompts", icon: MdOutlineTextSnippet },
  { href: "/views/gallery", label: "Gallery", icon: FiGrid },
];

export default function Navbar() {
  const [hasMounted, setHasMounted] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const navLinks = [...baseLinks];
  if (user?.role === "admin") {
    navLinks.push({
      href: "/views/adminPanel",
      label: "Admin Panel",
      icon: MdAdminPanelSettings,
    });
  }

  return (
    <nav className="bg-black text-white shadow-lg p-5">
      <div className="flex flex-row justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0 cursor-pointer">
          <RouterLink to="/views/dashboard">
            <img
              src={Logo}
              alt="AInterior Logo"
              className="h-10 w-auto object-contain block"
            />
          </RouterLink>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-5">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <RouterLink key={href} to={href} className="text-white hover:text-gray-300 no-underline p-3">
              <div className="flex items-center gap-2">
                <Icon className="w-7 h-7" />
                {label}
              </div>
            </RouterLink>
          ))}
        </div>

        {/* Auth Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* {isAuthenticated && (
            <RouterLink to="/views/account/profile">
              <div className="text-white hover:text-gray-300 cursor-pointer">
                <FaUser className="w-7 h-7" />
              </div>
            </RouterLink>
          )} */}

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