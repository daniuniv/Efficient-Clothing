import * as React from 'react';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebaseConfig'; // Ensure this import path is correct
import logo from './logo/EFlogo.jpg'; // Correct path to your logo

const CustomerNavigation = () => {
  const [anchorEl, setAnchorEl] = React.useState(null); // Menu state (null = closed)
  const [user, setUser] = React.useState(null); // Manage user state
  const open = Boolean(anchorEl); // Menu open state (true if anchorEl is not null)
  const navigate = useNavigate();
  const auth = getAuth();

  // Check for user authentication and role
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Fetch the user's role from Firebase
        const userDocRef = doc(db, "users", authUser.uid); // Get the document reference
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ ...authUser, role: userData.role }); // Store user role along with auth data
        } else {
          setUser(null); // If no user data found, set user as null
        }
      } else {
        setUser(null); // If no user is logged in
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [auth]);

  // Handle menu toggle (only open on burger icon click)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget); // Open the menu when the burger icon is clicked
  };

  const handleClose = () => {
    setAnchorEl(null); // Close the menu when clicking outside or on a menu item
  };

  const handleLogout = async () => {
    await signOut(auth); // Sign out the user
    navigate("/login"); // Redirect to login page after logout
  };

  // If user is not logged in or role is not 'customer', don't render anything
  if (!user || user.role !== 'customer') {
    return null; // Don't render anything if user is not a customer
  }

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#07080A' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo as a clickable button that redirects to the catalog page */}
        <Button 
          onClick={() => navigate('/catalog')} 
          sx={{
            padding: 0, 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minWidth: '40px', 
            '&:hover': {
              backgroundColor: 'transparent',
            }
          }}
        >
          <img 
            src={logo} 
            alt="Efficient Clothing" 
            style={{ width: '40px', height: '40px', objectFit: 'contain' }} 
          />
        </Button>

        {/* Burger Icon on the right */}
        <Box sx={{ position: 'relative', ml: 'auto' }}>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClick} // Trigger menu on click
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Menu - only renders if anchorEl is set (menu is open) */}
        <Menu
          anchorEl={anchorEl}
          open={open} // Open the menu only when anchorEl is not null
          onClose={handleClose} // Only close the menu when user clicks outside or on a menu item
          PaperProps={{
            sx: {
              backgroundColor: '#07080A', // Matching the AppBar background color
              color: 'white',
              borderRadius: 2,
            },
          }}
        >
          <MenuItem onClick={handleClose}>
            <Link to="/catalog" style={{ textDecoration: 'none', color: 'white' }}>
              Browse Catalog
            </Link>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Link to="/cart" style={{ textDecoration: 'none', color: 'white' }}>
              View Cart 
              <span style={{ color: '#121212' }}>----------</span>
            </Link>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Link to="/your-orders" style={{ textDecoration: 'none', color: 'white' }}>
              View Orders
              <span style={{ color: '#121212' }}>------</span>
            </Link>
          </MenuItem>
          <MenuItem onClick={handleLogout} style={{ color: 'white' }}>
            Logout
            <span style={{ color: '#121212' }}>------</span>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default CustomerNavigation;
