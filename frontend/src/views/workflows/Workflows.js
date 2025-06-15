import { Avatar, Card, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import {
  FaFileImage,
  FaImages,
  FaMagic,
} from "react-icons/fa";

import { BsBoundingBoxCircles } from "react-icons/bs";

const Workflows = () => {
    const navigate = useNavigate();

    return (

        <Flex align='center' justify='center'  width='100%' height='100%' bg='gray.100'>

            <Flex gap='4' direction='row' wrap='wrap' width='70%'>
                
                <Card.Root as='button' flex="1 1 40%" minWidth="250px" variant="elevated" height='auto' _hover={{ bg: "gray.200", cursor: "pointer" }} onClick={() => navigate("/views/generation/text-to-image")}>
                    <Card.Body gap='2'>
                        <Avatar.Root size='lg' shape='rounded' bg='blue.200'>
                           <FaFileImage/>
                        </Avatar.Root>
                        <Card.Title mb='2'>Text to Image</Card.Title>
                        <Card.Description>
                            Generates an image based on a text prompt
                        </Card.Description>
                    </Card.Body>
                </Card.Root>

                <Card.Root flex="1 1 40%" minWidth="250px" variant="elevated" height='auto' _hover={{ bg: "gray.200", cursor: "pointer" }} onClick={() => navigate("/views/generation/image-to-image")}>
                    <Card.Body gap='2'>
                        <Avatar.Root size='lg' shape='rounded' bg='green.200'>
                        <FaImages/>
                        </Avatar.Root>
                        <Card.Title mb='2'>Image to Image</Card.Title>
                        <Card.Description>
                            Transform an input image by providing a text prompt.
                        </Card.Description>
                    </Card.Body>
                </Card.Root>

                <Card.Root flex="1 1 40%" minWidth="250px" variant="elevated" height='auto' _hover={{ bg: "gray.200", cursor: "pointer" }} onClick={() => navigate("/views/generation/inpainting")}>
                    <Card.Body gap='2'>
                        <Avatar.Root size='lg' shape='rounded' bg='purple.200'>
                            <FaMagic/>
                        </Avatar.Root>
                        <Card.Title mb='2'>Inpainting</Card.Title>
                        <Card.Description>
                            Inpainting lets you paint out areas on the image that you want to change.
                        </Card.Description>
                    </Card.Body>
                </Card.Root>

                <Card.Root flex="1 1 40%" minWidth="250px" variant="elevated" height='auto' _hover={{ bg: "gray.200", cursor: "pointer" }} onClick={() => navigate("/views/generation/bounding-boxes")}>
                    <Card.Body gap='2'>
                        <Avatar.Root size='lg' shape='rounded' bg='yellow.200'>
                            <BsBoundingBoxCircles size='24'/>
                        </Avatar.Root>
                        <Card.Title mb='2'>Bounding Boxes</Card.Title>
                        <Card.Description>
                            Draw rectangular regions on an image to alter its appearance
                        </Card.Description>
                    </Card.Body>
                </Card.Root>

            </Flex>

        </Flex>

    );
}

export default Workflows;
