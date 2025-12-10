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
import Gallery from '../src/views/gallery/Gallery';

// Mock toaster and axios
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

describe('Gallery', () => {
    it('should render gallery correctly, no images', () => {
        renderAll(<Gallery />);
        const your_gallery = screen.getByText('Your Gallery');
        const loading_gallery = screen.getByText('Loading gallery...');

        expect(your_gallery).toBeInTheDocument();
        expect(loading_gallery).toBeInTheDocument();
    })

    it('should not render gallery, empty auth token', async () => {
        axios.get.mockRejectedValueOnce();

        renderAll(<Gallery />);

        await screen.findByText("Your Gallery"); //wait for call

        expect(axios.get).toHaveBeenCalledWith(
            `/api/gallery`,
            {
                headers: {
                    Authorization: `Bearer null`,
                },
                params: {
                    page: 1,
                    page_size: 16,
                },
            }
        );
        
        expect(toaster.create).toHaveBeenCalledWith({
            title: "Error",
            description: "Unable to load gallery.",
            status: "error",
            duration: 3000,
            isClosable: true,
        });
    })

    it('should render common parameters correctly', async () => {
        axios.get
            .mockResolvedValueOnce({
                data: {
                    page: 1,
                    page_size: 10,
                    total_pages: 1,
                    images: [
                        {
                            id: "1",
                            image_base64: "example_image",
                            model: "example_model",
                            mode: "text-to-image",
                            prompt: "example_prompt",
                            negative_prompt: "example_negative_prompt",
                            guidance_scale: 7,
                            seed: 12345,
                            width: 512,
                            height: 512,
                            created_at: "2025-11-16T14:39:00Z",
                            scaling_mode: "example_scaling_mode"
                        }]
                }
            })

        renderAll(<Gallery />);
        const your_gallery = screen.getByText(/Your Gallery/i);
        const loading_gallery = screen.getByText(/Loading gallery.../i);

        const img = await screen.findByRole('img');
        const model = await screen.findByText('Model:');
        const mode = await screen.findByText('Mode:');
        const size = await screen.findByText('Size:');
        const scaling_mode = await screen.findByText('Scaling mode:');
        const prompt = await screen.findByText('Prompt:');
        const seed = await screen.findByText('Seed:');
        const guidance = await screen.findByText('Guidance:');
        const created = await screen.findByText('Created:');

        const model_value = model.parentElement;
        const mode_value = mode.parentElement;
        const size_value = size.parentElement;
        const scaling_mode_value = scaling_mode.parentElement;
        const prompt_value = prompt.parentElement;
        const seed_value = seed.parentElement;
        const guidance_value = guidance.parentElement;
        const created_value = created.parentElement;

        expect(loading_gallery).not.toBeInTheDocument();
        expect(your_gallery).toBeInTheDocument();

        expect(img).toBeInTheDocument();
        expect(model).toBeInTheDocument();
        expect(mode).toBeInTheDocument();
        expect(size).toBeInTheDocument();
        expect(scaling_mode).toBeInTheDocument();
        expect(prompt).toBeInTheDocument();
        expect(seed).toBeInTheDocument();
        expect(guidance).toBeInTheDocument();
        expect(created).toBeInTheDocument();

        expect(model_value).toHaveTextContent('example_model')
        expect(mode_value).toHaveTextContent('text-to-image')
        expect(size_value).toHaveTextContent('512 × 512')
        expect(scaling_mode_value).toHaveTextContent('example_scaling_mode')
        expect(prompt_value).toHaveTextContent('example_prompt')
        expect(seed_value).toHaveTextContent('12345')
        expect(guidance_value).toHaveTextContent('7')
        expect(created_value).toHaveTextContent('11/16/2025, 3:39:00 PM')
    })

    it('should render controlnet parameters correctly', async () => {
        axios.get
            .mockResolvedValueOnce({
                data: {
                    page: 1,
                    page_size: 10,
                    total_pages: 1,
                    images: [
                        {
                            id: "1",
                            image_base64: "example_image",
                            model: "example_model",
                            mode: "controlnet",
                            prompt: "example_prompt",
                            negative_prompt: "example_negative_prompt",
                            guidance_scale: 7,
                            seed: 12345,
                            width: 512,
                            height: 512,
                            created_at: "2025-11-16T14:39:00Z",
                            scaling_mode: "example_scaling_mode",
                            canny_low_threshold: 0.1,
                            canny_high_threshold: 0.9,
                        }]
                }
            })

        renderAll(<Gallery />);
        const your_gallery = screen.getByText(/Your Gallery/i);
        const loading_gallery = screen.getByText(/Loading gallery.../i);

        const canny_low = await screen.findByText('Canny low threshold:');
        const canny_high = await screen.findByText('Canny high threshold:');

        const canny_low_value = canny_low.parentElement;
        const canny_high_value = canny_high.parentElement;

        expect(loading_gallery).not.toBeInTheDocument();
        expect(your_gallery).toBeInTheDocument();

        expect(canny_high).toBeInTheDocument();
        expect(canny_low).toBeInTheDocument();

        expect(canny_low_value).toHaveTextContent('0.1')
        expect(canny_high_value).toHaveTextContent('0.9')
    })

    it('should render outpainting parameters correctly', async () => {
        axios.get
            .mockResolvedValueOnce({
                data: {
                    page: 1,
                    page_size: 10,
                    total_pages: 1,
                    images: [
                        {
                            id: "1",
                            image_base64: "example_image",
                            model: "example_model",
                            mode: "outpainting",
                            prompt: "example_prompt",
                            negative_prompt: "example_negative_prompt",
                            guidance_scale: 7,
                            seed: 12345,
                            width: 512,
                            height: 512,
                            created_at: "2025-11-16T14:39:00Z",
                            scaling_mode: "example_scaling_mode",
                            pad_left: 32,
                            pad_right: 32,
                            pad_top: 32,
                            pad_bottom: 32
                        }]
                }
            })

        renderAll(<Gallery />);
        const your_gallery = screen.getByText(/Your Gallery/i);
        const loading_gallery = screen.getByText(/Loading gallery.../i);

        const pad_left = await screen.findByText('Pad left:');
        const pad_right = await screen.findByText('Pad right:');
        const pad_top = await screen.findByText('Pad top:');
        const pad_bottom = await screen.findByText('Pad bottom:');

        const pad_left_value = pad_left.parentElement;
        const pad_right_value = pad_right.parentElement;
        const pad_top_value = pad_top.parentElement;
        const pad_bottom_value = pad_bottom.parentElement;

        expect(loading_gallery).not.toBeInTheDocument();
        expect(your_gallery).toBeInTheDocument();

        expect(pad_left).toBeInTheDocument();
        expect(pad_right).toBeInTheDocument();
        expect(pad_top).toBeInTheDocument();
        expect(pad_bottom).toBeInTheDocument();

        expect(pad_left_value).toHaveTextContent('32')
        expect(pad_right_value).toHaveTextContent('32')
        expect(pad_top_value).toHaveTextContent('32')
        expect(pad_bottom_value).toHaveTextContent('32')
    })

    it('should fail deleting image, empty auth token', async () => {
        axios.get
            .mockResolvedValueOnce({
                data: {
                    page: 1,
                    page_size: 10,
                    total_pages: 1,
                    images: [
                        {
                            id: "1",
                            image_base64: "example_image",
                            model: "example_model",
                            mode: "text-to-image",
                            prompt: "example_prompt",
                            negative_prompt: "example_negative_prompt",
                            guidance_scale: 7,
                            seed: 12345,
                            width: 512,
                            height: 512,
                            created_at: "2025-11-16T14:39:00Z",
                            scaling_mode: "example_scaling_mode"
                        }]
                }
            });

        axios.delete.mockRejectedValueOnce();

        renderAll(<Gallery />);

        const user = userEvent.setup()

        const deleteButton = await screen.findByRole('button', { name: /Delete/i });

        await user.click(deleteButton);

        expect(axios.delete).toHaveBeenCalledWith(
            `/api/gallery/1`,
            {
                headers: {
                    Authorization: `Bearer null`,
                },
            }
        );

        expect(toaster.create).toHaveBeenCalledWith({
            title: "Error",
            description: "Failed to delete image.",
            status: "error",
            duration: 3000,
            isClosable: true,
        });

    })

    it('should fail deleting image, empty auth token', async () => {
        axios.get
            .mockResolvedValueOnce({
                data: {
                    page: 1,
                    page_size: 10,
                    total_pages: 1,
                    images: [
                        {
                            id: "1",
                            image_base64: "example_image",
                            model: "example_model",
                            mode: "text-to-image",
                            prompt: "example_prompt",
                            negative_prompt: "example_negative_prompt",
                            guidance_scale: 7,
                            seed: 12345,
                            width: 512,
                            height: 512,
                            created_at: "2025-11-16T14:39:00Z",
                            scaling_mode: "example_scaling_mode"
                        }]
                }
            });

        axios.delete.mockResolvedValueOnce();

        renderAll(<Gallery />);

        const user = userEvent.setup()

        const deleteButton = await screen.findByRole('button', { name: /Delete/i });

        await user.click(deleteButton);

        expect(toaster.create).toHaveBeenCalledWith({
            title: "Deleted",
            description: "Image deleted successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });

    })


})