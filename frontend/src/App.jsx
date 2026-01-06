import axios from "axios";

import { store } from "./store";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/NavBar";
import PrivateRoute from "./components/PrivateRoute";
// import { ColorModeProvider } from "./components/ui/color-mode"

import Dashboard from "./views/dashboard/Dashboard";
import Workflows from "./views/workflows/Workflows";
import TextToImage from "./views/workflows/text-to-image/TextToImage";
import ImageToImage from "./views/workflows/image-to-image/ImageToImage";
import Inpainting from "./views/workflows/inpainting/Inpainting";
import Outpainting from "./views/workflows/Outpainting/Outpainting";
import ControlNet from "./views/workflows/control-net/ControlNet";
import Canvas from "./views/workflows/canvas/Canvas";
// import BoundingBoxes from "./views/workflows/bounding-boxes/BoundingBoxes";
import Prompts from "./views/prompts/Prompts";
import Gallery from "./views/gallery/Gallery";
import Login from "./views/account/login/Login";
import Logout from "./views/account/logout/Logout";
import Profile from "./views/account/profile/Profile";
import Register from "./views/account/register/Register";
import Health from "./views/health/Health";
import AdminPanel from "./views/adminPanel/AdminPanel";
import AdminRoute from "./components/AdminRoute"; 
import UserDetails from "./views/adminPanel/UserDetails";
import Error from "./views/error/Error";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/views/account/login";
    }
    return Promise.reject(error);
  }
);

const App = () => (
  <Provider store={store}>
    {/* <ColorModeProvider /> */}
    <BrowserRouter>
      <Navbar />
      <Toaster />
      <Routes>
        <Route path="/" element={<Navigate to="/views/dashboard" replace />} />
        <Route path="/views/account/login" element={<Login />} />
        <Route path="/views/account/register" element={<Register />} />
        <Route path="/views/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/views/workflows/text-to-image" element={<PrivateRoute><TextToImage /></PrivateRoute>} />
        <Route path="/views/workflows/image-to-image" element={<PrivateRoute><ImageToImage /></PrivateRoute>} />
        <Route path="/views/workflows/inpainting" element={<PrivateRoute><Inpainting /></PrivateRoute>} />
        <Route path="/views/workflows/outpainting" element={<PrivateRoute><Outpainting /></PrivateRoute>} />
        <Route path="/views/workflows/control-net" element={<PrivateRoute><ControlNet /></PrivateRoute>} />
        <Route path="/views/workflows/canvas" element={<PrivateRoute><Canvas /></PrivateRoute>} />
        {/* <Route path="/views/workflows/bounding-boxes" element={<PrivateRoute><BoundingBoxes /></PrivateRoute>} /> */}
        <Route path="/views/prompts" element={<PrivateRoute><Prompts /></PrivateRoute>} />
        <Route path="/views/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
        <Route path="/views/account/logout" element={<PrivateRoute><Logout /></PrivateRoute>} />
        <Route path="/views/account/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/views/workflows" element={<PrivateRoute><Workflows /></PrivateRoute>} />
        <Route path="/views/health" element={<Health />} />
        <Route path="/views/adminPanel" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/views/adminPanel/user/:id" element={<AdminRoute><UserDetails /></AdminRoute>} />
        <Route path="*" element={<Error/>} />
      </Routes>
    </BrowserRouter>
  </Provider>
);

/*
  <Provider store={store}>
      <ColorModeProvider />
      <BrowserRouter>
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
            <Route path="/views/generation/bounding-boxes" element={<PrivateRoute><BoundingBoxes /></PrivateRoute>} />
            <Route path="/views/prompts" element={<PrivateRoute><Prompts /></PrivateRoute>} />
            <Route path="/views/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
            <Route path="/views/account/logout" element={<PrivateRoute><Logout /></PrivateRoute>} />
            <Route path="/views/account/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/views/workflows" element={<PrivateRoute><Workflows /></PrivateRoute>} />
            <Route path="/views/health" element={<Health />} />
          </Routes>
      </BrowserRouter>
  </Provider> */

  /*
  <Provider store={store}>
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider />
      <BrowserRouter>
        <Flex direction="column" width='100vw' height='100vh'>
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
            <Route path="/views/generation/bounding-boxes" element={<PrivateRoute><BoundingBoxes /></PrivateRoute>} />
            <Route path="/views/prompts" element={<PrivateRoute><Prompts /></PrivateRoute>} />
            <Route path="/views/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
            <Route path="/views/account/logout" element={<PrivateRoute><Logout /></PrivateRoute>} />
            <Route path="/views/account/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/views/workflows" element={<PrivateRoute><Workflows /></PrivateRoute>} />
            <Route path="/views/health" element={<Health />} />
          </Routes>
          <Footer />
        </Flex>
      </BrowserRouter>
    </ChakraProvider>
  </Provider>
  */

export default App;
