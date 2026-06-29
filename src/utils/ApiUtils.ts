export const convertErrorResponseToString = (error) => {
    if (error.response) {
        const data = error.response.data;

        if (data && data.code !== undefined && data.message !== undefined) {
            return `${data.code}: ${data.message}`;
        }

        return `Server status ${error.response.status}`;
    }

    return error.toString();
};
