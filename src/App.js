import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Home from './pages/Home/Home';
import Neuroanatomy from './pages/Neuroanatomy/Neuroanatomy';
import Login from './pages/Admin/Login';
import ProtectedRoute from './components/Routing/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import AdminHome from './pages/Admin/AdminHome';
import BlogDashboard from './pages/Admin/BlogDashboard';
import FeedDashboard from './pages/Admin/FeedDashboard';
import BlogEditor from './pages/Admin/BlogEditor';
import BlogList from './pages/Blog/BlogList';
import BlogView from './pages/Blog/BlogView';
import Feed from './pages/Feed';
import FeedEditor from './pages/Admin/FeedEditor';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="neuroanatomia" element={<Neuroanatomy />} />
              <Route path="blogs" element={<BlogList />} />
              <Route path="blogs/:id" element={<BlogView />} />
              <Route path="feed" element={<Feed />} />

              <Route path="/admin/login" element={<Login />} />

              <Route path="admin">
                <Route
                  index
                  element={
                    <ProtectedRoute>
                      <AdminHome />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="blogs"
                  element={
                    <ProtectedRoute>
                      <BlogDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="blogs/new"
                  element={
                    <ProtectedRoute>
                      <BlogEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="blogs/:id/edit"
                  element={
                    <ProtectedRoute>
                      <BlogEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="feed/new"
                  element={
                    <ProtectedRoute>
                      <FeedEditor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="feed"
                  element={
                    <ProtectedRoute>
                      <FeedDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="feed/:id/edit"
                  element={
                    <ProtectedRoute>
                      <FeedEditor />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
