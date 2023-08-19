export const convertErrorResponseToString = (error) => {
    if (error.response) {
        try {
            const errorMessage = error.response.data;
            return `${errorMessage.code}: ${errorMessage.message}`;
        } catch (e) {}

        return `Server status ${error.response.status}`;
    }

    return error.toString();
};
