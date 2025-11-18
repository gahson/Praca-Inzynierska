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
import Inpainting from '../src/views/workflows/inpainting/Inpainting';

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

describe('Inpainting', () => {
    it('should render workflow correctly', () => {
        renderAll(<Inpainting />);

        const header = screen.getByText('Inpainting');
        const dragDropText = screen.getByText('Drag and drop files here');
        const imagePlaceholder = screen.getByText('Generated image will appear here');
        const advancedParamsButton = screen.getByText('Show advanced parameters ▼');

        expect(header).toBeInTheDocument();
        expect(dragDropText).toBeInTheDocument();
        expect(imagePlaceholder).toBeInTheDocument();
        expect(advancedParamsButton).toBeInTheDocument();
    })

    it('should show advanced parameters', async () => {
        renderAll(<Inpainting />);

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

});