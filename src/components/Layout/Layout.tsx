import React, { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Button,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Home as HomeIcon,
    Psychology as PsychologyIcon,
    Favorite as FavoriteIcon,
    ContactMail as ContactIcon,
} from '@mui/icons-material';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // const scrollToSection = (sectionId: string) => {
    //     const element = document.getElementById(sectionId);
    //     if (element) {
    //         const yOffset = -80;
    //         const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    //         window.scrollTo({
    //             top: y,
    //             behavior: 'smooth'
    //         });
    //     }
    //     handleMenuClose();
    // };

    const smoothScrollTo = (targetY: number, duration: number = 300) => {
        const startY = window.pageYOffset;
        const distance = targetY - startY;
        let startTime: number;

        const animateScroll = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const ease = progress * (2 - progress);
            
            window.scrollTo(0, startY + distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const yOffset = -80;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            smoothScrollTo(y);
        }
        handleMenuClose();
    };

    const menuItems = [
        { text: 'Início', icon: <HomeIcon />, sectionId: 'home' },
        { text: 'Tratamento', icon: <PsychologyIcon />, sectionId: 'treatment' },
        { text: 'Saúde Mental', icon: <FavoriteIcon />, sectionId: 'mental-health' },
        { text: 'Contato', icon: <ContactIcon />, sectionId: 'contact' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Clínica Plenamente
                    </Typography>

                    {isMobile ? (
                        <>
                            <IconButton
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMenuOpen}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                {menuItems.map((item) => (
                                    <MenuItem
                                        key={item.text}
                                        onClick={() => scrollToSection(item.sectionId)}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {item.icon}
                                            {item.text}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.text}
                                    color="inherit"
                                    startIcon={item.icon}
                                    onClick={() => scrollToSection(item.sectionId)}
                                >
                                    {item.text}
                                </Button>
                            ))}
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;