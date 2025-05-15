import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Flex } from '@chakra-ui/react';
import Navbar from "./components/NavBar";
import Footer from "./components/Footer"
import Dashboard from './views/dashboard/Dashboard';
import TextToImage from './views/generation/text-to-image/TextToImage';
import ImageToImage from './views/generation/image-to-image/ImageToImage';
import Inpainting from './views/generation/inpainting/Inpainting';
import Prompts from "./views/prompts/Prompts";
import Gallery from "./views/gallery/Gallery";
import Privacy from "./views/privacy/Privacy";
import Terms from "./views/terms/Terms";
import Logout from "./views/account/logout/Logout"
import Profile from "./views/account/profile/Profile"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <Flex direction="column">
          <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/views/dashboard" replace />} />
              <Route path="/views/dashboard" element={<Dashboard />} />
              <Route path="/views/generation/text-to-image" element={<TextToImage />} />
              <Route path="/views/generation/image-to-image" element={<ImageToImage />} />
              <Route path="/views/generation/inpainting" element={<Inpainting />} />
              <Route path="/views/prompts" element={<Prompts />} />
              <Route path="/views/gallery" element={<Gallery />} />
              <Route path="/views/privacy" element={<Privacy />} />
              <Route path="/views/terms" element={<Terms />} />
              <Route path="/views/account/logout" element={<Logout />} />
              <Route path="/views/account/profile" element={<Profile />} />
            </Routes>
          <Footer />
        </Flex>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);