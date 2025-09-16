import { Wrap, Flex, Input, Button, Text } from "@chakra-ui/react";
import { FaTimes } from "react-icons/fa";

const FileInput = ({ id, label, filename, hasFile, onLoad, onRemove }) => (
  <Wrap width="100%">
    <Flex width="100%" align="center" justify="space-between">
      <Input
        type="file"
        accept="image/*"
        display="none"
        id={id}
        onChange={onLoad}
      />
      <Button as="label" htmlFor={id} cursor="pointer" color='black' backgroundColor='yellow.400' width="50%">
        {label}
      </Button>

      {hasFile ? (
        <Flex align="center" justify="flex-end" width="100%" maxW="300px">
          <Text>{filename}</Text>
          <Button colorScheme="red" variant="ghost" aria-label="Delete" onClick={onRemove}>
            <FaTimes size={20} />
          </Button>
        </Flex>
      ) : (
        <Text color="gray.500">No file loaded</Text>
      )}
    </Flex>
  </Wrap>
);

export default FileInput;
