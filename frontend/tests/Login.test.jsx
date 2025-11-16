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
import Login from '../src/views/account/login/Login';

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

describe('Login process', () => {
    it('should render correctly', () => {
        renderAll(<Login />)

        const email_field = screen.getByPlaceholderText('Email');
        const password_field = screen.getByPlaceholderText('Password');
        const login_button = screen.getByRole('button');

        expect(email_field).toBeInTheDocument();
        expect(password_field).toBeInTheDocument();
        expect(login_button).toBeInTheDocument();
    })

    it('should succesfully login, correct credentials', async () => {
        renderAll(<Login />)

        const user = userEvent.setup()

        const email_field = screen.getByPlaceholderText('Email');
        const password_field = screen.getByPlaceholderText('Password');
        const login_button = screen.getByRole('button');

        await user.type(email_field, 'john.doe@example.com');
        await user.type(password_field, 'johndoe123');

        axios.post.mockResolvedValueOnce({
            data: {
                access_token: 'example-token',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                role: 'user'
            }
        });

        await user.click(login_button);

        expect(axios.post).toHaveBeenCalledWith(
            `http://${location.hostname}:5555/auth/login`,
            {
                email: 'john.doe@example.com',
                password: 'johndoe123'
            }
        )

        expect(toaster.create).toHaveBeenCalledWith({
            title: 'Logged in successfully',
            status: "success",
            duration: 3000,
            isClosable: true,
        });

    })


    it('should fail login, incorrect credentials', async () => {
        renderAll(<Login />)

        const user = userEvent.setup()

        const email_field = screen.getByPlaceholderText('Email');
        const password_field = screen.getByPlaceholderText('Password');
        const login_button = screen.getByRole('button');

        await user.type(email_field, 'john.doe@example.com');
        await user.type(password_field, 'johndoe123');

        axios.post.mockRejectedValueOnce({
            data: {
                detail: `Invalid email or password`
            }
        });

        await user.click(login_button);

        expect(axios.post).toHaveBeenCalledWith(
            `http://${location.hostname}:5555/auth/login`,
            {
                email: 'john.doe@example.com',
                password: 'johndoe123'
            }
        )

        expect(toaster.create).toHaveBeenCalledWith({
            title: 'Login failed',
            description: 'Login failed. Please check your credentials and try again.',
            status: "error",
            duration: 4000,
            isClosable: true,
        });

    })

    it('should fail login, missing credentials', async () => {
        renderAll(<Login />)

        const user = userEvent.setup()

        // const email_field = screen.getByPlaceholderText('Email'); //empty
        const password_field = screen.getByPlaceholderText('Password');
        const login_button = screen.getByRole('button');

        //await user.type(email_field, 'john.doe@example.com'); //empty
        await user.type(password_field, 'johndoe123');

        await user.click(login_button);

        expect(axios.post).not.toHaveBeenCalled();

        expect(toaster.create).toHaveBeenCalledWith({
            title: 'Missing fields',
            description: 'Please enter both email and password.',
            status: "warning",
            duration: 3000,
            isClosable: true,
        });

    })

        it('should fail login, invalid email', async () => {
        renderAll(<Login />)

        const user = userEvent.setup()

        const email_field = screen.getByPlaceholderText('Email'); //empty
        const password_field = screen.getByPlaceholderText('Password');
        const login_button = screen.getByRole('button');

        await user.type(email_field, 'john.doe%example.com'); //empty
        await user.type(password_field, 'johndoe123');

        await user.click(login_button);

        expect(axios.post).not.toHaveBeenCalled();

        expect(toaster.create).toHaveBeenCalledWith({
            title: 'Invalid email',
            description: 'Please enter a valid email address.',
            status: "error",
            duration: 3000,
            isClosable: true,
        });

    })

})