import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../../service/FirebaseConfig.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { FaMoon, FaSun, FaBars, FaTimes } from "react-icons/fa";
import { useDarkMode } from "../../context/DarkModeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


export default function Header() {
  const [openDialog, setOpenDialog] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, googleLogin, googleLogout } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await googleLogout();
      setIsMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const deleteUserAccount = async () => {
    try {
      const q = query(collection(db, "AIProposal"), where("userEmail", "==", user.email));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      await handleLogout();
    } catch (error) {
      console.error("Failed to delete user account:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto sm:h-10" />
            </Link>
          </div>
          <div className="-mr-2 -my-2 md:hidden">
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" className="rounded-md p-2">
              <span className="sr-only">Open menu</span>
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </Button>
          </div>
          {user && (
            <nav className="hidden md:flex space-x-10">
              <Link to="/create-proposal" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Create Proposal</Link>
              <Link to="/my-proposal" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">My Proposal</Link>
            </nav>
          )}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            <Button onClick={toggleDarkMode} variant="ghost" className="mr-4" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </Button>
            {user ? (
              <Popover>
                <PopoverTrigger>
                  <img src={user.picture} alt={`${user.name}'s avatar`} className="h-10 w-10 rounded-full object-cover" />
                </PopoverTrigger>
                <PopoverContent>
                  <div className="py-1">
                    <p className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{user.name}</p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="block w-full rounded-xl text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">Log Out</button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone. This will log out your account.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-[#0085FF]" onClick={handleLogout}>Log Out</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="block w-full rounded-xl text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">Delete Account</button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone. This will permanently delete your account from our servers.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-[#0085FF]" onClick={deleteUserAccount}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button onClick={() => setOpenDialog(true)}>Get Started</Button>
            )}
          </div>
        </div>
      </div>
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user && (
            <>
              <Link to="/create-proposal" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">Create Proposal</Link>
              <Link to="/my-proposal" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700">My Proposal</Link>
            </>
          )}
          <Button onClick={toggleDarkMode} variant="ghost" className="w-full justify-start" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {darkMode ? <FaSun className="h-5 w-5 mr-2" /> : <FaMoon className="h-5 w-5 mr-2" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          {!user && (
            <Button className="w-full" onClick={() => { setOpenDialog(true); setIsMenuOpen(false); }}>Get Started</Button>
          )}
        </div>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome Back!</DialogTitle>
            <DialogDescription>Please log in to access your account.</DialogDescription>
          </DialogHeader>
          <div>
            <Button className="flex items-center justify-center w-full mt-4" onClick={async () => {
              await googleLogin();
              setOpenDialog(false);
            }}>
              <FcGoogle className="h-5 w-5 mr-2" />
              Sign in with Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
