import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import { defaultSystem } from "@chakra-ui/react"
import { Provider } from "react-redux";
import { store } from "./store";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import { ColorModeProvider } from "./components/ui/color-mode"

import Dashboard from "./views/dashboard/Dashboard";
import TextToImage from "./views/generation/text-to-image/TextToImage";
import ImageToImage from "./views/generation/image-to-image/ImageToImage";
import Inpainting from "./views/generation/inpainting/Inpainting";
import Prompts from "./views/prompts/Prompts";
import Gallery from "./views/gallery/Gallery";
import Privacy from "./views/privacy/Privacy";
import Terms from "./views/terms/Terms";
import Login from "./views/account/login/Login";
import Logout from "./views/account/logout/Logout";
import Profile from "./views/account/profile/Profile";
import Register from "./views/account/register/Register";

const App = () => (
  <Provider store={store}>
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider />
      <BrowserRouter>
        <Flex direction="column">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/views/dashboard" replace />} />
            <Route path="/views/account/login" element={<Login />} />
            <Route path="/views/privacy" element={<Privacy />} />
            <Route path="/views/terms" element={<Terms />} />
            <Route path="/views/account/register" element={<Register />} />
            <Route path="/views/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/views/generation/text-to-image" element={<PrivateRoute><TextToImage /></PrivateRoute>} />
            <Route path="/views/generation/image-to-image" element={<PrivateRoute><ImageToImage /></PrivateRoute>} />
            <Route path="/views/generation/inpainting" element={<PrivateRoute><Inpainting /></PrivateRoute>} />
            <Route path="/views/prompts" element={<PrivateRoute><Prompts /></PrivateRoute>} />
            <Route path="/views/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
            <Route path="/views/account/logout" element={<PrivateRoute><Logout /></PrivateRoute>} />
            <Route path="/views/account/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Routes>
          <Footer />
        </Flex>
      </BrowserRouter>
    </ChakraProvider>
  </Provider>
);

export default App;
