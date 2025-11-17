import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event'
import { render, screen, cleanup } from '@testing-library/react';
import { it, expect, describe, vi, afterEach } from 'vitest';

import axios from 'axios'
import React from 'react';
import { store } from '../src/store';
import { Provider } from "react-redux";
import { MemoryRouter } from 'react-router-dom';
import { toaster } from '../src/components/ui/toaster';
import ImageToImage from '../src/views/workflows/image-to-image/ImageToImage';

vi.spyOn(toaster, 'create');
vi.mock('axios');

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

const renderAll = (element) =>
    render(
        <Provider store={store}><MemoryRouter>{element}</MemoryRouter></Provider>
    );

describe('ImageToImage', () => {
    it('should render workflow correctly', () => {
        renderAll(<ImageToImage />);

        const header = screen.getByText('Image to image');
        const dragDropText = screen.getByText('Drag and drop files here');
        const imagePlaceholder = screen.getByText('Generated image will appear here');
        const advancedParamsButton = screen.getByText('Show advanced parameters ▼');

        expect(header).toBeInTheDocument();
        expect(dragDropText).toBeInTheDocument();
        expect(imagePlaceholder).toBeInTheDocument();
        expect(advancedParamsButton).toBeInTheDocument();
    });

    it('should show advanced parameters', async () => {
        renderAll(<ImageToImage />);

        const toggleButton = screen.getByText('Show advanced parameters ▼');
        await userEvent.click(toggleButton);

        const guidance_scale = screen.getByText(/Guidance scale/i);
        const seed = screen.getByText(/Seed/i);
        const scaling_mode = screen.getByText(/Choose image scaling mode/i);
        const model = screen.getByText(/Choose model/i);

        expect(guidance_scale).toBeInTheDocument();
        expect(seed).toBeInTheDocument();
        expect(scaling_mode).toBeInTheDocument();
        expect(model).toBeInTheDocument();
    });

    it('should start image generation and display image', async () => {
        vi.spyOn(Storage.prototype, 'getItem')
            .mockImplementation((key) => key === 'token' ? 'example-token' : null);

        renderAll(<ImageToImage />);

        const file = new File(['example-file-content'], 'example-file.png', { type: 'image/png' });
        const input = document.getElementById('file-input');
        const generateButton = await screen.findByText('Generate');

        await userEvent.upload(input, file);

        axios.post.mockResolvedValueOnce({ data: { image: 'base64image' } });

        await userEvent.click(generateButton);

        const resultImg = await screen.findByRole('img', { name: /preview/i });

        expect(resultImg.src).toContain('ZXhhbXBsZS1maWxlLWNvbnRlbnQ=');
    });

    it('should not start image generation, anonymous user', async () => {
        vi.spyOn(Storage.prototype, 'getItem')
            .mockImplementation(() => null);

        renderAll(<ImageToImage />);

        const file = new File(['example-file-content'], 'example-file.png', { type: 'image/png' });
        const input = document.getElementById('file-input');
        const generateButton = await screen.findByText('Generate');

        await userEvent.upload(input, file);
        await userEvent.click(generateButton);

        expect(toaster.create).toHaveBeenCalledWith({
            title: "Not logged in",
            description: "You must be logged in to generate images.",
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
    });

    it('should start image generation and not display image, backend error', async () => {
        vi.spyOn(Storage.prototype, 'getItem')
            .mockImplementation((key) => key === 'token' ? 'example-token' : null);

        renderAll(<ImageToImage />);

        const file = new File(['example-file-content'], 'example-file.png', { type: 'image/png' });
        const input = document.getElementById('file-input');
        const generateButton = await screen.findByText('Generate');

        await userEvent.upload(input, file);

        axios.post.mockRejectedValueOnce();

        await userEvent.click(generateButton);

        expect(toaster.create).toHaveBeenCalledWith({
            title: "Generation failed",
            description: "Could not generate image.",
            status: "error",
            duration: 3000,
            isClosable: true,
        });
    });
});
