import * as React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebaseConfig'; // Ensure this import path is correct
import logo from './logo/EFlogo.jpg'; // Correct path to your logo

const CustomerNavigation = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [user, setUser] = React.useState(null); // Manage user state
  const open = Boolean(anchorEl);
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

  // Handle menu toggle
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut(auth); // Sign out the user
    navigate("/login"); // Redirect to login page after logout
  };

  if (!user || user.role !== 'customer') { // Only show if user is logged in and has role 'customer'
    return null; // Don't render anything if user is not a customer
  }

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#07080A' }}> {/* Set background color */}
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
    minWidth: '40px',  // Ensures the button doesn't grow larger than desired
    '&:hover': {
      backgroundColor: 'transparent', // Removes hover background effect if not desired
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
            onClick={handleClick}
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
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
            </Link>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Link to="/your-orders" style={{ textDecoration: 'none', color: 'white' }}>
              View Orders
            </Link>
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default CustomerNavigation;
