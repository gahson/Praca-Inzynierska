
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
import Register from '../src/views/account/register/Register';

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


describe('Register process', () => {
    it('should render correctly', () => {
        renderAll(<Register />);

        const first_name_field = screen.getByPlaceholderText('First Name');
        const last_name_field = screen.getByPlaceholderText('Last Name');
        const email_field = screen.getByPlaceholderText('Email');
        const password_field = screen.getByPlaceholderText('Password')
        const register_button = screen.getByRole('button');

        expect(first_name_field).toBeInTheDocument();
        expect(last_name_field).toBeInTheDocument();
        expect(email_field).toBeInTheDocument();
        expect(password_field).toBeInTheDocument();
        expect(register_button).toBeInTheDocument();
    })

    it('should register, correct credentials', async () => {
        renderAll(<Register />);

        const user = userEvent.setup()

        const first_name_field = screen.getByPlaceholderText('First Name');
        const last_name_field = screen.getByPlaceholderText('Last Name');
        const email_field = screen.getByPlaceholderText('Email');
        const password_field = screen.getByPlaceholderText('Password')
        const register_button = screen.getByRole('button');

        await user.type(first_name_field, 'John');
        await user.type(last_name_field, 'Doe');
        await user.type(email_field, 'john.doe@example.com');
        await user.type(password_field, 'johndoe123');

        axios.post
            .mockResolvedValueOnce({
                data: {
                    message: 'User registered successfully',
                    user_id: '2137'
                }
            })
            .mockResolvedValueOnce({
                data: {
                    access_token: 'example-token',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john.doe@example.com',
                    role: 'user'
                }
            });

        await user.click(register_button);

        expect(axios.post).toHaveBeenNthCalledWith(
            1,
            `http://${location.hostname}:5555/auth/register`,
            {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                password: 'johndoe123',
                role: 'user',
            }
        );

        expect(axios.post).toHaveBeenNthCalledWith(
            2,
            `http://${location.hostname}:5555/auth/login`,
            {
                email: 'john.doe@example.com',
                password: 'johndoe123',
            }
        );

        expect(toaster.create).toHaveBeenCalledWith({
            title: "Account created!",
            status: "success",
            duration: 3000,
            isClosable: true,
        });

    })

    it('should not register, missing credentials', async () => {
        renderAll(<Register />);

        const user = userEvent.setup()

        // const first_name_field = screen.getByPlaceholderText('First Name'); //empty
        // const last_name_field = screen.getByPlaceholderText('Last Name'); //empty
        const email_field = screen.getByPlaceholderText('Email');
        const password_field = screen.getByPlaceholderText('Password')
        const register_button = screen.getByRole('button');

        // await user.type(first_name_field, 'Jane'); //empty
        // await user.type(last_name_field, 'Doe');  //empty
        await user.type(email_field, 'jane.doe@example.com');
        await user.type(password_field, 'janedoe123');

        await user.click(register_button);

        expect(axios.post).not.toHaveBeenCalled();

        expect(toaster.create).toHaveBeenCalledWith({
            title: "Missing fields",
            description: "Please fill in all the fields.",
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
    })

    it('should not register, invalid email', async () => {
        renderAll(<Register />);

        const user = userEvent.setup()

        const first_name_field = screen.getByPlaceholderText('First Name');
        const last_name_field = screen.getByPlaceholderText('Last Name');
        const email_field = screen.getByPlaceholderText('Email');
        const password_field = screen.getByPlaceholderText('Password')

        await user.type(first_name_field, 'Jane');
        await user.type(last_name_field, 'Doe');
        await user.type(email_field, 'johndoe%example.com');
        await user.type(password_field, 'janedoe123');

        const register_button = screen.getByRole('button');
        await user.click(register_button);

        expect(axios.post).not.toHaveBeenCalled();

        expect(toaster.create).toHaveBeenCalledWith({
            title: "Invalid email",
            description: "Please enter a valid email address.",
            status: "error",
            duration: 3000,
            isClosable: true,
        });
    })

    it('should not register, existing email', async () => {
        axios.post
            .mockRejectedValueOnce({
                data: {
                    detail: 'Email already registered'
                }
            })

        const user = userEvent.setup()
        renderAll(<Register />);

        const first_name_field = screen.getByPlaceholderText('First Name');
        const last_name_field = screen.getByPlaceholderText('Last Name');
        const email_field = screen.getByPlaceholderText('Email');
        const password_field = screen.getByPlaceholderText('Password');
        const register_button = screen.getByRole('button');

        await user.type(first_name_field, 'Jane');
        await user.type(last_name_field, 'Doe');
        await user.type(email_field, 'janedoe@example.com');
        await user.type(password_field, 'janedoe123');


        await user.click(register_button);
        expect(axios.post).toHaveBeenNthCalledWith(
            1,
            `http://${location.hostname}:5555/auth/register`,
            {
                first_name: 'Jane',
                last_name: 'Doe',
                email: 'janedoe@example.com',
                password: 'janedoe123',
                role: 'user',
            }
        );

        expect(toaster.create).toHaveBeenCalledWith({
            title: "Registration failed",
            description: "Something went wrong. Try again.",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    })


})