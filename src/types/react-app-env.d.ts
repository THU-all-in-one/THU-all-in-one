// / <reference types="electron-react-template" />
interface Window {
    debug: (name: string, value: number) => void;
    credential: { username: string; password: string };
    info: {
        login: (credential: {
            username: string;
            password: string;
        }) => Promise<void>;
        getPublicNotification: () => Promise<
            {
                title: string;
                url: string;
            }[][]
        >;
    };
}
