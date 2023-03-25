class ApiError extends Error {
    code: number;
    constructor(code: number, ...params: string[]) {
        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }

        this.name = `ApiError: ${code}`;
        this.code = code;
    }
}

enum ErrorCode {
    BAD_CREDENTIAL = 1,
    NOT_LOGGED_IN = 2,
    ERROR_FROM_ID = 3,
    ERROR_ROAMING = 4,
    INVALID_RESPONSE = 5,
    ASSERTION_FAILED = 6
}

export { ApiError, ErrorCode };
