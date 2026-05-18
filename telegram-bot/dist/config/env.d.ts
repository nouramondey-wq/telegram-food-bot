export declare const env: {
    bot: {
        token: string;
        username: string;
        mode: string;
        webhookUrl: string;
        webhookSecret: string;
    };
    firebase: {
        projectId: string;
        privateKey: string;
        clientEmail: string;
    };
    miniApp: {
        url: string;
    };
    restaurant: {
        name: string;
        phone: string;
        address: string;
        latitude: number;
        longitude: number;
        workingHours: string;
        instagram: string;
    };
    admin: {
        chatIds: string[];
    };
    security: {
        rateLimitMaxPerSecond: number;
        rateLimitBlockSeconds: number;
    };
    deployment: {
        publicUrl: string;
    };
};
export declare function validateEnv(): void;
//# sourceMappingURL=env.d.ts.map