import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "";

export const LinearLoginCodeEmail = ({ url }: { url: string }) => (
    <Html>
        <Head />
        <Preview>Welcome to Budgetist</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/static/logo.png`}
                    width="42"
                    height="42"
                    alt="Budgetist"
                    style={logo}
                />
                <Heading style={heading}>Your login code for Budgetist</Heading>
                <Section style={buttonContainer}>
                    <Button style={button} href={url}>
                        Login to Budgetist
                    </Button>
                </Section>
                <Text style={paragraph}>
                    This link and code will only be valid for the next 15 minutes. If the
                    link does not work, you can use the login verification code directly:
                </Text>
                <Hr style={hr} />
                <Link href="https://budgetist.vercel.app" style={reportLink}>
                    Budgetist
                </Link>
            </Container>
        </Body>
    </Html>
);

export default LinearLoginCodeEmail;

const logo = {
    borderRadius: 21,
    width: 42,
    height: 42,
};

const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
};

const heading = {
    fontSize: "24px",
    letterSpacing: "-0.5px",
    lineHeight: "1.3",
    fontWeight: "400",
    color: "#484848",
    padding: "17px 0 0",
};

const paragraph = {
    margin: "0 0 15px",
    fontSize: "15px",
    lineHeight: "1.4",
    color: "#3c4149",
};

const buttonContainer = {
    padding: "27px 0 27px",
};

const button = {
    backgroundColor: "#5e6ad2",
    borderRadius: "3px",
    fontWeight: "600",
    color: "#fff",
    fontSize: "15px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "11px 23px",
};

const reportLink = {
    fontSize: "14px",
    color: "#b4becc",
};

const hr = {
    borderColor: "#dfe1e4",
    margin: "42px 0 26px",
};

