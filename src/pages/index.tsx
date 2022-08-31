import type { NextPage } from "next";
import { FormEvent, useContext, useState } from "react";
import { Button, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { AuthContext } from "../contexts/AuthContext";
import { withSSRGuest } from "../utils/withSSRGuest";

const Home: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password,
    };

    await signIn(data);
  }

  return (
    <Flex h="100vh" w="100vw" align="center" justify="center" background="body">
      <Flex
        h="100%"
        w="100%"
        p="8"
        as="form"
        maxW={360}
        flexDir="column"
        align="center"
        justify="center"
        onSubmit={handleSubmit}
      >
        <Stack spacing={4} w="100%">
          <Text
            fontSize="24"
            fontWeight="600"
            color="purple.800"
            textAlign="center"
            mb="8"
          >
            LOGIN
          </Text>
          <Input
            p="6"
            type="email"
            fontWeight="600"
            background="gray.200"
            placeholder="E-mail"
            borderRadius="2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            p="6"
            fontWeight="600"
            type="password"
            placeholder="Password"
            background="gray.200"
            borderRadius="2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button p="6" borderRadius="2" colorScheme="purple" type="submit">
            LOGIN
          </Button>
        </Stack>
      </Flex>
    </Flex>
  );
};

export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {},
  };
});

export default Home;
