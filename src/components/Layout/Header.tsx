import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuthStore } from '../../store/authStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthStore();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navigationItems = [
    { label: 'Блюда', path: '/meals' },
    { label: 'Сегодня', path: '/today' },
    { label: 'Добавить', path: '/add-meal' },
    { label: 'Статистика', path: '/statistics' },
    { label: 'Пользователи', path: '/users' },
    { label: 'Профиль', path: '/profile' }
  ];

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setMobileMenuAnchor(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/meals')}
        >
          Счетчик Калорий
        </Typography>

        {user && (
          <>
            {isMobile ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={mobileMenuAnchor}
                  open={Boolean(mobileMenuAnchor)}
                  onClose={() => setMobileMenuAnchor(null)}
                >
                  {navigationItems.map((item) => (
                    <MenuItem 
                      key={item.path}
                      onClick={() => handleMenuItemClick(item.path)}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleLogout}>Выйти</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </Button>
                ))}
                <IconButton
                  color="inherit"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                    Профиль
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Выйти</MenuItem>
                </Menu>
              </Box>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;