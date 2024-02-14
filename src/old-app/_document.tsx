import Document, {
    Html,
    Main,
    NextScript,
    DocumentProps,
} from "next/document";

type Props = Record<string, unknown> & DocumentProps;

class MyDocument extends Document<Props> {
    render() {
        return (
            <Html lang="en">
                <body className="desktop-transparent bg-gray-100 dark:bg-dark-primary">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
